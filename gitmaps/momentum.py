"""The Momentum engine — a transparent, configurable score of growth.

Implements the `momentum` job from architecture §5: read each Repository's
snapshot series, compute an explainable Momentum score for the 1d/7d/30d
periods, and materialize score + decomposition into `momentum_scores`
(ADR-0002 — transparent by design: every signal's contribution and the age
and size normalization factors are stored alongside the score).

Momentum is rule-based, not a learned model (ADR-0002). For each period and
growth signal (stars, forks, watchers, contributors, commits) it:

1. measures the observed per-day growth between the first and last snapshot
   values inside the window (a declining signal contributes 0, never a
   negative score);
2. discounts by **prior size** — `prior_floor / max(prior, prior_floor)` —
   so a small Repository is judged further from mainstream than a giant
   (PRD: "distance from mainstream", not size); commits are a flow, not a
   stock, so they carry no prior-size factor;
3. boosts by **repository age** — `min(age_target / age_days, age_cap)` — so
   an emerging Repository can compete with an established project;
4. normalizes by the signal's target rate (bringing the five signals onto a
   comparable scale so the weights are meaningful), caps each signal, and
   combines them with configurable weights.

Everything about the scoring is configuration, not code: `MomentumConfig`
holds the weights, per-signal targets, and age/size parameters, so tuning
momentum never touches the algorithm.

The engine is pure — it imports nothing from the collector, promotion engine,
or snapshot worker. It reads snapshot rows + a `created_at` and returns scores
and decompositions; persistence happens in `MomentumRunner` over the store
seam (the same shape as `PromotionRunner`).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Callable

from gitmaps.timeutil import days_between, parse_ts, utc_stamp

#: Window length, in days, for each momentum period (matches the
#: `momentum_scores.period` check constraint).
PERIOD_DAYS = {"1d": 1, "7d": 7, "30d": 30}

#: The canonical growth signals, in display order.
SIGNALS = ("stars", "forks", "watchers", "contributors", "commits")

# Snapshot row contract — the column order returned by `RepoStore.get_snapshots`.
_SLOT_TAKEN_AT = 0
_SLOT_STARS = 2
_SLOT_FORKS = 3
_SLOT_WATCHERS = 4
_SLOT_CONTRIBUTORS = 6
_SLOT_COMMIT_ACTIVITY = 7

#: The documented default weights (.env.example `MOMENTUM_SIGNAL_WEIGHTS`).
DEFAULT_WEIGHTS: dict[str, float] = {
    "stars": 0.35,
    "forks": 0.15,
    "watchers": 0.10,
    "contributors": 0.20,
    "commits": 0.20,
}

#: Per-signal growth rate (per day) that makes that signal's *unadjusted*
#: score 1.0. These bring the five signals onto a comparable scale — without
#: them the largest-magnitude signal (stars) would swamp the rest regardless
#: of weight.
DEFAULT_TARGETS_PER_DAY: dict[str, float] = {
    "stars": 1.0,
    "forks": 0.2,
    "watchers": 0.1,
    "contributors": 0.05,
    "commits": 2.0,
}


def validate_momentum_weights(weights: dict[str, float]) -> None:
    """Validate a momentum weights dict: exactly the five signals, non-negative, sum 1.0.

    Both the env parser (config.py) and `MomentumConfig` enforce the same rule,
    so the check lives once here — a weight set that passes it is transparent by
    construction (the decomposition reports these same weights, ADR-0002).
    """
    if not set(weights) == set(SIGNALS):
        raise ValueError(f"weights must cover {SIGNALS}, got {sorted(weights)}")
    total = sum(weights.values())
    if abs(total - 1.0) > 1e-6:
        raise ValueError(f"weights must sum to 1.0, got {total}")
    if any(w < 0 for w in weights.values()):
        raise ValueError("weights must be non-negative")


@dataclass(frozen=True)
class MomentumConfig:
    """All momentum weights and normalization parameters. Tuning these is tuning the product."""

    periods: tuple[str, ...] = ("1d", "7d", "30d")
    weights: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    targets_per_day: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_TARGETS_PER_DAY))
    age_target_days: float = 365.0  # repo age (days) at which the age factor is 1.0
    age_cap: float = 2.5            # strongest young-repo boost (factor never exceeds this)
    prior_floor: float = 10.0       # prior size counted as this when smaller (no tiny-repo blowup)
    max_signal_score: float = 20.0  # per-signal cap — outlier/farming protection, keeps weights honest

    def __post_init__(self) -> None:
        validate_momentum_weights(self.weights)
        for period in self.periods:
            if period not in PERIOD_DAYS:
                raise ValueError(f"unknown momentum period {period!r} (expected 1d, 7d, 30d)")


@dataclass(frozen=True)
class PeriodResult:
    period: str
    score: float
    decomposition: dict


def _signal_value(row: tuple, signal: str) -> Any:
    """Pull a signal's value out of a snapshot row (None for commits)."""
    if signal == "stars":
        return row[_SLOT_STARS]
    if signal == "forks":
        return row[_SLOT_FORKS]
    if signal == "watchers":
        return row[_SLOT_WATCHERS]
    if signal == "contributors":
        return row[_SLOT_CONTRIBUTORS]
    return None


