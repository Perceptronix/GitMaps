"""Seam 1 (scoring) and Seam 2 (orchestration) — the Momentum engine.

Seam 1 pins the pure scoring rules with no I/O: multi-signal growth, age and
prior-size normalization (so an emerging Repository can outrank an established
giant — PRD), configurable weights without an algorithm change, and the
ADR-0002 transparent decomposition. Seam 2 drives MomentumRunner over
FakeStore: enumerate → score → upsert → rank → progress.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from gitmaps.momentum import MomentumConfig, MomentumRunner, score_repo

from conftest import FakeStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"
DEFAULT = MomentumConfig()

# The documented defaults, for hand-computed expectations.
WEIGHTS = DEFAULT.weights
STARS_WEIGHT = WEIGHTS["stars"]


def days_ago_str(days: int) -> str:
    return (NOW - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")


def snap(days_ago: int, *, kind: str = "core", stars=None, forks=None,
         watchers=None, contributors=None, commit_activity=None) -> tuple:
    """A snapshot row in the store's column order (taken_at, kind, stars,
    forks, watchers, open_issues, contributors, commit_activity)."""
    return (days_ago_str(days_ago), kind, stars, forks, watchers, None,
            contributors, commit_activity)


def week(days_ago: int, total: int) -> dict:
    """A commit_activity week entry starting `days_ago` days before NOW."""
    ts = int((NOW - timedelta(days=days_ago)).timestamp())
    return {"week": ts, "total": total, "days": [0] * 7}


# Emerging vs established: the PRD headline — 5★/day young beats 50★/day giant.
EMERGING = [snap(7, stars=100, forks=10, watchers=5), snap(0, stars=135, forks=10, watchers=5)]
GIANT = [snap(7, stars=100000, forks=10, watchers=5), snap(0, stars=100350, forks=10, watchers=5)]

# A repo with every signal growing over a 7-day window (see the hand math in
# test_score_uses_all_five_signals).
ALL_FIVE = [
    snap(7, stars=100, forks=10, watchers=5),
    snap(7, kind="deep", contributors=3),
    snap(0, stars=135, forks=12, watchers=6),
    snap(0, kind="deep", contributors=5, commit_activity=[week(4, 2), week(2, 2)]),
]


# -- Seam 1: the pure scoring rules ------------------------------------------

def test_emerging_repo_outranks_established_giant() -> None:
    emerging = score_repo(EMERGING, days_ago_str(30), DEFAULT, NOW)["7d"]
    giant = score_repo(GIANT, days_ago_str(3000), DEFAULT, NOW)["7d"]

    # emerging: (5★/day)·(size 0.1)·(age 2.5) = 1.25 → ×0.35 = 0.4375
    assert emerging.decomposition["signals"]["stars"]["contribution"] == 0.4375
    assert round(emerging.score, 6) == 0.4375
    # giant: (50★/day)·(size 0.0001)·(age 0.1217) ≈ 0.0006 → ×0.35 ≈ 0.0002
    assert emerging.score > giant.score


def test_high_absolute_growth_alone_does_not_win() -> None:
    # Same velocity (5/day) and age, different prior size → the small prior wins.
    small = score_repo(EMERGING, days_ago_str(30), DEFAULT, NOW)["7d"]
    same_velocity_giant = score_repo(
        [snap(7, stars=100000, forks=10), snap(0, stars=100035, forks=10)],
        days_ago_str(30), DEFAULT, NOW,
    )["7d"]

    small_stars = small.decomposition["signals"]["stars"]["score"]
    giant_stars = same_velocity_giant.decomposition["signals"]["stars"]["score"]
    assert small_stars == 1.25
    assert small_stars > giant_stars


def test_age_normalization_boosts_young_repos() -> None:
    young = score_repo(EMERGING, days_ago_str(30), DEFAULT, NOW)["7d"]
    middle = score_repo(EMERGING, days_ago_str(300), DEFAULT, NOW)["7d"]
    old = score_repo(EMERGING, days_ago_str(3000), DEFAULT, NOW)["7d"]

    assert young.score > middle.score > old.score
    assert young.decomposition["age_factor"] == 2.5  # min(365/30, 2.5)
    assert middle.decomposition["age_factor"] == round(365 / 300, 6)


def test_age_cap_limits_newborn_boost() -> None:
    result = score_repo(EMERGING, days_ago_str(1), DEFAULT, NOW)["7d"]

    assert result.decomposition["age_factor"] == 2.5  # not 365/1


def test_score_uses_all_five_signals() -> None:
    result = score_repo(ALL_FIVE, days_ago_str(30), DEFAULT, NOW)["7d"]
    signals = result.decomposition["signals"]

    for signal in ("stars", "forks", "watchers", "contributors", "commits"):
        assert signals[signal]["contribution"] > 0, signal
    # Hand-computed from the defaults (weights above, targets below):
    assert signals["stars"]["contribution"] == 0.4375        # (5/1)·0.1·2.5 ·0.35
    assert signals["forks"]["contribution"] == 0.535714      # (0.2857/0.2)·1·2.5 ·0.15
    assert signals["watchers"]["contribution"] == 0.357143   # (0.1429/0.1)·1·2.5 ·0.10
    assert signals["contributors"]["contribution"] == 2.857143  # (0.2857/0.05)·1·2.5 ·0.20
    assert signals["commits"]["contribution"] == 0.142857    # (0.5714/2)·1·2.5 ·0.20
    assert round(result.score, 6) == 4.330357


def test_decomposition_is_transparent() -> None:
    result = score_repo(EMERGING, days_ago_str(30), DEFAULT, NOW)["7d"]
    decomposition = result.decomposition

    assert decomposition["period"] == "7d"
    assert decomposition["window_days"] == 7
    assert decomposition["age_days"] == 30.0
    assert decomposition["age_factor"] == 2.5
    assert set(decomposition["signals"]) == {"stars", "forks", "watchers", "contributors", "commits"}

    stars = decomposition["signals"]["stars"]
    assert stars["start"] == 100.0
    assert stars["end"] == 135.0
    assert stars["growth"] == 35.0
    assert stars["span_days"] == 7.0
    assert stars["growth_per_day"] == 5.0
    assert stars["prior_floor"] == 10.0
    assert stars["size_factor"] == 0.1
    assert stars["weight"] == 0.35
    assert stars["score"] == 1.25

    # The decomposition fully explains the score: contributions sum to it.
    total = sum(s["contribution"] for s in decomposition["signals"].values())
    assert round(total, 6) == result.score
    assert decomposition["score"] == result.score


def test_weights_are_configurable_without_algorithm_change() -> None:
    stars_only = MomentumConfig(weights={
        "stars": 1.0, "forks": 0.0, "watchers": 0.0, "contributors": 0.0, "commits": 0.0,
    })

    default_result = score_repo(ALL_FIVE, days_ago_str(30), DEFAULT, NOW)["7d"]
    weighted_result = score_repo(ALL_FIVE, days_ago_str(30), stars_only, NOW)["7d"]

    # Same input, same algorithm — only the weights changed. With stars at
    # weight 1.0 the score is exactly the stars signal score (1.25).
    assert round(weighted_result.score, 6) == 1.25
    assert default_result.score > weighted_result.score
    for signal in ("forks", "watchers", "contributors", "commits"):
        assert weighted_result.decomposition["signals"][signal]["weight"] == 0.0
        assert weighted_result.decomposition["signals"][signal]["contribution"] == 0.0


def test_no_snapshots_scores_zero() -> None:
    results = score_repo([], days_ago_str(30), DEFAULT, NOW)

    for period, result in results.items():
        assert result.score == 0.0
        assert result.decomposition["score"] == 0.0


def test_single_snapshot_scores_zero() -> None:
    result = score_repo([snap(0, stars=100)], days_ago_str(30), DEFAULT, NOW)["7d"]

    assert result.score == 0.0  # no observed growth with one point


def test_declining_signals_contribute_zero() -> None:
    rows = [snap(7, stars=135, forks=10), snap(0, stars=100, forks=10)]
    result = score_repo(rows, days_ago_str(30), DEFAULT, NOW)["7d"]

    assert result.decomposition["signals"]["stars"]["growth"] == 0.0
    assert result.decomposition["signals"]["stars"]["contribution"] == 0.0
    assert result.score == 0.0  # declines score no growth, never negative


def test_unknown_age_is_neutral() -> None:
    result = score_repo(EMERGING, None, DEFAULT, NOW)["7d"]

    assert result.decomposition["age_days"] is None
    assert result.decomposition["age_factor"] == 1.0


def test_commits_signal_counts_weeks_in_window() -> None:
    rows = [snap(0, kind="deep", commit_activity=[week(6, 4), week(4, 5)])]
    result = score_repo(rows, days_ago_str(30), DEFAULT, NOW)["7d"]
    commits = result.decomposition["signals"]["commits"]

    assert commits["growth"] == 9.0
    assert commits["span_days"] == 7.0
    assert round(commits["growth_per_day"], 6) == round(9 / 7, 6)
    assert commits["size_factor"] == 1.0  # a flow, not a stock


def test_commits_with_no_weeks_in_window_score_zero() -> None:
    rows = [snap(0, kind="deep", commit_activity=[week(10, 4), week(12, 5)])]
    result = score_repo(rows, days_ago_str(30), DEFAULT, NOW)["7d"]

    assert result.decomposition["signals"]["commits"]["growth"] == 0.0


def test_span_uses_observed_time_not_period() -> None:
    # A repo with only 3 days of history: its true rate must not be diluted by
    # the 7-day window — velocity is over the observed span, not the period.
    rows = [snap(3, stars=10), snap(2, stars=20), snap(1, stars=30), snap(0, stars=40)]
    result = score_repo(rows, days_ago_str(3), DEFAULT, NOW)["7d"]
    stars = result.decomposition["signals"]["stars"]

    assert stars["growth"] == 30.0
    assert stars["span_days"] == 3.0
    assert stars["growth_per_day"] == 10.0


def test_max_signal_score_caps_saturation() -> None:
    capped = MomentumConfig(max_signal_score=1.0)
    result = score_repo(EMERGING, days_ago_str(30), capped, NOW)["7d"]

    assert result.decomposition["signals"]["stars"]["score"] == 1.0  # raw 1.25


def test_missing_signal_values_are_ignored() -> None:
    rows = [snap(7, stars=100, forks=10), snap(3, stars=None, forks=10), snap(0, stars=135, forks=10)]
    result = score_repo(rows, days_ago_str(30), DEFAULT, NOW)["7d"]

    assert result.decomposition["signals"]["stars"]["growth"] == 35.0


def test_snapshot_rows_accept_datetime_taken_at() -> None:
    # Real timestamptz columns come back from psycopg2 as datetime, not str.
    rows = [
        (NOW - timedelta(days=7), "core", 100, 10, 5, None, None, None),
        (NOW, "core", 135, 10, 5, None, None, None),
    ]
    result = score_repo(rows, days_ago_str(30), DEFAULT, NOW)["7d"]

    assert result.decomposition["signals"]["stars"]["score"] == 1.25


def test_config_validates_weights() -> None:
    with pytest.raises(ValueError, match="weights must cover"):
        MomentumConfig(weights={"stars": 0.5})
    with pytest.raises(ValueError, match="sum to 1.0"):
        MomentumConfig(weights={
            "stars": 0.4, "forks": 0.4, "watchers": 0.4, "contributors": 0.4, "commits": 0.4,
        })
    with pytest.raises(ValueError, match="non-negative"):
        MomentumConfig(weights={
            "stars": -0.1, "forks": 0.35, "watchers": 0.10, "contributors": 0.35, "commits": 0.30,
        })
    with pytest.raises(ValueError, match="unknown momentum period"):
        MomentumConfig(periods=("1d", "90d"))


# -- Seam 2: MomentumRunner over FakeStore ------------------------------------

def make_runner(store: FakeStore, **kw) -> MomentumRunner:
    return MomentumRunner(store, now=lambda: NOW, **kw)


def test_runner_scores_each_repo_and_writes_all_periods() -> None:
    store = FakeStore(
        snapshot_repo_ids=[1, 2],
        momentum_snapshots={1: EMERGING, 2: GIANT},
        repo_created_at={1: days_ago_str(30), 2: days_ago_str(3000)},
    )

    result = make_runner(store).run()

    assert result.computed_at == STAMP
    assert result.periods == ("1d", "7d", "30d")
    assert result.repos_scored == 2
    assert result.rows_written == 6  # 2 repos × 3 periods
    assert len(store.momentum_rows) == 6
    assert {r["period"] for r in store.momentum_rows} == {"1d", "7d", "30d"}
    assert {r["computed_at"] for r in store.momentum_rows} == {STAMP}
    assert all(r["rank"] is None for r in store.momentum_rows)  # ranks assigned after

    by_repo_period = {(r["repo_id"], r["period"]): r for r in store.momentum_rows}
    emerging_7d = by_repo_period[(1, "7d")]
    giant_7d = by_repo_period[(2, "7d")]
    assert emerging_7d["score"] > giant_7d["score"]
    assert emerging_7d["decomposition"]["signals"]["stars"]["contribution"] == 0.4375

    assert store.state["momentum.last_run_at"] == STAMP
    assert store.state["momentum.last_count"] == 2
    assert store.rank_calls == [("1d", STAMP), ("7d", STAMP), ("30d", STAMP)]


def test_runner_paginates_through_repo_ids() -> None:
    store = FakeStore(snapshot_repo_ids=[1, 2, 3, 4, 5])

    result = make_runner(store, batch_size=2).run()

    # Pages of 2: (0,2,4) then the short page [5] ends the loop.
    assert store.repo_id_calls == [(2, 0), (2, 2), (2, 4)]
    assert result.repos_scored == 5
    assert len(store.momentum_rows) == 15  # every repo scores 0 with no history


def test_runner_fetches_snapshots_with_window_bounds() -> None:
    store = FakeStore(snapshot_repo_ids=[1], momentum_snapshots={1: EMERGING})

    make_runner(store).run()

    # since = now - 30d (the widest period), until = now
    since = (NOW - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
    assert store.momentum_get_calls == [(1, since, STAMP)]
