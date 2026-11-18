import json
import os
from unittest.mock import MagicMock

from ravenx_pipeline.db import get_connection, init_db
from ravenx_pipeline.scheduler import run_source_once
from ravenx_pipeline.sources.gdelt import GDELTSource
from ravenx_pipeline.sources.google_news import GoogleNewsSource
from ravenx_pipeline.sources.usgs import USGSSource

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def test_end_to_end_pipeline_idempotent_and_isolated(tmp_path):
    db_file = str(tmp_path / "e2e.duckdb")
    raw_dir = str(tmp_path / "raw")
    init_db(db_file)

    # 1. Mock USGS
    with open(os.path.join(FIXTURES, "usgs_sample.json"), "rb") as f:
        usgs_bytes = f.read()
    usgs_src = USGSSource({"base_url": "https://usgs.test"})
    usgs_resp = MagicMock(status_code=200)
    usgs_resp.json.return_value = json.loads(usgs_bytes)
    usgs_src.session = MagicMock()
    usgs_src.session.get.return_value = usgs_resp

    r1 = run_source_once(usgs_src, db_path=db_file, raw_dir=raw_dir)
    assert r1["status"] == "ok"
    assert r1["fetched"] == 2
    assert r1["inserted"] == 2
    assert r1["duplicates"] == 0

    # Re-run identical batch -> 0 inserted, 2 duplicates
    r1_again = run_source_once(usgs_src, db_path=db_file, raw_dir=raw_dir)
    assert r1_again["inserted"] == 0
    assert r1_again["duplicates"] == 2

    # 2. Mock Google News + GDELT cross-source title_hash dedup
    with open(os.path.join(FIXTURES, "google_news_sample.xml"), "rb") as f:
        gnews_xml = f.read()
    gn_src = GoogleNewsSource({"base_url": "https://gn.test", "queries": ["geopolitics"], "request_delay_seconds": 0})
    gn_resp = MagicMock(status_code=200, content=gnews_xml)
    gn_src.session = MagicMock()
    gn_src.session.get.return_value = gn_resp

    r_gn = run_source_once(gn_src, db_path=db_file, raw_dir=raw_dir)
    assert r_gn["status"] == "ok"
    assert r_gn["inserted"] == 2

    with open(os.path.join(FIXTURES, "gdelt_sample.json"), encoding="utf-8") as f:
        gdelt_text = f.read()
    gd_src = GDELTSource({"base_url": "https://gd.test", "query": "conflict", "min_interval_seconds": 0})
    gd_resp = MagicMock(status_code=200, text=gdelt_text)
    gd_resp.json.return_value = json.loads(gdelt_text)
    gd_src.session = MagicMock()
    gd_src.session.get.return_value = gd_resp

    r_gd = run_source_once(gd_src, db_path=db_file, raw_dir=raw_dir)
    assert r_gd["status"] == "ok"
    # "Naval Drills Expand in South China Sea" collides with Google News title_hash!
    assert r_gd["inserted"] == 1
    assert r_gd["duplicates"] == 1

    # 3. Failing source records 'failed' without crashing
    bad_src = GDELTSource({"base_url": "https://gd.test", "query": "conflict", "min_interval_seconds": 0})
    bad_src.session = MagicMock()
    bad_src.session.get.side_effect = RuntimeError("Upstream 503")
    r_fail = run_source_once(bad_src, db_path=db_file, raw_dir=raw_dir)
    assert r_fail["status"] == "failed"
    assert "Upstream 503" in r_fail["error_message"]

    with get_connection(db_file) as conn:
        ev_cnt = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        run_cnt = conn.execute("SELECT COUNT(*) FROM ingestion_runs").fetchone()[0]
        assert ev_cnt == 5  # 2 USGS + 2 Google News + 1 unique GDELT
        assert run_cnt == 5
