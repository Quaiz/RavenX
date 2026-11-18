import duckdb


def record_run(conn: duckdb.DuckDBPyConnection, run: dict) -> None:
    conn.execute(
        """
        INSERT OR REPLACE INTO ingestion_runs (
            run_id, source, started_at, finished_at, status,
            http_status, fetched, inserted, duplicates,
            rejected, errors, duration_ms, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            run["run_id"],
            run["source"],
            run["started_at"],
            run["finished_at"],
            run["status"],
            run.get("http_status"),
            run.get("fetched", 0),
            run.get("inserted", 0),
            run.get("duplicates", 0),
            run.get("rejected", 0),
            run.get("errors", 0),
            run.get("duration_ms", 0),
            run.get("error_message"),
        ],
    )
