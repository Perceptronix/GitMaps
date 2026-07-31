"""Shared timestamp helpers for the ingestion pipeline.

`timestamptz` columns come back from psycopg2 already parsed to `datetime`,
while the test fakes hand us ISO strings — so every runner parses and formats
timestamps identically. These three helpers are the single copy of that logic;
the collector, snapshotter, promotion, and momentum modules import them instead
of re-defining their own.
"""

from __future__ import annotations

from datetime import datetime


def parse_ts(value: str | datetime | None) -> datetime | None:
    """Parse a timestamp that may already be a datetime (or absent)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def days_between(now: datetime, then: datetime | None) -> float:
    """Whole-day span from `then` to `now`, floored at 0 (0 if unknown)."""
    return max((now - then).total_seconds() / 86400.0, 0.0) if then else 0.0


def utc_stamp(dt: datetime) -> str:
    """UTC ISO-8601 timestamp with a Z suffix (the worker's wire format)."""
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
