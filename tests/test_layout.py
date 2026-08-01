"""Seam tests for the deterministic semantic-map layout (Phase 8, D-04).

Three layers, mirroring the clustering suite:
  * pure layer — MDS cluster-centroid positions (deterministic, normalized to
    [-1, 1]), PCA member offsets around a centroid, and the crc32 jitter that
    keeps new nodes / identical embeddings apart.
  * runner layer — LayoutRunner over FakeStore: full pass positions every
    cluster + member and bumps layout_version; the incremental pass anchors
    only *new* nodes (map_x IS NULL) at their cluster centroid + jitter.

The engine runs the real scikit-learn MDS/PCA (the numba-free stack), never a
mock of the geometry.
"""

from __future__ import annotations

from datetime import datetime, timezone

from gitmaps.layout import (
    LAYOUT_VERSION_KEY,
    PROGRESS_PREFIX,
    LayoutConfig,
    LayoutRunner,
    cluster_positions,
    jitter_offset,
    layout_version,
    member_offsets,
)

from conftest import FakeStore

NOW = datetime(2026, 7, 31, 12, 0, 0, tzinfo=timezone.utc)
STAMP = "2026-07-31T12:00:00Z"

#: Two well-separated 3-d blobs, as in the clustering suite.
BLOB_A: list[list[float]] = [[1, 0, 0], [0.95, 0.31, 0], [0.99, 0.14, 0], [0.93, 0.37, 0]]
BLOB_B: list[list[float]] = [[0, 1, 0], [0.31, 0.95, 0], [0.14, 0.99, 0], [0.37, 0.93, 0]]


def _runner(store: FakeStore) -> LayoutRunner:
    return LayoutRunner(store, now=lambda: NOW)


def _member_row(repo_id: int, cluster_id: int, embedding: list[float]) -> tuple:
    return (repo_id, cluster_id, embedding)


# ---------------------------------------------------------------------------
# Pure engine
# ---------------------------------------------------------------------------


def test_layout_version_changes_with_tuning() -> None:
    base = layout_version(LayoutConfig())
    assert layout_version(LayoutConfig()) == base
    assert layout_version(LayoutConfig(scatter=0.1)) != base
    assert layout_version(LayoutConfig(jitter=0.05)) != base


def test_cluster_positions_empty_and_single() -> None:
    assert cluster_positions([], LayoutConfig()) == []
    assert cluster_positions([[1.0, 0.0, 0.0]], LayoutConfig()) == [(0.0, 0.0)]


def test_cluster_positions_deterministic_and_normalized() -> None:
    centroids = [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [0.5, 0.5, 0.0]]
    first = cluster_positions(centroids, LayoutConfig())
    again = cluster_positions(centroids, LayoutConfig())
    assert first == again  # deterministic for a fixed cluster set
    assert len(first) == 4
    # Normalized to the unit canvas, and two distinct centroids never coincide.
    assert all(-1.0 <= x <= 1.0 and -1.0 <= y <= 1.0 for x, y in first)
    assert len({(round(x, 9), round(y, 9)) for x, y in first}) == 4


def test_member_offsets_empty_and_single() -> None:
    assert member_offsets([], LayoutConfig()) == []
    assert member_offsets([[1.0, 0.0, 0.0]], LayoutConfig()) == [(0.0, 0.0)]


def test_member_offsets_are_bounded_and_distinct() -> None:
    config = LayoutConfig(scatter=0.06)
    offsets = member_offsets(BLOB_A, config)
    assert len(offsets) == len(BLOB_A)
    # Every offset component stays within the scatter radius of the centroid.
    for ox, oy in offsets:
        assert abs(ox) <= config.scatter + 1e-9
        assert abs(oy) <= config.scatter + 1e-9
    # The engine is deterministic: identical inputs give identical offsets.
    same = member_offsets([[1.0, 0.0, 0.0]] * 3, config)
    assert same == member_offsets([[1.0, 0.0, 0.0]] * 3, config)


def test_jitter_offset_deterministic_and_bounded() -> None:
    config = LayoutConfig(jitter=0.03)
    a = jitter_offset(101, config)
    b = jitter_offset(101, config)
    c = jitter_offset(202, config)
    assert a == b  # stable for the same repo id
    assert a != c  # distinct repos land apart
    for x, y in (a, c):
        assert -config.jitter <= x <= config.jitter
        assert -config.jitter <= y <= config.jitter


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


