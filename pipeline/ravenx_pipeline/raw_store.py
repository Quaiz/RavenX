import gzip
import json
import os
from datetime import datetime, timezone
from typing import Iterable

DEFAULT_RAW_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "raw",
)


def get_raw_dir() -> str:
    return os.environ.get("RAVENX_RAW_DIR", DEFAULT_RAW_DIR)


def write_raw_jsonl_gz(
    source: str,
    run_id: str,
    records: Iterable[dict],
    ts: datetime | None = None,
    raw_dir: str | None = None,
) -> str:
    """Write raw records to data/raw/<source>/<yyyy>/<mm>/<dd>/<run_id>.jsonl.gz."""
    dt = ts or datetime.now(timezone.utc)
    base = raw_dir or get_raw_dir()
    rel_dir = os.path.join(source, f"{dt.year:04d}", f"{dt.month:02d}", f"{dt.day:02d}")
    full_dir = os.path.join(base, rel_dir)
    os.makedirs(full_dir, exist_ok=True)

    filename = f"{run_id}.jsonl.gz"
    full_path = os.path.join(full_dir, filename)

    with gzip.open(full_path, "wt", encoding="utf-8") as gz:
        for rec in records:
            gz.write(json.dumps(rec, ensure_ascii=False, default=str) + "\n")

    return os.path.join("data", "raw", rel_dir, filename).replace("\\", "/")
