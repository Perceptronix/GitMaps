"""The repository promotion engine — candidates → tracked → surfaced.

Implements the §4 screening/promotion step the collector's storage alone
couldn't: candidates (repos stored by discovery, `tracked=false`) are
evaluated against the significance rules and promoted to `tracked` when they
look like fringe promise, and to `surfaced` when they clear the multivariate
Significance gate.

The rules are a tunable seam (architecture §4, ADR-0003): `GateConfig` holds
every weight and threshold, `evaluate()` is a pure function of a repo's stored
signals, and the decomposition is stored with the score so a promoter can see
*why* a repo surfaced (ADR-0002 transparency).

Deliberately no absolute stars floor (ADR-0003): a young, small, high-quality
repo can clear the gate on momentum + substance; a star-farmed repo with no
substance or activity cannot.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable

from gitmaps.timeutil import days_between, parse_ts, utc_stamp

#: The gate signals, in GateConfig.weights order — the decomposition's component
#: names and the configured-weight order must match this (cf. momentum.SIGNALS).
SIGNAL_NAMES = ("momentum", "recency", "contributors", "substance", "engagement")


@dataclass(frozen=True)
class GateConfig:
    """All promotion thresholds/weights. Tuning this is tuning the product."""

    # Significance gate (→ surfaced)
    threshold: float = 0.5
    momentum_target_per_day: float = 0.5  # stars/day that saturates the momentum signal
    recency_window_days: int = 30  # a push inside this window saturates recency
    contributor_target: int = 10
    fork_target: int = 50
    # order: SIGNAL_NAMES (sums to 1)
    weights: tuple[float, float, float, float, float] = (0.35, 0.20, 0.15, 0.20, 0.10)

    # Tracked promotion (fringe promise, architecture §4)
    fringe_max_age_days: int = 365
    fringe_min_stars: int = 5


@dataclass(frozen=True)
class RepoSignals:
    """A repo's stored signals — the input to the gate."""

    id: int
    stars: int = 0
    forks: int = 0
    contributors: int | None = None
    created_at: str | datetime | None = None
    pushed_at: str | datetime | None = None
    description: str | None = None
    homepage: str | None = None
    topics: tuple[str, ...] = ()
    tracked: bool = False
    surfaced: bool = False
    surfaced_at: str | datetime | None = None


@dataclass(frozen=True)
class Evaluation:
    significance: float
    decomposition: dict
    promote_tracked: bool
    promote_surfaced: bool


def row_to_signals(row: tuple) -> RepoSignals:
    """Convert a repos SELECT row to RepoSignals (see list_candidates column order)."""
    (
        id_, stars, forks, contributors, created_at, pushed_at,
        description, homepage, topics, tracked, surfaced, surfaced_at,
    ) = row
    return RepoSignals(
        id=id_, stars=stars, forks=forks, contributors=contributors,
        created_at=created_at, pushed_at=pushed_at, description=description,
        homepage=homepage, topics=tuple(topics or ()),
        tracked=bool(tracked), surfaced=bool(surfaced), surfaced_at=surfaced_at,
    )


