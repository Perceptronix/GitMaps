"""GH Archive backfill runner — populate historical `snapshots` from GH Archive.

Downloads hourly GH Archive JSON dumps, keeps only the events that touch repos
already in our tracked/surfaced set, and writes daily `kind='core'` snapshot
rows for the last N months — instead of waiting weeks for the daily snapshot
cadence to accumulate history. The GH Archive is a bulk, token-free service, so
unlike every GitHub-API-backed stage this runner does NOT draw on the shared
per-hour rate budget; the `batch_hours` and `max_runtime_seconds` caps bound
each invocation instead.

GH Archive records *events*, never counts, so a day's star/fork/open-issue
count is reconstructed from the repo's CURRENT count (read from `repos` when
the whole window is in hand) minus every growth event that landed after that
day — walking backwards from today. This keeps backfilled rows on the same
absolute-count semantics the daily SnapshotRunner writes and the Momentum
engine reads (`growth = end - start`); writing raw deltas into `snapshots`
would silently corrupt momentum. A day is anchored to the repo's current count
at window completion, so intraday drift between the last full day and "now" is
the one documented approximation. `watchers` cannot be reconstructed from GH
Archive (WatchEvents are stars, not subscriptions) and are left NULL.

The runner is resumable: `last_processed_hour` records the next hour to fetch,
and the accumulated per-repo daily deltas are persisted so an interrupted run
never re-downloads the (large) hourly dumps it already processed. Only the run
that reaches "now" reconstructs and writes rows; earlier runs just bank deltas
and progress.

Structure matches the other stages — pure engine (`extract_daily_deltas`,
`reconstruct_absolutes`) + injected seams (`store`, `downloader`, `now`), so it
is unit-testable without a database or the network.
"""

from __future__ import annotations

import gzip
import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Callable
from urllib.parse import urljoin

import requests

from gitmaps.timeutil import utc_stamp

logger = logging.getLogger("gitmaps.archive_backfill")

GH_ARCHIVE_BASE = "https://data.gharchive.org/"

#: Event types that carry a per-day growth signal for a `core` snapshot row.
WATCH_EVENT = "WatchEvent"   # action == "started" -> +1 star
FORK_EVENT = "ForkEvent"     # someone forked OUR repo -> +1 fork
ISSUE_EVENT = "IssuesEvent"  # opened/reopened -> +1 open issue; closed -> -1
RELEVANT_EVENT_TYPES = {WATCH_EVENT, FORK_EVENT, ISSUE_EVENT}

#: PushEvents carry commit activity, but a `core` snapshot has no commit column
#: and GH Archive PushEvents carry no commit count — so they contribute nothing
#: here. (Deep snapshots need the stats endpoints the daily worker already calls.)

#: Progress / state keys (ticket 08 convention).
BACKFILL_LAST_HOUR_KEY = "archive_backfill.last_processed_hour"
BACKFILL_DELTAS_KEY = "archive_backfill.deltas"
BACKFILL_REPOS_KEY = "archive_backfill.repos_completed"
BACKFILL_ERRORS_KEY = "archive_backfill.errors"

#: Backfilled rows are `core` snapshots (the schema's kind check constraint).
BACKFILL_KIND = "core"


@dataclass(frozen=True)
class ArchiveBackfillResult:
    hours_processed: int
    events_processed: int
    snapshots_written: int
    repos_seen: int
    window_complete: bool  # reached "now" -> reconstructed + wrote rows
    stopped_early: bool    # hit the batch/runtime cap before the window finished


def extract_daily_deltas(
    events: list[dict],
    repo_map: dict[int, tuple[str, str]],
) -> dict[int, dict[str, dict[str, int]]]:
    """Accumulate per-repo, per-day *delta* signals from a batch of events.

    Returns ``{repo_id: {day: {"stars": int, "forks": int, "open_issues": int}}}``
    — deltas only, never absolute counts (those are reconstructed from these +
    the repo's current stats once the whole window is in hand). Events for
    repos outside ``repo_map``, unparseable timestamps, and event types with no
    core signal are ignored. A ForkEvent's ``payload.forkee`` is the *fork's*
    metadata, not ours, so it never inflates our counts — the event only counts
    +1 fork on the forked (parent) repo.
    """
    name_to_id = {f"{owner}/{name}": rid for rid, (owner, name) in repo_map.items()}
    daily: dict[int, dict[str, dict[str, int]]] = {}

    for event in events:
        if event.get("type") not in RELEVANT_EVENT_TYPES:
            continue
        repo_info = event.get("repo") or {}
        repo_name = repo_info.get("name")
        if not repo_name or repo_name not in name_to_id:
            continue
        day = _day_of(event.get("created_at") or "")
        if day is None:
            continue
        repo_id = name_to_id[repo_name]
        payload = event.get("payload") or {}
        agg = daily.setdefault(repo_id, {}).setdefault(
            day, {"stars": 0, "forks": 0, "open_issues": 0}
        )
        event_type = event["type"]
        if event_type == WATCH_EVENT and payload.get("action") == "started":
            agg["stars"] += 1
        elif event_type == FORK_EVENT:
            agg["forks"] += 1
        elif event_type == ISSUE_EVENT:
            action = payload.get("action")
            if action in ("opened", "reopened"):
                agg["open_issues"] += 1
            elif action == "closed":
                agg["open_issues"] = max(0, agg["open_issues"] - 1)
    return daily


