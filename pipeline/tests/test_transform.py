import gzip
import json
from datetime import datetime, timezone
from ravenx_pipeline.raw_store import write_raw_jsonl_gz
from ravenx_pipeline.dedup import normalize_url, compute_title_hash, dedup_batch
from ravenx_pipeline.normalize import normalize_event


def test_raw_store_writes_partitioned_jsonl_gz(tmp_path):
    dt = datetime(2026, 11, 18, 12, 0, tzinfo=timezone.utc)
    rel = write_raw_jsonl_gz("usgs", "run-abc", [{"id": "us1"}, {"id": "us2"}], ts=dt, raw_dir=str(tmp_path))
    assert rel == "data/raw/usgs/2026/11/18/run-abc.jsonl.gz"

    full = tmp_path / "usgs" / "2026" / "11" / "18" / "run-abc.jsonl.gz"
    with gzip.open(full, "rt", encoding="utf-8") as f:
        lines = [json.loads(line) for line in f]
    assert lines == [{"id": "us1"}, {"id": "us2"}]


def test_dedup_url_and_title_hash():
    u1 = normalize_url("HTTPS://Example.COM/news/story/?utm_source=twitter&id=42&fbclid=xyz#top")
    u2 = normalize_url("https://example.com/news/story?id=42")
    assert u1 == u2 == "https://example.com/news/story?id=42"

    # Cross-source title hash strips Google News publisher suffix
    h1 = compute_title_hash("Missile strike reported near Black Sea! - Reuters")
    h2 = compute_title_hash("Missile strike reported near Black Sea")
    assert h1 == h2


def test_normalize_and_rejection():
    now = datetime(2026, 11, 18, 12, 0, tzinfo=timezone.utc)

    # Valid event: empty strings become None, epoch ms -> UTC naive
    ok, err = normalize_event(
        {
            "event_type": "earthquake",
            "source_event_id": "us7000",
            "title": "M 5.1 - Tonga",
            "summary": "   ",
            "url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000?utm_medium=rss",
            "published_at": 1795003200000,
            "lat": -20.5,
            "lon": -175.2,
            "magnitude": "5.1",
        },
        source="usgs",
        raw_path="data/raw/usgs/2026/11/18/r1.jsonl.gz",
        run_id="r1",
        ingested_at=now,
    )
    assert err is None
    assert ok["summary"] is None
    assert ok["magnitude"] == 5.1
    assert ok["published_at"].year == 2026

    # Invalid coordinates rejected
    bad_coord, err2 = normalize_event(
        {"event_type": "earthquake", "title": "Bad", "lat": 95.0, "lon": 10.0},
        source="usgs",
        raw_path="raw.gz",
        run_id="r1",
        ingested_at=now,
    )
    assert bad_coord is None and err2 == "invalid_coordinates"

    # Missing title and url rejected
    bad_empty, err3 = normalize_event(
        {"event_type": "article", "title": "  ", "url": ""},
        source="gdelt",
        raw_path="raw.gz",
        run_id="r1",
        ingested_at=now,
    )
    assert bad_empty is None and err3 == "missing_title_and_url"


def test_dedup_batch_removes_duplicates():
    now = datetime(2026, 11, 18, 12, 0, tzinfo=timezone.utc)
    e1, _ = normalize_event({"event_type": "article", "title": "Port Strike - BBC", "url": "https://bbc.com/1"}, "google_news", "r", "1", now)
    e2, _ = normalize_event({"event_type": "article", "title": "Port Strike", "url": "https://bbc.com/1?utm_source=x"}, "gdelt", "r", "1", now)
    unique, dups = dedup_batch([e1, e2])
    assert len(unique) == 1
    assert dups == 1
