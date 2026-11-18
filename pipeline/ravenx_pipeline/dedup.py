import hashlib
import re
from typing import List, Tuple
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

TRACKING_PARAMS = {
    "fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid",
    "yclid", "igshid", "ref", "ref_src", "oc", "ved", "usg",
}


def normalize_url(url: str | None) -> str | None:
    if not url or not isinstance(url, str):
        return None
    raw = url.strip()
    if not raw:
        return None
    try:
        parsed = urlparse(raw)
        if not parsed.scheme or not parsed.netloc:
            return None
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/") or "/"
        kept_qs = [
            (k, v)
            for k, v in parse_qsl(parsed.query, keep_blank_values=False)
            if not k.lower().startswith("utm_") and k.lower() not in TRACKING_PARAMS
        ]
        kept_qs.sort()
        query = urlencode(kept_qs)
        return urlunparse((scheme, netloc, path, "", query, ""))
    except Exception:
        return None


def compute_title_hash(title: str | None) -> str | None:
    if not title or not isinstance(title, str):
        return None
    clean = title.strip()
    if not clean:
        return None
    # Strip trailing Google News " - Publisher" suffix for cross-source dedup
    if " - " in clean:
        clean = clean.rsplit(" - ", 1)[0]
    clean = re.sub(r"[^a-z0-9\s]", " ", clean.lower())
    clean = re.sub(r"\s+", " ", clean).strip()
    if not clean:
        return None
    return hashlib.sha256(clean.encode("utf-8")).hexdigest()


def compute_event_id(
    source: str,
    source_event_id: str | None,
    url_normalized: str | None,
    title_hash: str | None,
) -> str:
    key_part = source_event_id or url_normalized or title_hash or ""
    raw = f"{source}:{key_part}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def dedup_batch(events: List[dict]) -> Tuple[List[dict], int]:
    """Deduplicate events within a single batch by event_id, url_normalized, and title_hash."""
    seen_ids = set()
    seen_urls = set()
    seen_titles = set()
    unique = []
    dups = 0

    for ev in events:
        eid = ev["event_id"]
        u = ev.get("url_normalized")
        th = ev.get("title_hash")

        if eid in seen_ids or (u and u in seen_urls) or (th and th in seen_titles):
            dups += 1
            continue

        seen_ids.add(eid)
        if u:
            seen_urls.add(u)
        if th:
            seen_titles.add(th)
        unique.append(ev)

    return unique, dups