def reconstruct_absolutes(
    deltas: dict[int, dict[str, dict[str, int]]],
    current_stats: dict[int, dict[str, int | None]],
) -> dict[int, dict[str, dict[str, int]]]:
    """Turn per-day deltas into absolute daily counts by walking backwards.

    A day's count is the repo's current count minus every growth event that
    landed *on or after* that day (GH Archive has no count field, only events).
    Days are ordered newest-first and the running count is decremented by each
    day's deltas, so ``absolute(day)`` is the count at the start of that day —
    the same ``taken_at = day T00:00:00Z`` semantics the daily worker's rows
    carry. Repos missing from ``current_stats`` are dropped; a running count is
    clamped at 0 so stale current stats can't produce negative history. Only
    stars/forks/open_issues are reconstructed — `watchers` is written NULL
    elsewhere, as GH Archive cannot emit it.
    """
    out: dict[int, dict[str, dict[str, int]]] = {}
    for repo_id, days in deltas.items():
        stats = current_stats.get(repo_id)
        if stats is None:
            continue
        running = {
            "stars": stats.get("stars") or 0,
            "forks": stats.get("forks") or 0,
            "open_issues": stats.get("open_issues") or 0,
        }
        absolutes: dict[str, dict[str, int]] = {}
        for day in reversed(sorted(days)):
            delta = days[day]
            for key in ("stars", "forks", "open_issues"):
                running[key] = max(running[key] - delta[key], 0)
            absolutes[day] = {
                "stars": running["stars"],
                "forks": running["forks"],
                "open_issues": running["open_issues"],
            }
        out[repo_id] = absolutes
    return out


