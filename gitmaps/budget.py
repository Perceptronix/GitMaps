"""The shared rolling per-hour GitHub API rate budget (architecture §6).

Every runner that charges the shared API pool (snapshots, embeddings,
classification) reads and writes the same `ingestion_state` key through this
one helper, so a single job cannot silently exhaust the day's budget on its
own. The counter is per wall-clock hour and resets when the hour rolls over.

Consolidates the `_hour_stamp` / `_budget_state` pair that were copy-pasted
between snapshotter.py and embeddings.py — the dedup recommended by
docs/architecture-review.md #11 (F5/F7).
"""

from __future__ import annotations

from datetime import datetime

#: The shared rolling per-hour rate budget (ingestion_state key, ticket 08).
RATE_BUDGET_KEY = "rate_budget"


def hour_stamp(dt: datetime) -> str:
    """The wall-clock hour key the budget counter is stored under."""
    return dt.strftime("%Y-%m-%dT%H:00:00Z")


def rate_budget_state(store, now: datetime, *, key: str = RATE_BUDGET_KEY) -> dict:
    """The current hour's budget counter, reset when the hour rolls over.

    `store` is duck-typed: anything with `get_state` (a RepoStore in
    production, a fake in tests). Returns `{"hour": ..., "used": N}`; the
    caller persists it back with `store.set_state(key, budget)` after the run.
    """
    hour = hour_stamp(now)
    current = store.get_state(key) or {}
    if current.get("hour") != hour:
        return {"hour": hour, "used": 0}
    try:
        used = int(current.get("used", 0))
    except (TypeError, ValueError):
        used = 0
    return {"hour": hour, "used": used}
