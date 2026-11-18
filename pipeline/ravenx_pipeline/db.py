import os
from contextlib import contextmanager
from typing import Iterable, Tuple
import duckdb

DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "ravenx.duckdb",
)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS events (
  event_id        VARCHAR PRIMARY KEY,
  source          VARCHAR NOT NULL,
  source_event_id VARCHAR,
  event_type      VARCHAR NOT NULL,
  title           VARCHAR,
  summary         VARCHAR,
  url             VARCHAR,
  url_normalized  VARCHAR,
  language        VARCHAR,
  published_at    TIMESTAMP,
  ingested_at     TIMESTAMP NOT NULL,
  lat             DOUBLE,
  lon             DOUBLE,
  country         VARCHAR,
  magnitude       DOUBLE,
  title_hash      VARCHAR,
  payload_json    VARCHAR,
  raw_path        VARCHAR,
  run_id          VARCHAR
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  run_id        VARCHAR PRIMARY KEY,
  source        VARCHAR,
  started_at    TIMESTAMP,
  finished_at   TIMESTAMP,
  status        VARCHAR,
  http_status   INTEGER,
  fetched       INTEGER,
  inserted      INTEGER,
  duplicates    INTEGER,
  rejected      INTEGER,
  errors        INTEGER,
  duration_ms   INTEGER,
  error_message VARCHAR
);
"""


def get_db_path() -> str:
    return os.environ.get("RAVENX_DB_PATH", DEFAULT_DB_PATH)


@contextmanager
def get_connection(db_path: str | None = None):
    path = db_path or get_db_path()
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    conn = duckdb.connect(path)
    try:
        conn.execute("SET memory_limit='128MB';")
        conn.execute("SET threads=1;")
        yield conn
    finally:
        conn.close()


def init_db(db_path: str | None = None) -> None:
    with get_connection(db_path) as conn:
        for stmt in [s.strip() for s in SCHEMA_SQL.split(";") if s.strip()]:
            conn.execute(stmt)


def get_last_published_at(conn: duckdb.DuckDBPyConnection, source: str):
    row = conn.execute(
        "SELECT MAX(published_at) FROM events WHERE source = ?",
        [source],
    ).fetchone()
    return row[0] if row else None


def upsert_events(
    conn: duckdb.DuckDBPyConnection,
    events: Iterable[dict],
) -> Tuple[int, int]:
    """
    Idempotently upsert normalized events into DuckDB.
    Checks both event_id and cross-source (url_normalized / title_hash)
    so re-running the same batch or cross-source duplicates never inflate rows.
    Returns (inserted_count, duplicate_count).
    """
    inserted = 0
    duplicates = 0

    for ev in events:
        event_id = ev["event_id"]
        url_norm = ev.get("url_normalized")
        title_hash = ev.get("title_hash")

        exists_id = conn.execute(
            "SELECT 1 FROM events WHERE event_id = ? LIMIT 1",
            [event_id],
        ).fetchone()

        is_dup = exists_id is not None

        if not is_dup and url_norm:
            exists_url = conn.execute(
                "SELECT 1 FROM events WHERE url_normalized = ? LIMIT 1",
                [url_norm],
            ).fetchone()
            if exists_url is not None:
                is_dup = True

        if not is_dup and title_hash:
            exists_title = conn.execute(
                "SELECT 1 FROM events WHERE title_hash = ? LIMIT 1",
                [title_hash],
            ).fetchone()
            if exists_title is not None:
                is_dup = True

        if is_dup:
            duplicates += 1
            # Refresh metadata on exact event_id match without creating a new row
            if exists_id is not None:
                conn.execute(
                    """
                    UPDATE events SET
                        title = COALESCE(?, title),
                        summary = COALESCE(?, summary),
                        magnitude = COALESCE(?, magnitude),
                        payload_json = COALESCE(?, payload_json),
                        raw_path = ?,
                        run_id = ?
                    WHERE event_id = ?
                    """,
                    [
                        ev.get("title"),
                        ev.get("summary"),
                        ev.get("magnitude"),
                        ev.get("payload_json"),
                        ev.get("raw_path"),
                        ev.get("run_id"),
                        event_id,
                    ],
                )
            continue

        conn.execute(
            """
            INSERT INTO events (
                event_id, source, source_event_id, event_type,
                title, summary, url, url_normalized, language,
                published_at, ingested_at, lat, lon, country,
                magnitude, title_hash, payload_json, raw_path, run_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                event_id,
                ev["source"],
                ev.get("source_event_id"),
                ev["event_type"],
                ev.get("title"),
                ev.get("summary"),
                ev.get("url"),
                url_norm,
                ev.get("language"),
                ev.get("published_at"),
                ev["ingested_at"],
                ev.get("lat"),
                ev.get("lon"),
                ev.get("country"),
                ev.get("magnitude"),
                title_hash,
                ev.get("payload_json"),
                ev.get("raw_path"),
                ev.get("run_id"),
            ],
        )
        inserted += 1

    return inserted, duplicates
