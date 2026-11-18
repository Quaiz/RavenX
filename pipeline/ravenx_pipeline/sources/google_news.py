import time
from typing import Any, List, Tuple
from urllib.parse import quote
import feedparser

from ravenx_pipeline.sources.base import BaseSource


class GoogleNewsSource(BaseSource):
    name = "google_news"

    def fetch(self, conn: Any = None) -> Tuple[List[dict], int | None]:
        base_url = self.config["base_url"]
        queries = self.config.get("queries", [])
        timeout = self.config.get("timeout_seconds", 10)
        delay = self.config.get("request_delay_seconds", 1.0)
        hl = self.config.get("hl", "en-US")
        gl = self.config.get("gl", "US")
        ceid = self.config.get("ceid", "US:en")

        raw_records: List[dict] = []
        last_status: int | None = None

        for idx, q in enumerate(queries):
            if idx > 0 and delay > 0:
                time.sleep(delay)
            url = f"{base_url}?q={quote(q)}&hl={hl}&gl={gl}&ceid={ceid}"
            resp = self.session.get(url, timeout=timeout)
            last_status = resp.status_code
            resp.raise_for_status()
            feed = feedparser.parse(resp.content)
            for entry in feed.entries:
                raw_records.append(
                    {
                        "query": q,
                        "id": entry.get("id") or entry.get("link"),
                        "title": entry.get("title"),
                        "link": entry.get("link"),
                        "published": entry.get("published") or entry.get("updated"),
                        "summary": entry.get("summary") or entry.get("description"),
                        "source": dict(entry.get("source", {})) if isinstance(entry.get("source"), dict) else None,
                    }
                )
        return raw_records, last_status

    def parse(self, raw_records: List[dict]) -> List[dict]:
        parsed = []
        for rec in raw_records:
            parsed.append(
                {
                    "source_event_id": rec.get("id"),
                    "event_type": "article",
                    "title": rec.get("title"),
                    "summary": rec.get("summary"),
                    "url": rec.get("link"),
                    "language": "en",
                    "published_at": rec.get("published"),
                    "lat": None,
                    "lon": None,
                    "country": None,
                    "magnitude": None,
                    "payload": rec,
                }
            )
        return parsed
