from datetime import datetime, timezone
from ravenx_pipeline.db import init_db, get_connection, upsert_events
from ravenx_pipeline.runs import record_run


def test_db_init_and_idempotent_upsert(tmp_path):
    db_file = str(tmp_path / "test.duckdb")
    init_db(db_file)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    batch = [
        {
            "event_id": "evt-1",
            "source": "usgs",
            "source_event_id": "us123",
            "event_type": "earthquake",
            "title": "M 4.5 - Near Coast of Japan",
            "summary": None,
            "url": "https://earthquake.usgs.gov/earthquakes/eventpage/us123",
            "url_normalized": "https://earthquake.usgs.gov/earthquakes/eventpage/us123",
            "language": "en",
            "published_at": now,
            "ingested_at": now,
            "lat": 35.1,
            "lon": 140.2,
            "country": "JP",
            "magnitude": 4.5,
            "title_hash": "hash-usgs-1",
            "payload_json": "{}",
            "raw_path": "data/raw/usgs/2026/11/18/run1.jsonl.gz",
            "run_id": "run1",
        }
    ]

    with get_connection(db_file) as conn:
        ins1, dup1 = upsert_events(conn, batch)
        assert (ins1, dup1) == (1, 0)

        # Re-running the exact same batch must not duplicate
        ins2, dup2 = upsert_events(conn, batch)
        assert (ins2, dup2) == (0, 1)

        total = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        assert total == 1

        record_run(
            conn,
            {
                "run_id": "run1",
                "source": "usgs",
                "started_at": now,
                "finished_at": now,
                "status": "ok",
                "http_status": 200,
                "fetched": 1,
                "inserted": 1,
                "duplicates": 0,
                "rejected": 0,
                "errors": 0,
                "duration_ms": 42,
                "error_message": None,
            },
        )
        run_cnt = conn.execute("SELECT COUNT(*) FROM ingestion_runs").fetchone()[0]
        assert run_cnt == 1
