import logging
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from typing import Dict
import yaml
from apscheduler.schedulers.blocking import BlockingScheduler

from ravenx_pipeline.db import get_connection, init_db, upsert_events
from ravenx_pipeline.dedup import dedup_batch
from ravenx_pipeline.normalize import normalize_event
from ravenx_pipeline.raw_store import write_raw_jsonl_gz
from ravenx_pipeline.runs import record_run
from ravenx_pipeline.sources.base import BaseSource
from ravenx_pipeline.sources.gdelt import GDELTSource
from ravenx_pipeline.sources.google_news import GoogleNewsSource
from ravenx_pipeline.sources.usgs import USGSSource

logger = logging.getLogger("ravenx_pipeline.scheduler")

SOURCE_CLASSES: Dict[str, type[BaseSource]] = {
    "usgs": USGSSource,
    "google_news": GoogleNewsSource,
    "gdelt": GDELTSource,
}

# DuckDB allows one writer at a time per file; serialize DB writes across jobs.
_db_lock = threading.Lock()


def touch_heartbeat(path: str | None = None) -> None:
    hb = path or os.environ.get("RAVENX_HEARTBEAT_PATH", "/tmp/pipeline_heartbeat")
    try:
        os.makedirs(os.path.dirname(os.path.abspath(hb)), exist_ok=True)
        with open(hb, "w", encoding="utf-8") as f:
            f.write(datetime.now(timezone.utc).isoformat())
    except Exception as e:
        logger.debug("Heartbeat touch skipped: %s", e)


def run_source_once(
    source: BaseSource,
    db_path: str | None = None,
    raw_dir: str | None = None,
) -> dict:
    """Execute one isolated fetch -> raw -> parse -> normalize -> dedup -> upsert cycle."""
    run_id = f"{source.name}-{uuid.uuid4().hex[:12]}"
    started_at = datetime.now(timezone.utc).replace(tzinfo=None)
    t0 = time.perf_counter()

    http_status = None
    fetched = 0
    inserted = 0
    duplicates = 0
    rejected = 0
    errors = 0
    error_message = None
    status = "ok"

    try:
        with _db_lock:
            with get_connection(db_path) as conn:
                raw_records, http_status = source.fetch(conn=conn)
        fetched = len(raw_records)

        raw_path = write_raw_jsonl_gz(
            source=source.name,
            run_id=run_id,
            records=raw_records,
            raw_dir=raw_dir,
        )

        parsed = source.parse(raw_records)
        normalized = []
        for item in parsed:
            ev, rej_reason = normalize_event(
                raw_event=item,
                source=source.name,
                raw_path=raw_path,
                run_id=run_id,
                ingested_at=started_at,
            )
            if ev is None:
                rejected += 1
            else:
                normalized.append(ev)

        unique_events, in_batch_dups = dedup_batch(normalized)

        with _db_lock:
            with get_connection(db_path) as conn:
                ins, db_dups = upsert_events(conn, unique_events)
                inserted = ins
                duplicates = in_batch_dups + db_dups

        if rejected > 0 and inserted == 0 and duplicates == 0:
            status = "partial"
    except Exception as exc:
        errors += 1
        status = "failed"
        error_message = str(exc)[:500]
        logger.error("Ingestion failed for source=%s run_id=%s: %s", source.name, run_id, exc)

    duration_ms = int((time.perf_counter() - t0) * 1000)
    finished_at = datetime.now(timezone.utc).replace(tzinfo=None)

    run_record = {
        "run_id": run_id,
        "source": source.name,
        "started_at": started_at,
        "finished_at": finished_at,
        "status": status,
        "http_status": http_status,
        "fetched": fetched,
        "inserted": inserted,
        "duplicates": duplicates,
        "rejected": rejected,
        "errors": errors,
        "duration_ms": duration_ms,
        "error_message": error_message,
    }

    try:
        with _db_lock:
            with get_connection(db_path) as conn:
                record_run(conn, run_record)
    except Exception as db_exc:
        logger.error("Failed to record ingestion_run %s: %s", run_id, db_exc)

    touch_heartbeat()
    logger.info(
        "source=%s status=%s fetched=%d inserted=%d dups=%d rejected=%d duration_ms=%d",
        source.name,
        status,
        fetched,
        inserted,
        duplicates,
        rejected,
        duration_ms,
    )
    return run_record


def load_sources(config_path: str) -> list[tuple[BaseSource, int]]:
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f) or {}

    sources_cfg = cfg.get("sources", {})
    loaded = []
    for name, scfg in sources_cfg.items():
        if not scfg.get("enabled", True):
            continue
        cls = SOURCE_CLASSES.get(name)
        if not cls:
            logger.warning("Unknown source in config: %s", name)
            continue
        interval = int(scfg.get("interval_minutes", 15))
        loaded.append((cls(scfg), interval))
    return loaded


def build_scheduler(config_path: str) -> BlockingScheduler:
    init_db()
    touch_heartbeat()
    scheduler = BlockingScheduler(timezone=timezone.utc)
    now = datetime.now(timezone.utc)

    for src, interval_min in load_sources(config_path):
        scheduler.add_job(
            run_source_once,
            trigger="interval",
            minutes=interval_min,
            args=[src],
            id=f"ingest_{src.name}",
            max_instances=1,
            coalesce=True,
            next_run_time=now,
        )
        logger.info("Scheduled source=%s every %d minute(s)", src.name, interval_min)

    return scheduler