def _stock_points(snapshot_rows: list[tuple], window_start: datetime, signal: str) -> list[tuple[datetime, float]]:
    """(taken_at, value) pairs inside the window with a non-null value, oldest first."""
    points: list[tuple[datetime, float]] = []
    for row in snapshot_rows:
        taken_at = parse_ts(row[_SLOT_TAKEN_AT])
        value = _signal_value(row, signal)
        if taken_at is None or value is None or taken_at < window_start:
            continue
        points.append((taken_at, float(value)))
    return points


def _week_start(week: dict) -> datetime | None:
    """Start timestamp of a commit_activity week (epoch seconds or an ISO string)."""
    raw = week.get("week")
    if isinstance(raw, (int, float)):
        return datetime.fromtimestamp(raw, tz=timezone.utc)
    if isinstance(raw, str):
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo is not None else parsed.replace(tzinfo=timezone.utc)
    return None


def _commits_in_window(snapshot_rows: list[tuple], window_start: datetime) -> float:
    """Commits counted in the window, from the latest deep snapshot's activity.

    `commit_activity` is a rolling weekly aggregation (~52 weeks), so the
    window is covered by the latest snapshot that carries it; weeks starting
    before the window are ignored.
    """
    activity: Any = None
    for row in reversed(snapshot_rows):
        candidate = row[_SLOT_COMMIT_ACTIVITY]
        if isinstance(candidate, list) and candidate:
            activity = candidate
            break
    if not activity:
        return 0.0
    total = 0.0
    for week in activity:
        if not isinstance(week, dict):
            continue
        start = _week_start(week)
        if start is not None and start >= window_start:
            total += float(week.get("total") or 0)
    return total


def _age(created_at: str | datetime | None, config: MomentumConfig, now: datetime) -> tuple[float | None, float]:
    """(age_days, age_factor); a missing birth date is neutral (factor 1.0)."""
    created = parse_ts(created_at)
    if created is None:
        return None, 1.0
    age_days = max(days_between(now, created), 1.0)
    return age_days, min(config.age_target_days / age_days, config.age_cap)


