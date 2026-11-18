import argparse
import logging
import os
import signal
import sys

from ravenx_pipeline.db import init_db
from ravenx_pipeline.scheduler import build_scheduler, load_sources, run_source_once

DEFAULT_CONFIG = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "config",
    "sources.yaml",
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ravenx_pipeline.main")


def main() -> int:
    parser = argparse.ArgumentParser(description="RavenX Data Ingestion Pipeline")
    parser.add_argument("--config", default=os.environ.get("RAVENX_SOURCES_CONFIG", DEFAULT_CONFIG))
    parser.add_argument("--once", action="store_true", help="Run all enabled sources once and exit")
    args = parser.parse_args()

    init_db()

    if args.once:
        for src, _ in load_sources(args.config):
            run_source_once(src)
        return 0

    scheduler = build_scheduler(args.config)

    def _shutdown(signum, _frame):
        logger.info("Received signal %s, shutting down scheduler...", signum)
        scheduler.shutdown(wait=False)
        sys.exit(0)

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)

    logger.info("RavenX pipeline scheduler started.")
    scheduler.start()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
