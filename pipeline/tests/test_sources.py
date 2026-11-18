import json
import os
from unittest.mock import MagicMock
import feedparser
import pytest

from ravenx_pipeline.sources.usgs import USGSSource
from ravenx_pipeline.sources.google_news import GoogleNewsSource
from ravenx_pipeline.sources.gdelt import GDELTSource

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def test_usgs_parse_fixture():
    with open(os.path.join(FIXTURES, "usgs_sample.json"), encoding="utf-8") as f:
        data = json.load(f)
    src = USGSSource({"base_url": "https://example.com"})
    parsed = src.parse(data["features"])
    assert len(parsed) == 2
    assert parsed[0]["source_event_id"] == "us7000abc1"
    assert parsed[0]["event_type"] == "earthquake"
    assert parsed[0]["lat"] == 38.25
    assert parsed[0]["lon"] == 141.35
    assert parsed[0]["magnitude"] == 5.4


def test_google_news_parse_fixture():
    with open(os.path.join(FIXTURES, "google_news_sample.xml"), "rb") as f:
        feed = feedparser.parse(f.read())
    raw = [
        {
            "id": e.get("id") or e.get("link"),
            "title": e.get("title"),
            "link": e.get("link"),
            "published": e.get("published"),
            "summary": e.get("summary"),
        }
        for e in feed.entries
    ]
    src = GoogleNewsSource({"base_url": "https://example.com"})
    parsed = src.parse(raw)
    assert len(parsed) == 2
    assert parsed[0]["title"] == "Naval Drills Expand in South China Sea - Reuters"
    assert parsed[1]["event_type"] == "article"


def test_gdelt_parse_fixture_and_handles_empty_or_html():
    with open(os.path.join(FIXTURES, "gdelt_sample.json"), encoding="utf-8") as f:
        data = json.load(f)
    src = GDELTSource({"base_url": "https://example.com", "query": "conflict", "min_interval_seconds": 0})
    parsed = src.parse(data["articles"])
    assert len(parsed) == 2
    assert parsed[0]["country"] == "United States"

    # Empty response handled gracefully
    empty_resp = MagicMock(status_code=200, text="   ")
    empty_resp.raise_for_status = MagicMock()
    src.session = MagicMock()
    src.session.get.return_value = empty_resp
    recs, status = src.fetch()
    assert recs == [] and status == 200

    # Non-JSON HTML error page raises clear ValueError
    html_resp = MagicMock(status_code=200, text="<html>Rate Limited</html>")
    html_resp.raise_for_status = MagicMock()
    html_resp.json.side_effect = ValueError("No JSON object could be decoded")
    src.session.get.return_value = html_resp
    with pytest.raises(ValueError):
        src.fetch()
