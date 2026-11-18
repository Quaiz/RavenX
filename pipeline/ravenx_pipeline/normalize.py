import json
import math
from datetime import datetime, timezone
from typing import Any, Tuple
from dateutil import parser as date_parser

from ravenx_pipeline.dedup import compute_event_id, compute_title_hash, normalize_url


def clean_str(val: Any) -> str | None:
    if val is None:
        return None
    s = str(val).strip()
    return s if s else None


def parse_utc_timestamp(val: Any) -> datetime | None:
    if val is None or val == "":
        return None
    try:
        if isinstance(val, (int, float)):
            # Epoch milliseconds vs seconds
            ts = float(val) / 1000.0 if float(val) > 1e12 else float(val)
            return datetime.fromtimestamp(ts, tz=timezone.utc).replace(tzinfo=None)
        if isinstance(val, datetime):
            if val.tzinfo is not None:
                return val.astimezone(timezone.utc).replace(tzinfo=None)
            return val
        dt = date_parser.parse(str(val))
        if dt.tzinfo is not None:
            return dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    except Exception:
        return None


def validate_coord(lat_raw: Any, lon_raw: Any) -> Tuple[float | None, float | None, bool]:
    """Return (lat, lon, is_valid). Missing both is valid (None, None, True)."""
    if lat_raw is None and lon_raw is None:
        return None, None, True
    if lat_raw is None or lon_raw is None:
        return None, None, False
    try:
        lat = float(lat_raw)
        lon = float(lon_raw)
        if math.isnan(lat) or math.isnan(lon) or math.isinf(lat) or math.isinf(lon):
            return None, None, False
        if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
            return None, None, False
        return lat, lon, True
    except (ValueError, TypeError):
        return None, None, False


def normalize_event(
    raw_event: dict,
    source: str,
    raw_path: str,
    run_id: str,
    ingested_at: datetime,
) -> Tuple[dict | None, str | None]:
    """Normalize a parsed source event into the unified `events` schema."""
    event_type = clean_str(raw_event.get("event_type"))
    if not event_type:
        return None, "missing_event_type"

    title = clean_str(raw_event.get("title"))
    url = clean_str(raw_event.get("url"))
    if not title and not url:
        return None, "missing_title_and_url"

    lat, lon, coord_ok = validate_coord(raw_event.get("lat"), raw_event.get("lon"))
    if not coord_ok:
        return None, "invalid_coordinates"

    mag_raw = raw_event.get("magnitude")
    magnitude = None
    if mag_raw is not None and mag_raw != "":
        try:
            magnitude = float(mag_raw)
            if math.isnan(magnitude) or math.isinf(magnitude):
                return None, "invalid_magnitude"
        except (ValueError, TypeError):
            return None, "invalid_magnitude"

    url_norm = normalize_url(url)
    title_hash = compute_title_hash(title)
    source_event_id = clean_str(raw_event.get("source_event_id"))
    event_id = compute_event_id(source, source_event_id, url_norm, title_hash)

    published_at = parse_utc_timestamp(raw_event.get("published_at"))
    ing_utc = ingested_at.astimezone(timezone.utc).replace(tzinfo=None) if ingested_at.tzinfo else ingested_at

    payload = raw_event.get("payload")
    payload_json = json.dumps(payload, ensure_ascii=False, default=str) if payload is not None else None

    return {
        "event_id": event_id,
        "source": source,
        "source_event_id": source_event_id,
        "event_type": event_type,
        "title": title,
        "summary": clean_str(raw_event.get("summary")),
        "url": url,
        "url_normalized": url_norm,
        "language": clean_str(raw_event.get("language")),
        "published_at": published_at,
        "ingested_at": ing_utc,
        "lat": lat,
        "lon": lon,
        "country": clean_str(raw_event.get("country")),
        "magnitude": magnitude,
        "title_hash": title_hash,
        "payload_json": payload_json,
        "raw_path": raw_path,
        "run_id": run_id,
    }, None