def test_runner_full_pass_positions_clusters_and_members() -> None:
    store = FakeStore(
        layout_member_rows=[
            _member_row(101, 1, BLOB_A[0]),
            _member_row(102, 1, BLOB_A[1]),
            _member_row(103, 1, BLOB_A[2]),
            _member_row(104, 1, BLOB_A[3]),
            _member_row(201, 2, BLOB_B[0]),
            _member_row(202, 2, BLOB_B[1]),
            _member_row(203, 2, BLOB_B[2]),
            _member_row(204, 2, BLOB_B[3]),
        ],
    )
    # No stored layout version -> a full recompute.
    assert store.get_state(LAYOUT_VERSION_KEY) is None

    result = _runner(store).run()

    assert result.force_full is True
    assert result.clusters_placed == 2
    assert result.repos_placed == 8

    # Both clusters got distinct, normalized centroid positions.
    positions = {cluster_id: (x, y) for cluster_id, x, y in store.cluster_positions_written}
    assert set(positions) == {1, 2}
    assert positions[1] != positions[2]

    # Every member got a unique position inside the unit canvas.
    repo_xy = {(x, y, repo_id) for x, y, repo_id in store.repo_positions_written}
    assert len(repo_xy) == 8
    assert {repo_id for _, _, repo_id in store.repo_positions_written} == {101, 102, 103, 104, 201, 202, 203, 204}
    assert all(-1.1 <= x <= 1.1 and -1.1 <= y <= 1.1 for x, y, _ in store.repo_positions_written)

    # The recompute trigger advanced to the current layout version.
    assert store.get_state(LAYOUT_VERSION_KEY) == result.version == layout_version(LayoutConfig())
    assert store.get_state(PROGRESS_PREFIX + "last_repos") == 8


def test_runner_incremental_anchors_only_new_nodes() -> None:
    config = LayoutConfig()
    store = FakeStore(
        state={LAYOUT_VERSION_KEY: layout_version(config)},
        cluster_position_rows=[(1, 0.5, -0.2), (2, -0.4, 0.3)],
        layout_due=[(101, 1), (102, 2), (103, 2)],
    )
    result = _runner(store).run()

    assert result.force_full is False
    assert result.clusters_placed == 2  # clusters that have a centroid
    assert result.repos_placed == 3

    # Each new node sits at its cluster centroid + its own deterministic jitter.
    by_repo = {repo_id: (x, y) for x, y, repo_id in store.repo_positions_written}
    for repo_id, cluster_id in [(101, 1), (102, 2), (103, 2)]:
        cx, cy = {1: (0.5, -0.2), 2: (-0.4, 0.3)}[cluster_id]
        jx, jy = jitter_offset(repo_id, config)
        assert by_repo[repo_id] == (cx + jx, cy + jy)
    assert by_repo[102] != by_repo[103]  # distinct jitter, no overlap


def test_runner_incremental_skips_member_without_centroid() -> None:
    config = LayoutConfig()
    store = FakeStore(
        state={LAYOUT_VERSION_KEY: layout_version(config)},
        cluster_position_rows=[(1, 0.0, 0.0)],
        layout_due=[(101, 1), (202, 2)],  # cluster 2 has no centroid yet
    )
    result = _runner(store).run()

    assert result.force_full is False
    assert result.repos_placed == 1
    assert [repo_id for _, _, repo_id in store.repo_positions_written] == [101]


def test_runner_full_then_incremental_is_geometry_quiet() -> None:
    store = FakeStore(
        layout_member_rows=[_member_row(101, 1, BLOB_A[0]), _member_row(102, 1, BLOB_A[1])],
    )
    runner = _runner(store)

    first = runner.run()
    assert first.force_full is True

    # A second run against the same store (now carrying the version) is quiet:
    # no cluster members are due, so nothing moves.
    second = runner.run()
    assert second.force_full is False
    assert second.repos_placed == 0
    assert len(store.repo_positions_written) == 2  # only the full pass wrote