def _day_of(event_ts: str) -> str | None:
    """The ``YYYY-MM-DD`` day of a GH Archive ``created_at``, or None."""
    try:
        dt = datetime.fromisoformat(event_ts.replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt.strftime("%Y-%m-%d")


def _coerce_deltas(raw) -> dict[int, dict[str, dict[str, int]]]:
    """Normalize a jsonb round-trip (string keys) back to typed deltas."""
    out: dict[int, dict[str, dict[str, int]]] = {}
    for repo_id, days in (raw or {}).items():
        repo = out.setdefault(int(repo_id), {})
        for day, agg in days.items():
            repo[day] = {
                "stars": int(agg.get("stars") or 0),
                "forks": int(agg.get("forks") or 0),
                "open_issues": int(agg.get("open_issues") or 0),
            }
    return out


class ArchiveBackfillRunner:
    """Backfill historical snapshots from GH Archive hourly dumps.

    Scope: only repos currently tracked OR surfaced in our database. Window:
    the last ``months_back`` months, processed chronologically and resumable
    via ``archive_backfill.last_processed_hour``. `downloader` is duck-typed —
    ``(url: str) -> list[dict]`` — defaulting to the real HTTP downloader, so
    tests inject a scripted fake.
    """

    def __init__(
        self,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        months_back: int = 12,
        batch_hours: int = 24,
        max_runtime_seconds: int | None = 3600,
        downloader: Callable[[str], list[dict]] | None = None,
    ) -> None:
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._months_back = months_back
        self._batch_hours = batch_hours
        self._max_runtime_seconds = max_runtime_seconds
        self._downloader = downloader or self._download_hour
        self._session = requests.Session()
        self._session.headers.update({"User-Agent": "GitMaps-ArchiveBackfill/1.0"})

    def run(self) -> ArchiveBackfillResult:
        start_time = time.time()
        now = self._now()
        cutoff = (now - timedelta(days=30 * self._months_back)).replace(
            minute=0, second=0, microsecond=0
        )

        repo_map = self._repo_map()
        if not repo_map:
            logger.info("No tracked/surfaced repos to backfill")
            return ArchiveBackfillResult(
                hours_processed=0, events_processed=0, snapshots_written=0,
                repos_seen=0, window_complete=False, stopped_early=False,
            )

        current_hour = self._resume_from(cutoff)
        deltas = _coerce_deltas(self._store.get_state(BACKFILL_DELTAS_KEY))

        logger.info("Backfilling %d repos from %s to %s", len(repo_map), current_hour, now)

        hours_processed = 0
        events_processed = 0
        stopped = False
        while current_hour < now:
            if self._max_runtime_seconds is not None and (time.time() - start_time) > self._max_runtime_seconds:
                stopped = True
                break
            if hours_processed >= self._batch_hours:
                stopped = True
                break
            hour_str = current_hour.strftime("%Y-%m-%d-%H")
            try:
                events = self._downloader(urljoin(GH_ARCHIVE_BASE, f"{hour_str}.json.gz"))
            except requests.RequestException as exc:
                # A missing/bad hourly dump must not stall the whole backfill.
                logger.warning("Failed to download %s: %s", hour_str, exc)
                self._record_error(hour_str, str(exc))
            else:
                events_processed += len(events)
                self._merge_deltas(deltas, extract_daily_deltas(events, repo_map))
            hours_processed += 1
            current_hour += timedelta(hours=1)
            self._store.set_state(BACKFILL_LAST_HOUR_KEY, utc_stamp(current_hour))

        window_complete = not stopped and current_hour >= now
        if window_complete:
            # Every hour down to "now" is banked — reconstruct absolute daily
            # counts from each repo's current stats and write the rows. Clears
            # the deltas afterwards, so a re-run of a finished backfill is a
            # no-op rather than re-writing history.
            stats = {rid: self._store.get_repo_stats(rid) for rid in deltas}
            absolutes = reconstruct_absolutes(deltas, stats)
            snapshots_written = 0
            for rid, days in absolutes.items():
                # Reconstruction walks days newest-first; write oldest-first so
                # the snapshots series reads chronologically.
                for day in sorted(days):
                    values = days[day]
                    snapshots_written += self._store.insert_snapshot(
                        rid, f"{day}T00:00:00Z", BACKFILL_KIND,
                        stars=values["stars"], forks=values["forks"],
                        open_issues=values["open_issues"],
                    )
            repos_seen = len(absolutes)
            self._store.set_state(BACKFILL_DELTAS_KEY, {})
        else:
            # Window not yet in hand: bank the deltas so the next run resumes
            # without re-downloading, and write nothing.
            snapshots_written = 0
            repos_seen = len(deltas)
            self._store.set_state(BACKFILL_DELTAS_KEY, deltas)

        self._store.set_state(BACKFILL_REPOS_KEY, repos_seen)
        return ArchiveBackfillResult(
            hours_processed=hours_processed,
            events_processed=events_processed,
            snapshots_written=snapshots_written,
            repos_seen=repos_seen,
            window_complete=window_complete,
            stopped_early=stopped,
        )

    # -- internals ---------------------------------------------------------

    def _repo_map(self) -> dict[int, tuple[str, str]]:
        """{repo_id: (owner, name)} for every tracked or surfaced repo, paged."""
        repo_map: dict[int, tuple[str, str]] = {}
        offset = 0
        while True:
            rows = self._store.list_tracked_surfaced(limit=500, offset=offset)
            if not rows:
                break
            repo_map.update((rid, (owner, name)) for rid, owner, name in rows)
            if len(rows) < 500:
                break
            offset += 500
        return repo_map

    def _resume_from(self, cutoff: datetime) -> datetime:
        raw = self._store.get_state(BACKFILL_LAST_HOUR_KEY)
        if raw:
            try:
                dt = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
            except ValueError:
                return cutoff
            return dt.replace(minute=0, second=0, microsecond=0)
        return cutoff

    def _merge_deltas(
        self,
        deltas: dict[int, dict[str, dict[str, int]]],
        batch: dict[int, dict[str, dict[str, int]]],
    ) -> None:
        for repo_id, days in batch.items():
            repo_days = deltas.setdefault(repo_id, {})
            for day, agg in days.items():
                target = repo_days.setdefault(day, {"stars": 0, "forks": 0, "open_issues": 0})
                for key in ("stars", "forks", "open_issues"):
                    target[key] += agg[key]

    def _download_hour(self, url: str) -> list[dict]:
        """Download and decompress one GH Archive hourly ``.json.gz`` file."""
        resp = self._session.get(url, timeout=60)
        if resp.status_code == 404:
            # Hour not published yet (future hour) — treat as empty.
            return []
        resp.raise_for_status()
        try:
            decompressed = gzip.decompress(resp.content)
        except OSError:
            logger.warning("Bad gzip payload from %s", url)
            return []
        events: list[dict] = []
        for line in decompressed.decode("utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                logger.warning("Skipping unparseable GH Archive line in %s", url)
        return events

    def _record_error(self, hour: str, error: str) -> None:
        errors = self._store.get_state(BACKFILL_ERRORS_KEY)
        if not isinstance(errors, list):
            errors = []
        errors = list(errors)
        errors.append({"hour": hour, "error": error, "time": utc_stamp(self._now())})
        self._store.set_state(BACKFILL_ERRORS_KEY, errors[-100:])
