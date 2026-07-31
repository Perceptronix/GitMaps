"""Seam 1 (rules) — the pure significance evaluation.

The promotion engine's decision logic is a pure function of a repo's stored
signals, so every rule from the spec is pinned here with no I/O. ADR-0003
("no absolute stars floor", multivariate gate) and ADR-0002 (transparent
decomposition) are the contract this file encodes.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from gitmaps.promotion import (
    GateConfig,
    PromotionRunner,
    RepoSignals,
    evaluate,
    row_to_signals,
)

from conftest import FakeStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"
DEFAULT = GateConfig()


def days_ago(days: int) -> str:
    return (NOW - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")


# -- orchestration helpers ---------------------------------------------------

SIGNIFICANT = dict(
    stars=80, forks=10, contributors=3, created_at=days_ago(200), pushed_at=days_ago(0),
    description="A focused CLI for reproducible data science.", topics=("python", "cli", "data"),
)
FRINGE = dict(stars=10, created_at=days_ago(100), pushed_at=days_ago(0))
NEITHER = dict(stars=10, created_at=days_ago(500), pushed_at=days_ago(400))


def cand_row(id_: int, **kw) -> tuple:
    fields = dict(id=id_, stars=0, forks=0, contributors=None, created_at=None,
                  pushed_at=None, description=None, homepage=None, topics=(),
                  tracked=False, surfaced=False, surfaced_at=None)
    fields.update(kw)
    return (
        fields["id"], fields["stars"], fields["forks"], fields["contributors"],
        fields["created_at"], fields["pushed_at"], fields["description"],
        fields["homepage"], list(fields["topics"]), fields["tracked"],
        fields["surfaced"], fields["surfaced_at"],
    )


def make_runner(store: FakeStore, **kw) -> PromotionRunner:
    return PromotionRunner(store, now=lambda: NOW, **kw)


def test_runner_promotes_significant_candidate_to_tracked_and_surfaced() -> None:
    store = FakeStore(candidates=[cand_row(1, **SIGNIFICANT)])

    result = make_runner(store).run()

    assert result.candidates == 1
    assert result.promoted_tracked == 1
    assert result.promoted_surfaced == 1
    assert store.tracked_promotions == [1]
    assert store.surfaced_promotions == [(1, STAMP)]
    assert store.state["promotion.last_run_at"] == STAMP
    assert store.state["promotion.promoted_tracked"] == 1
    assert store.state["promotion.promoted_surfaced"] == 1


def test_runner_promotes_fringe_candidate_to_tracked_only() -> None:
    store = FakeStore(candidates=[cand_row(2, **FRINGE)])

    result = make_runner(store).run()

    assert result.promoted_tracked == 1
    assert result.promoted_surfaced == 0
    assert store.tracked_promotions == [2]
    assert store.surfaced_promotions == []


def test_runner_promotes_tracked_repo_to_surfaced() -> None:
    store = FakeStore(tracked_not_surfaced=[cand_row(3, tracked=True, **SIGNIFICANT)])

    result = make_runner(store).run()

    assert result.candidates == 0
    assert result.promoted_tracked == 0
    assert result.promoted_surfaced == 1
    assert store.tracked_promotions == []
    assert store.surfaced_promotions == [(3, STAMP)]


def test_runner_skips_repo_that_qualifies_neither() -> None:
    store = FakeStore(candidates=[cand_row(4, **NEITHER)])

    result = make_runner(store).run()

    assert result.candidates == 1
    assert result.promoted_tracked == 0
    assert result.promoted_surfaced == 0
    assert store.tracked_promotions == []
    assert store.surfaced_promotions == []


def test_runner_mixed_batch() -> None:
    store = FakeStore(
        candidates=[cand_row(1, **SIGNIFICANT), cand_row(2, **FRINGE), cand_row(4, **NEITHER)],
        tracked_not_surfaced=[cand_row(3, tracked=True, **SIGNIFICANT)],
    )

    result = make_runner(store).run()

    assert result.candidates == 3
    assert result.surfaced_candidates == 4
    assert result.promoted_tracked == 2  # id 1 and 2
    assert result.promoted_surfaced == 2  # id 1 and 3
    assert store.tracked_promotions == [1, 2]
    assert store.surfaced_promotions == [(1, STAMP), (3, STAMP)]


def sig(**kw) -> RepoSignals:
    base: dict = {
        "id": 1, "stars": 0, "forks": 0, "contributors": None,
        "created_at": None, "pushed_at": None, "description": None,
        "homepage": None, "topics": (),
    }
    base.update(kw)
    return RepoSignals(**base)


def test_young_active_repo_surfaces_without_high_stars() -> None:
    repo = sig(
        stars=80, forks=10, contributors=3,
        created_at=days_ago(200), pushed_at=days_ago(0),
        description="A focused CLI for reproducible data science.",
        topics=("python", "cli", "data"),
    )

    ev = evaluate(repo, DEFAULT, NOW)

    # score = 0.35*0.8 + 0.2*1.0 + 0.15*0.3 + 0.2*0.8 + 0.1*0.2 = 0.705
    assert round(ev.significance, 3) == 0.705
    assert ev.promote_surfaced
    assert ev.promote_tracked


def test_no_absolute_stars_floor() -> None:
    # ADR-0003: a young repo with a few dozen stars can clear the gate.
    low_stars = sig(
        stars=80, forks=10, contributors=3,
        created_at=days_ago(200), pushed_at=days_ago(0),
        description="A focused CLI for reproducible data science.",
        topics=("python", "cli", "data"),
    )
    high_stars = sig(
        stars=8000, forks=100, contributors=30,
        created_at=days_ago(2000), pushed_at=days_ago(0),
        description="A focused CLI for reproducible data science.",
        topics=("python", "cli", "data"),
    )

    assert evaluate(low_stars, DEFAULT, NOW).promote_surfaced
    assert evaluate(high_stars, DEFAULT, NOW).promote_surfaced


def test_star_farmer_is_not_promoted() -> None:
    # ADR-0003: star-farming must be handled explicitly — bulk stars with no
    # substance, recency, or contributors must NOT clear the multivariate gate.
    repo = sig(stars=10000, forks=0, created_at=days_ago(2000), pushed_at=days_ago(400))

    ev = evaluate(repo, DEFAULT, NOW)

    assert not ev.promote_surfaced
    assert not ev.promote_tracked


def test_fringe_young_active_promoted_to_tracked_even_below_threshold() -> None:
    repo = sig(stars=10, created_at=days_ago(100), pushed_at=days_ago(0))

    ev = evaluate(repo, DEFAULT, NOW)

    assert not ev.promote_surfaced  # below the gate
    assert ev.promote_tracked  # young + non-trivial activity (architecture §4 fringe)


def test_old_inactive_repo_is_not_promoted() -> None:
    repo = sig(stars=10, created_at=days_ago(500), pushed_at=days_ago(400))

    ev = evaluate(repo, DEFAULT, NOW)

    assert not ev.promote_tracked
    assert not ev.promote_surfaced


def test_threshold_is_tunable() -> None:
    repo = sig(
        stars=80, forks=10, contributors=3,
        created_at=days_ago(200), pushed_at=days_ago(0),
        description="A focused CLI for reproducible data science.",
        topics=("python", "cli", "data"),
    )

    assert evaluate(repo, DEFAULT, NOW).promote_surfaced
    assert not evaluate(repo, GateConfig(threshold=0.71), NOW).promote_surfaced


def test_missing_dates_are_neutral() -> None:
    repo = sig(stars=80, description="has substance", topics=("python",))

    ev = evaluate(repo, DEFAULT, NOW)

    # no age / no push -> no momentum, no recency, no fringe
    # substance = 0.5*1 (description) + 0.3*min(1/3,1) (topics) = 0.6
    assert round(ev.significance, 3) == round(0.2 * 0.6, 3)
    assert not ev.promote_tracked
    assert not ev.promote_surfaced


def test_unknown_contributors_are_neutral() -> None:
    base = dict(stars=80, forks=10, created_at=days_ago(200), pushed_at=days_ago(0),
                description="A focused CLI for reproducible data science.")
    unknown = evaluate(sig(**base, contributors=None), DEFAULT, NOW)
    known = evaluate(sig(**base, contributors=100), DEFAULT, NOW)

    # no topics in base -> substance = 0.5*1 = 0.5
    # unknown: 0.35*0.8 + 0.2*1.0 + 0*0.15 + 0.2*0.5 + 0.1*0.2 = 0.60
    # known:   +0.15*1.0 = 0.75
    assert round(unknown.significance, 3) == 0.60
    assert round(known.significance, 3) == 0.75


def test_decomposition_is_transparent() -> None:
    repo = sig(
        stars=80, forks=10, contributors=3,
        created_at=days_ago(200), pushed_at=days_ago(0),
        description="A focused CLI for reproducible data science.",
        topics=("python", "cli", "data"),
    )

    ev = evaluate(repo, DEFAULT, NOW)
    comps = ev.decomposition["components"]

    assert set(comps) == {"momentum", "recency", "contributors", "substance", "engagement"}
    total = sum(c["contribution"] for c in comps.values())
    assert round(total, 6) == round(ev.significance, 6)
    assert ev.decomposition["threshold"] == DEFAULT.threshold


def test_evaluate_accepts_datetime_signals() -> None:
    # Real timestamptz columns come back from psycopg2 as datetime, not str.
    repo = sig(
        stars=80, forks=10, contributors=3,
        created_at=NOW - timedelta(days=200), pushed_at=NOW,
        description="A focused CLI for reproducible data science.",
        topics=("python", "cli", "data"),
    )

    ev = evaluate(repo, DEFAULT, NOW)

    assert round(ev.significance, 3) == 0.705
    assert ev.promote_surfaced and ev.promote_tracked


def test_row_to_signals_maps_store_row() -> None:
    row = (
        42, 80, 10, 3, days_ago(200), days_ago(0),
        "desc", "https://example.com", ["python", "cli"], True, True, "2026-07-01T00:00:00Z",
    )

    repo = row_to_signals(row)

    assert repo.id == 42
    assert repo.stars == 80 and repo.contributors == 3
    assert repo.topics == ("python", "cli")
    assert repo.tracked is True and repo.surfaced is True
    assert repo.homepage == "https://example.com"
