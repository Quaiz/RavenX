import logging
import time
from typing import Any, List, Tuple

from ravenx_pipeline.sources.base import BaseSource

logger = logging.getLogger("ravenx_pipeline.gdelt")


class GDELTSource(BaseSource):
    name = "gdelt"
    _last_request_ts: float = 0.0

    def fetch(self, conn: Any = None) -> Tuple[List[dict], int | None]:
        min_interval = self.config.get("min_interval_seconds", 5.0)
        elapsed = time.monotonic() - self._last_request_ts
        if self._last_request_ts > 0 and elapsed < min_interval:
            time.sleep(min_interval - elapsed)

        params = {
            "query": self.config["query"],
            "mode": "ArtList",
            "maxrecords": self.config.get("maxrecords", 50),
            "format": "json",
            "timespan": self.config.get("timespan", "1h"),
        }
        timeout = self.config.get("timeout_seconds", 15)
        self._last_request_ts = time.monotonic()
        resp = self.session.get(self.config["base_url"], params=params, timeout=timeout)
        status = resp.status_code
        resp.raise_for_status()

        text = (resp.text or "").strip()
        if not text:
            logger.warning("GDELT returned empty response body (HTTP %s)", status)
            return [], status

        try:
            data = resp.json()
        except ValueError as e:
            raise ValueError(f"GDELT returned non-JSON response: {text[:120]}") from e

        articles = data.get("articles") or []
        return articles, status

    def parse(self, raw_records: List[dict]) -> List[dict]:
        parsed = []
        for art in raw_records:
            parsed.append(
                {
                    "source_event_id": art.get("url"),
                    "event_type": "article",
                    "title": art.get("title"),
                    "summary": art.get("domain"),
                    "url": art.get("url"),
                    "language": art.get("language") or "en",
                    "published_at": art.get("seendate"),
                    "lat": None,
                    "lon": None,
                    "country": art.get("sourcecountry"),
                    "magnitude": None,
                    "payload": art,
                }
            )
        return parsed
