"""The snapshot worker — populate the `snapshots` growth time-series.

Implements the `snapshot.core` (daily, 1 call/repo) and `snapshot.deep`
(weekly, stats endpoints) jobs from architecture §5. Each run enumerates the
tracked repos due for that kind of snapshot (oldest-first, limited batch so
the daily work spreads across the day — §6), fetches the signals, writes the
snapshot rows, marks the repo freshly snapshotted, and records progress in
`ingestion_state` including the rolling per-hour rate budget (§6).

The HTTP and DB seams are injected (client, store), so this orchestration is
unit-testable without network or database — the same shape as DiscoveryRunner.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Callable

from gitmaps.budget import RATE_BUDGET_KEY, rate_budget_state
from gitmaps.github.client import GitHubApiError, RateLimitError
from gitmaps.repo_store import repo_to_row
from gitmaps.timeutil import utc_stamp

#: A repo is "due" when its last snapshot of that kind predates this window.
CORE_DUE_HOURS = 20
DEEP_DUE_DAYS = 6


@dataclass(frozen=True)
class SnapshotResult:
    kind: str
    attempted: int  # repos successfully snapshotted
    inserted: int   # snapshot rows written
    skipped: int    # repos skipped due to per-repo errors
    rate_limited: bool


class SnapshotRunner:
    def __init__(
        self,
        client,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        batch_size: int = 100,
        budget_per_hour: int | None = None,
        core_due_hours: int = CORE_DUE_HOURS,
        deep_due_days: int = DEEP_DUE_DAYS,
    ) -> None:
        self._client = client
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._batch_size = batch_size
        self._budget_per_hour = budget_per_hour
        self._core_due_hours = core_due_hours
        self._deep_due_days = deep_due_days

    def run_core(self) -> SnapshotResult:
        now = self._now()
        cutoff = utc_stamp(now - timedelta(hours=self._core_due_hours))
        return self._run("core", cutoff, now)

    def run_deep(self) -> SnapshotResult:
        now = self._now()
        cutoff = utc_stamp(now - timedelta(days=self._deep_due_days))
        return self._run("deep", cutoff, now)

    # -- internals ---------------------------------------------------------

    def _run(self, kind: str, cutoff: str, now: datetime) -> SnapshotResult:
        taken_at = utc_stamp(now)
        due = self._store.list_due_repos(kind, cutoff, self._batch_size)

        # Rolling per-hour rate budget (§6): read the current hour's counter;
        # if another run already spent it, abort before any request.
        budget = rate_budget_state(self._store, now) if self._budget_per_hour is not None else None

        attempted = 0
        inserted = 0
        skipped = 0
        rate_limited = False

        for repo_id, owner, name in due:
            if budget is not None and budget["used"] >= self._budget_per_hour:
                rate_limited = True
                break
            # Charge the budget up front: a request is consumed whether it
            # succeeds or fails, so failed/aborted calls still count (§6).
            calls = 1 if kind == "core" else 2
            if budget is not None:
                budget["used"] += calls
            try:
                if kind == "core":
                    n = self._snapshot_core(repo_id, owner, name, taken_at)
                else:
                    n = self._snapshot_deep(repo_id, owner, name, taken_at)
            except RateLimitError:
                # All tokens are exhausted — abort the batch rather than
                # sleeping through the reset once per remaining repo.
                rate_limited = True
                break
            except GitHubApiError:
                skipped += 1
                continue
            attempted += 1
            inserted += n

        self._store.set_state(f"snapshot.{kind}.last_run_at", taken_at)
        self._store.set_state(f"snapshot.{kind}.last_count", inserted)
        if budget is not None:
            self._store.set_state(RATE_BUDGET_KEY, budget)

        return SnapshotResult(kind=kind, attempted=attempted, inserted=inserted,
                              skipped=skipped, rate_limited=rate_limited)

    def _snapshot_core(self, repo_id: int, owner: str, name: str, taken_at: str) -> int:
        repo = self._client.get(f"/repos/{owner}/{name}")
        row = repo_to_row(repo)
        inserted = self._store.insert_snapshot(
            repo_id, taken_at, "core",
            stars=row["stars"], forks=row["forks"],
            watchers=row["watchers"], open_issues=row["open_issues"],
        )
        self._store.touch_snapshot_times(repo_id)
        return inserted

    def _snapshot_deep(self, repo_id: int, owner: str, name: str, taken_at: str) -> int:
        contributors_payload = self._client.get(f"/repos/{owner}/{name}/stats/contributors")
        commit_activity = self._client.get(f"/repos/{owner}/{name}/stats/commit_activity")
        # GitHub stats endpoints may return an empty body while recomputing
        # (202 Accepted); an empty/absent payload means "not ready this cycle".
        contributors = len(contributors_payload) if isinstance(contributors_payload, list) and contributors_payload else None
        commit = commit_activity if isinstance(commit_activity, list) and commit_activity else None
        inserted = self._store.insert_snapshot(
            repo_id, taken_at, "deep",
            contributors=contributors, commit_activity=commit,
        )
        self._store.touch_snapshot_times(repo_id)
        return inserted
