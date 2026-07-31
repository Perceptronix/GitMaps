"""The discovery collector — search → screen → store → progress.

Implements the first stage of the worker's ingestion pipeline (architecture
§4): poll the GitHub search API for newly created repositories, drop obvious
junk (forks, archives), upsert the survivors into `repos`, and record the
run's progress in `ingestion_state` so the next run continues from where this
one stopped. Storage and HTTP live behind injected seams (client, store) so
this orchestration is unit-testable without network or database.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Callable

from gitmaps.timeutil import utc_stamp

SINCE_KEY = "discovery.since"
LAST_RUN_KEY = "discovery.last_run_at"
LAST_COUNT_KEY = "discovery.last_count"

#: Default look-back when no watermark exists yet (first run).
DEFAULT_WINDOW_DAYS = 7


@dataclass(frozen=True)
class DiscoveryResult:
    """Outcome of one discovery run."""

    query: str
    since: str
    found: int
    stored: int
    dropped: int


class DiscoveryRunner:
    def __init__(
        self,
        client,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        default_window_days: int = DEFAULT_WINDOW_DAYS,
    ) -> None:
        self._client = client
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._window_days = default_window_days

    def run(self) -> DiscoveryResult:
        run_start = utc_stamp(self._now())
        since = self._store.get_state(SINCE_KEY) or utc_stamp(
            self._now() - timedelta(days=self._window_days)
        )
        query = f"created:>={since}"

        found = 0
        dropped = 0
        screened: list[dict] = []
        for repo in self._client.search(query):
            found += 1
            if self._is_junk(repo):
                dropped += 1
                continue
            screened.append(repo)

        stored = self._store.upsert_many(screened) if screened else 0

        # Progress: advance the discovery watermark to this run's start so the
        # next run looks only at repositories created since now.
        self._store.set_state(SINCE_KEY, run_start)
        self._store.set_state(LAST_RUN_KEY, run_start)
        self._store.set_state(LAST_COUNT_KEY, stored)

        return DiscoveryResult(query=query, since=since, found=found, stored=stored, dropped=dropped)

    @staticmethod
    def _is_junk(repo: dict) -> bool:
        return bool(repo.get("fork")) or bool(repo.get("archived"))