def evaluate(repo: RepoSignals, config: GateConfig, now: datetime) -> Evaluation:
    """Score a repo against the gate and decide both promotions.

    Each signal is normalized to [0, 1]; the score is the weighted sum, so the
    decomposition stored alongside it fully explains it (ADR-0002).

    Of the five signals, only ``repos.contributors`` can be unknown: it is not
    populated until a deep snapshot records it, so it is EXCLUDED rather than
    counted as 0 (which would silently depress every gate score). The remaining
    weights are renormalized to sum to 1, so the unknown signal is neutral — the
    decomposition records it under ``unavailable`` and marks the top-level
    ``renormalized`` flag so the exclusion is transparent. Missing dates are NOT
    exclusions: they make momentum/recency 0.0, kept available at full weight
    (momentum.py's convention for missing data).
    """
    created = parse_ts(repo.created_at)
    pushed = parse_ts(repo.pushed_at)
    age_days = days_between(now, created)
    since_push = days_between(now, pushed)

    momentum = min(repo.stars / (age_days * config.momentum_target_per_day), 1.0) if created else 0.0
    recency = max(0.0, 1.0 - since_push / config.recency_window_days) if pushed else 0.0
    contributors_signal = (
        min(repo.contributors / config.contributor_target, 1.0) if repo.contributors is not None else None
    )
    has_description = 1.0 if repo.description and len(repo.description.strip()) >= 10 else 0.0
    has_homepage = 1.0 if repo.homepage else 0.0
    topic_richness = min(len(repo.topics) / 3.0, 1.0)
    substance = 0.5 * has_description + 0.2 * has_homepage + 0.3 * topic_richness
    engagement = min(repo.forks / config.fork_target, 1.0)

    raw_values = {
        "momentum": momentum,
        "recency": recency,
        "contributors": contributors_signal,
        "substance": substance,
        "engagement": engagement,
    }
    raw_weights = dict(zip(SIGNAL_NAMES, config.weights))

    available = {name: raw_values[name] is not None for name in SIGNAL_NAMES}
    weight_scale = sum(raw_weights[name] for name in SIGNAL_NAMES if available[name])
    # renormalized iff some configured signal is unknown (not a float-boundary test)
    renormalized = any(not available[name] for name in SIGNAL_NAMES)
    # If no signal is available weight_scale == 0 and every branch below falls to
    # the 0.0 else — the division never executes (today only contributors can be
    # None, so weight_scale >= 0.85 in practice).
    effective_weights = {
        name: (raw_weights[name] / weight_scale if available[name] else 0.0)
        for name in SIGNAL_NAMES
    }

    components = {}
    significance = 0.0
    for name in SIGNAL_NAMES:
        value = raw_values[name]
        contribution = effective_weights[name] * (value if value is not None else 0.0)
        components[name] = {
            "value": round(value, 6) if value is not None else None,
            "weight": round(effective_weights[name], 6),   # effective (renormalized)
            "raw_weight": round(raw_weights[name], 6),     # configured (GateConfig.weights)
            "contribution": round(contribution, 6),
            "available": available[name],
        }
        significance += contribution
    decomposition = {
        "threshold": config.threshold,
        "renormalized": renormalized,
        "unavailable": [name for name in SIGNAL_NAMES if not available[name]],
        "components": components,
    }

    # Tracked (fringe promise): young, non-trivial activity, recently active.
    fringe = (
        created is not None
        and age_days <= config.fringe_max_age_days
        and repo.stars >= config.fringe_min_stars
        and pushed is not None
        and since_push <= config.recency_window_days
    )

    return Evaluation(
        significance=significance,
        decomposition=decomposition,
        promote_tracked=fringe,
        promote_surfaced=significance >= config.threshold,
    )


@dataclass(frozen=True)
class PromotionResult:
    candidates: int
    promoted_tracked: int
    surfaced_candidates: int  # repos evaluated for the gate (candidates + tracked)
    promoted_surfaced: int


class PromotionRunner:
    """Orchestrates promotion over the store: read candidates → evaluate → apply."""

    def __init__(
        self,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        config: GateConfig | None = None,
        batch_size: int = 100,
    ) -> None:
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._config = config or GateConfig()
        self._batch_size = batch_size

    def run(self) -> PromotionResult:
        now = self._now()
        now_stamp = utc_stamp(now)

        promoted_tracked = 0
        promoted_surfaced = 0
        candidates = 0
        surfaced_candidates = 0

        # Pass 1: untracked candidates. A significant candidate is promoted to
        # both tracked and surfaced in one go; a fringe one to tracked only.
        for row in self._store.list_candidates(self._batch_size):
            signals = row_to_signals(row)
            if signals.tracked:
                continue
            candidates += 1
            surfaced_candidates += 1
            ev = evaluate(signals, self._config, now)
            # Persist the gate result + its decomposition for every evaluated
            # repo — surfaced or not — so the "why" (and the "why not") is
            # transparent on the row (ADR-0002, repos.significance_* columns).
            self._store.store_significance(signals.id, ev.significance, ev.decomposition)
            if ev.promote_tracked:
                self._store.promote_to_tracked(signals.id)
                promoted_tracked += 1
            if ev.promote_surfaced:
                self._store.promote_to_surfaced(signals.id, now_stamp)
                promoted_surfaced += 1

        # Pass 2: already-tracked repos that haven't surfaced yet.
        for row in self._store.list_tracked_not_surfaced(self._batch_size):
            signals = row_to_signals(row)
            surfaced_candidates += 1
            ev = evaluate(signals, self._config, now)
            self._store.store_significance(signals.id, ev.significance, ev.decomposition)
            if ev.promote_surfaced:
                self._store.promote_to_surfaced(signals.id, now_stamp)
                promoted_surfaced += 1

        self._store.set_state("promotion.last_run_at", now_stamp)
        self._store.set_state("promotion.promoted_tracked", promoted_tracked)
        self._store.set_state("promotion.promoted_surfaced", promoted_surfaced)

        return PromotionResult(
            candidates=candidates,
            promoted_tracked=promoted_tracked,
            surfaced_candidates=surfaced_candidates,
            promoted_surfaced=promoted_surfaced,
        )
