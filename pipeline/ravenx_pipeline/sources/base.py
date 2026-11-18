from abc import ABC, abstractmethod
from typing import Any, List, Tuple
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


def build_http_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "HEAD"],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({"User-Agent": "RavenX-Pipeline/1.0"})
    return session


class BaseSource(ABC):
    name: str = ""

    def __init__(self, config: dict, session: requests.Session | None = None):
        self.config = config
        self.session = session or build_http_session()

    @abstractmethod
    def fetch(self, conn: Any = None) -> Tuple[List[dict], int | None]:
        """Fetch raw records from upstream. Returns (raw_records, http_status)."""

    @abstractmethod
    def parse(self, raw_records: List[dict]) -> List[dict]:
        """Parse raw records into pre-normalization event dicts."""
