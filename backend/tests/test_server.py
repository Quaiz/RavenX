import os
import sys
import json
from unittest.mock import patch, MagicMock
import pytest

# Ensure backend/ is importable and use an isolated test SQLite DB
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


@pytest.fixture
def client(tmp_path, monkeypatch):
    test_db = tmp_path / "test_ravenx.db"
    monkeypatch.delenv("TURSO_DATABASE_URL", raising=False)
    monkeypatch.delenv("TURSO_AUTH_TOKEN", raising=False)
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")

    import server
    monkeypatch.setattr(server, "DB_PATH", str(test_db))
    server.init_db()
    server.app.config["TESTING"] = True
    server.limiter.enabled = False
    with server.app.test_client() as test_client:
        yield test_client, server


def test_health_and_radiation(client):
    test_client, _ = client
    res = test_client.get("/api/health")
    assert res.status_code == 200

    rad = test_client.get("/api/radiation")
    assert rad.status_code == 200
    data = rad.get_json()
    assert data["simulated"] is True
    assert "nSv_h" in data


def test_ssrf_url_validator(client):
    _, server = client
    assert server._is_safe_public_url("http://127.0.0.1:5000/api/health") is False
    assert server._is_safe_public_url("http://169.254.169.254/latest/meta-data/") is False
    assert server._is_safe_public_url("http://10.0.0.1/admin") is False
    assert server._is_safe_public_url("file:///etc/passwd") is False
    assert server._is_safe_public_url("https://8.8.8.8/dns-query") is True


def test_auth_register_login_and_password_revokes_sessions(client):
    test_client, _ = client

    reg = test_client.post(
        "/api/auth/register",
        json={"username": "tester_op", "password": "secret123"},
    )
    assert reg.status_code == 200
    token1 = reg.get_json()["token"]

    # Token works for protected layout endpoint
    layout_res = test_client.get(
        "/api/layout",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert layout_res.status_code == 200

    # Changing password must invalidate existing sessions
    upd = test_client.put(
        "/api/auth/update",
        headers={"Authorization": f"Bearer {token1}"},
        json={"old_password": "secret123", "new_password": "newsecret456"},
    )
    assert upd.status_code == 200

    layout_after = test_client.get(
        "/api/layout",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert layout_after.status_code == 401

    # Login with new password works
    login_res = test_client.post(
        "/api/auth/login",
        json={"username": "tester_op", "password": "newsecret456"},
    )
    assert login_res.status_code == 200
    assert "token" in login_res.get_json()


def test_ai_chat_requires_auth_and_preserves_3_tier_models(client):
    test_client, server = client

    # Unauthenticated request rejected
    unauth = test_client.post("/api/ai/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert unauth.status_code == 401

    reg = test_client.post(
        "/api/auth/register",
        json={"username": "ai_op", "password": "secret123"},
    )
    token = reg.get_json()["token"]

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.iter_content.return_value = [b'data: {"choices":[{"delta":{"content":"OK"}}]}\n\n']

    with patch.object(server._session, "post", return_value=mock_resp) as mock_post:
        res = test_client.post(
            "/api/ai/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "model": "openai/gpt-oss-120b",
                "messages": [{"role": "user", "content": "status"}],
                "max_tokens": 9999,
            },
        )
        assert res.status_code == 200
        sent_payload = mock_post.call_args.kwargs["json"]
        # Tier-2 model must NOT be collapsed back onto qwen/qwen3.8-27b
        assert sent_payload["model"] == "openai/gpt-oss-120b"
        assert sent_payload["max_tokens"] == 450


def test_military_bases_fallback_on_sparql_failure(client):
    test_client, server = client
    server._cache.pop("MILITARY_BASES", None)

    with patch.object(server._session, "get", side_effect=Exception("Wikidata timeout")):
        res = test_client.get("/api/military-bases")
        assert res.status_code == 200
        data = res.get_json()
        assert data["count"] > 0
        assert len(data["bases"]) == data["count"]
