from datetime import datetime, timedelta, timezone
from typing import Any, List, Tuple

from ravenx_pipeline.db import get_last_published_at
from ravenx_pipeline.sources.base import BaseSource


class USGSSource(BaseSource):
    name = "usgs"

    def fetch(self, conn: Any = None) -> Tuple[List[dict], int | None]:
        base_url = self.config["base_url"]
        timeout = self.config.get("timeout_seconds", 12)
        min_mag = self.config.get("min_magnitude", 2.5)
        lookback_hours = self.config.get("initial_lookback_hours", 24)

        last_dt = get_last_published_at(conn, self.name) if conn is not None else None
        if last_dt is not None:
            start_dt = last_dt.replace(tzinfo=timezone.utc) + timedelta(seconds=1)
        else:
            start_dt = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)

        params = {
            "format": "geojson",
            "starttime": start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            "minmagnitude": min_mag,
            "orderby": "time-asc",
        }
        resp = self.session.get(base_url, params=params, timeout=timeout)
        status = resp.status_code
        resp.raise_for_status()
        data = resp.json()
        features = data.get("features", [])
        return features, status

    def parse(self, raw_records: List[dict]) -> List[dict]:
        parsed = []
        for feat in raw_records:
            props = feat.get("properties") or {}
            geom = feat.get("geometry") or {}
            coords = geom.get("coordinates") or []
            lon = coords[0] if len(coords) >= 2 else None
            lat = coords[1] if len(coords) >= 2 else None

            parsed.append(
                {
                    "source_event_id": feat.get("id"),
                    "event_type": "earthquake",
                    "title": props.get("title") or props.get("place"),
                    "summary": props.get("place"),
                    "url": props.get("url"),
                    "language": "en",
                    "published_at": props.get("time"),
                    "lat": lat,
                    "lon": lon,
                    "country": None,
                    "magnitude": props.get("mag"),
                    "payload": feat,
                }
            )
        return parsed