def _score_period(
    snapshot_rows: list[tuple],
    created_at: str | datetime | None,
    config: MomentumConfig,
    now: datetime,
    period: str,
) -> PeriodResult:
    window_days = PERIOD_DAYS[period]
    window_start = now - timedelta(days=window_days)
    age_days, age_factor = _age(created_at, config, now)

    signals: dict[str, dict[str, Any]] = {}
    contributions: list[float] = []

    for signal in SIGNALS:
        weight = config.weights[signal]
        if signal == "commits":
            growth = _commits_in_window(snapshot_rows, window_start)
            start = None
            end = None
            span_days = float(window_days)
            size_factor = 1.0  # a flow, not a stock — no prior size
        else:
            points = _stock_points(snapshot_rows, window_start, signal)
            if len(points) >= 2:
                start_ts, start = points[0]
                end_ts, end = points[-1]
                growth = max(end - start, 0.0)
                span_days = max((end_ts - start_ts).total_seconds() / 86400.0, 1.0)
                size_factor = config.prior_floor / max(start, config.prior_floor)
            else:
                start = None
                end = None
                growth = 0.0
                span_days = 0.0
                size_factor = 1.0  # no prior size observed → neutral
        rate = growth / span_days if span_days > 0 else 0.0
        target = config.targets_per_day[signal]
        score = min((rate / target) * size_factor * age_factor, config.max_signal_score)
        contribution = round(weight * score, 6)
        contributions.append(contribution)
        signals[signal] = {
            "start": start,
            "end": end,
            "growth": round(growth, 6),
            "span_days": round(span_days, 6),
            "growth_per_day": round(rate, 6),
            "prior_floor": config.prior_floor,
            "size_factor": round(size_factor, 6),
            "target_per_day": target,
            "weight": weight,
            "score": round(score, 6),
            "contribution": contribution,
        }

    total = round(sum(contributions), 6)
    decomposition: dict[str, Any] = {
        "period": period,
        "window_days": window_days,
        "age_days": round(age_days, 6) if age_days is not None else None,
        "age_factor": round(age_factor, 6),
        "age_cap": config.age_cap,
        "max_signal_score": config.max_signal_score,
        "signals": signals,
        "score": total,
    }
    return PeriodResult(period=period, score=total, decomposition=decomposition)


def score_repo(
    snapshot_rows: list[tuple],
    created_at: str | datetime | None,
    config: MomentumConfig,
    now: datetime,
) -> dict[str, PeriodResult]:
    """Score one Repository across every configured period.

    `snapshot_rows` follows the `RepoStore.get_snapshots` column order
    (taken_at, kind, stars, forks, watchers, open_issues, contributors,
    commit_activity); rows may be pre-filtered by the caller, since each
    period re-filters to its own window.
    """
    return {period: _score_period(snapshot_rows, created_at, config, now, period) for period in config.periods}


@dataclass(frozen=True)
class MomentumResult:
    computed_at: str
    periods: tuple[str, ...]
    repos_scored: int
    rows_written: int


class MomentumRunner:
    """Orchestrates the daily momentum compute over the store seam.

    Enumerates the Repositories that have snapshots (the momentum universe),
    scores each across every configured period, upserts score + decomposition
    into `momentum_scores`, then assigns per-period ranks and records progress
    in `ingestion_state` (architecture §5).
    """

    def __init__(
        self,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        config: MomentumConfig | None = None,
        batch_size: int = 100,
    ) -> None:
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._config = config or MomentumConfig()
        self._batch_size = batch_size

    def run(self) -> MomentumResult:
        now = self._now()
        computed_at = utc_stamp(now)
        max_window_days = max(PERIOD_DAYS[p] for p in self._config.periods)
        since = utc_stamp(now - timedelta(days=max_window_days))
        until = utc_stamp(now)

        repos_scored = 0
        rows_written = 0
        offset = 0
        while True:
            repo_ids = self._store.list_snapshot_repo_ids(self._batch_size, offset)
            if not repo_ids:
                break
            for repo_id in repo_ids:
                snapshots = self._store.get_snapshots(repo_id, since, until)
                created_at = self._store.get_repo_created_at(repo_id)
                for period, result in score_repo(snapshots, created_at, self._config, now).items():
                    rows_written += self._store.upsert_momentum(
                        repo_id, period, computed_at, result.score, result.decomposition, None
                    )
                repos_scored += 1
            offset += self._batch_size
            # A short page means the end: stop here instead of issuing the
            # trailing empty page. (Also makes the loop terminate for any
            # store that models pagination by page count, not emptiness.)
            if len(repo_ids) < self._batch_size:
                break

        for period in self._config.periods:
            self._store.rank_momentum(period, computed_at)

        self._store.set_state("momentum.last_run_at", computed_at)
        self._store.set_state("momentum.last_count", repos_scored)

        return MomentumResult(
            computed_at=computed_at,
            periods=self._config.periods,
            repos_scored=repos_scored,
            rows_written=rows_written,
        )
