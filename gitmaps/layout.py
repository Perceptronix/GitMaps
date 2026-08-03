"""The semantic-map layout (Phase 8) — deterministic 2D positions for clusters.

Implements the `layout` job from architecture §7 stage 2/5 (D-04) as a
cluster-anchored replacement for UMAP. umap-learn is rejected for the same
reasons the architecture review applies to hdbscan: it drags in the numba /
llvmlite runtime (~300 MB) and its projection is stochastic, while D-04
requires geometry that stays quiet day-to-day and ADR-0002 requires a
transparent, deterministic engine. Because clustering (Phase 7) already
assigns every Repository to exactly one cluster, the layout exploits that
structure instead of re-embedding from scratch:

  * **Macro** — the K cluster centroids (normalized mean of member embeddings)
    are embedded to 2D with metric MDS started from the classical solution.
    K is in the tens, so this is instant, and centroid positions are stable as
    clusters grow. No random state anywhere: MDS-from-classical and PCA are
    deterministic on their own.
  * **Micro** — a cluster's members are scattered around their centroid with the
    2D PCA of the cluster's embeddings (an exact SVD), scaled to `scatter`
    canvas units, plus a tiny per-Repository deterministic jitter (crc32 of the
    repo id) so members never exactly overlap.

The full pass writes `clusters.centroid_x/y` and `repos.map_x/y`; the daily
incremental pass (D-04 anchor-new) places only *new* nodes — members with no map
position yet (`map_x IS NULL`) that now carry a cluster_id — at their cluster's
centroid plus the deterministic jitter, with no full reprojection, so day-to-day
geometry stays quiet. `layout_version` fingerprints the algorithm + tuning; a
change triggers a full recompute, the same convention as the cluster and
taxonomy versions.

The engine is pure and import-light; `LayoutRunner` persists over the store
seam (same shape as `ClusteringRunner`/`MomentumRunner`). MDS and PCA come from
scikit-learn (already a dependency — the numba-free stack), imported lazily so
`import gitmaps.layout` stays cheap.
"""

from __future__ import annotations

import zlib
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable, Sequence

from gitmaps.clustering import centroid, normalize
from gitmaps.embeddings import semantic_fingerprint
from gitmaps.repo_store import parse_pgvector
from gitmaps.timeutil import utc_stamp

LAYOUT_VERSION_KEY = "layout_version"
PROGRESS_PREFIX = "layout."


@dataclass(frozen=True)
class LayoutConfig:
    """Layout tuning — every field feeds `layout_version` (full-recompute trigger).

    No seed: metric MDS from the classical solution and PCA are both
    deterministic on their own, so the layout is reproducible with no random
    state anywhere in the engine.
    """

    scatter: float = 0.06  # member PCA offset scale around the centroid
    jitter: float = 0.03  # deterministic new-node jitter around the centroid


@dataclass(frozen=True)
class LayoutResult:
    """Summary of one `layout` run (written to ingestion_state too)."""

    version: str
    force_full: bool
    clusters_placed: int  # full: clusters given a centroid; incremental: clusters with one
    repos_placed: int  # members written a map position


def layout_version(config: LayoutConfig) -> str:
    """Stable fingerprint of the algorithm + tuning — the full-recompute trigger.

    Mirrors `clustering_version`: any change that alters the layout means the
    stored version stops matching and the next run is a full recompute of the
    whole canvas.
    """
    parts = (
        f"scatter={config.scatter}",
        f"jitter={config.jitter}",
    )
    return semantic_fingerprint("\n".join(parts))


# ---------------------------------------------------------------------------
# Pure engine
# ---------------------------------------------------------------------------


def cluster_positions(centroids: Sequence[Sequence[float]], config: LayoutConfig) -> list[tuple[float, float]]:
    """2D positions for the K cluster centroids, aligned with the input order.

    Metric MDS from the classical solution — deterministic, no random state —
    then centered and scaled so the canvas fits in [-1, 1], so the map is
    reproducible for a given cluster set. Zero or one cluster falls out to no /
    center position.
    """
    n = len(centroids)
    if n == 0:
        return []
    if n == 1:
        return [(0.0, 0.0)]
    import numpy as np
    from sklearn.manifold import MDS  # type: ignore[import-untyped]

    X = np.array([normalize(c) for c in centroids], dtype=float)
    coords = MDS(
        n_components=2,
        metric_mds=True,
        init="classical_mds",
        n_init=1,
        max_iter=300,
    ).fit_transform(X)
    coords = coords - coords.mean(axis=0)
    extent = float(np.abs(coords).max())
    if extent > 0:
        coords = coords / extent
    return [(float(x), float(y)) for x, y in coords]


def member_offsets(embeddings: Sequence[Sequence[float]], config: LayoutConfig) -> list[tuple[float, float]]:
    """2D offsets for a cluster's members around its centroid, aligned with input.

    2D PCA of the normalized member embeddings (deterministic — an exact SVD,
    no random state), scaled so each offset component stays within `scatter`
    canvas units. Members of a cluster are adjacent by construction; a single
    member sits exactly on the centroid.
    """
    n = len(embeddings)
    if n == 0:
        return []
    if n == 1:
        return [(0.0, 0.0)]
    import numpy as np
    from sklearn.decomposition import PCA  # type: ignore[import-untyped]

    X = np.array([normalize(v) for v in embeddings], dtype=float)
    if not np.any(np.ptp(X, axis=0)):
        return [(0.0, 0.0)] * n  # identical members — the runner's jitter separates them
    scores = PCA(n_components=2).fit_transform(X)
    peak = float(np.abs(scores).max())
    scale = config.scatter / peak if peak > 0 else 0.0
    return [(float(x) * scale, float(y) * scale) for x, y in scores]


def jitter_offset(repo_id: int, config: LayoutConfig) -> tuple[float, float]:
    """A deterministic pseudo-random offset for `repo_id` in [-jitter, jitter]^2.

    Derived from the repo id via crc32 — stable across processes, unlike
    Python's `hash` — so a new node gets a stable, non-overlapping spot near
    its cluster centroid on every incremental pass, and identical embeddings
    in a full pass never land exactly on top of each other.
    """
    h = zlib.crc32(str(repo_id).encode("utf-8"))
    dx = ((h & 0xFFFF) / 0xFFFF) * 2.0 - 1.0
    dy = (((h >> 16) & 0xFFFF) / 0xFFFF) * 2.0 - 1.0
    return (dx * config.jitter, dy * config.jitter)


def layout_member_row_to_input(row: tuple) -> tuple[int, int, list[float]]:
    """Map a list_layout_members row (repo_id, cluster_id, embedding)."""
    repo_id, cluster_id, embedding = row
    return (repo_id, cluster_id, parse_pgvector(embedding) or [])


def layout_by_cluster(
    members: Sequence[tuple[int, int, list[float]]], config: LayoutConfig
) -> tuple[dict[int, tuple[float, float]], list[tuple]]:
    """Compute the full-pass layout in memory — the pure core both the runner and
    the validator call, so a dry run can never drift from what gets persisted.

    `members` is (repo_id, cluster_id, embedding). Returns (cluster_id -> 2D
    centroid position, member rows as (x, y, repo_id)).
    """
    by_cluster: dict[int, list[tuple[int, list[float]]]] = {}
    for repo_id, cluster_id, embedding in members:
        by_cluster.setdefault(cluster_id, []).append((repo_id, embedding))
    cluster_ids = sorted(by_cluster)  # deterministic order

    cluster_xy = cluster_positions(
        [centroid([e for _, e in by_cluster[c]]) for c in cluster_ids], config
    )
    rows: list[tuple] = []
    for cluster_id, (cx, cy) in zip(cluster_ids, cluster_xy):
        entries = by_cluster[cluster_id]
        offsets = member_offsets([e for _, e in entries], config)
        for (repo_id, _), (ox, oy) in zip(entries, offsets):
            jx, jy = jitter_offset(repo_id, config)
            rows.append((cx + ox + jx, cy + oy + jy, repo_id))
    return dict(zip(cluster_ids, cluster_xy)), rows


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


class LayoutRunner:
    """Orchestrates one `layout` run over the store seam (pure engine above)."""

    def __init__(
        self,
        store,
        *,
        now: Callable[[], datetime] | None = None,
        config: LayoutConfig | None = None,
    ) -> None:
        self._store = store
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._config = config or LayoutConfig()

    def run(self) -> LayoutResult:
        version = layout_version(self._config)
        stored = self._store.get_state(LAYOUT_VERSION_KEY)
        run_stamp = utc_stamp(self._now())
        if stored != version:
            return self._run_full(version, run_stamp)
        return self._run_incremental(version, run_stamp)

    # -- full pass -----------------------------------------------------------

    def _run_full(self, version: str, run_stamp: str) -> LayoutResult:
        members = [
            layout_member_row_to_input(r) for r in self._store.list_layout_members()
        ]
        centroid_xy, rows = layout_by_cluster(members, self._config)
        for cluster_id, (x, y) in centroid_xy.items():
            self._store.set_cluster_position(cluster_id, x, y)
        self._store.set_repo_positions(rows)

        self._record_state(version, run_stamp, len(centroid_xy), len(rows))
        return LayoutResult(
            version=version,
            force_full=True,
            clusters_placed=len(centroid_xy),
            repos_placed=len(rows),
        )

    # -- incremental pass ----------------------------------------------------

    def _run_incremental(self, version: str, run_stamp: str) -> LayoutResult:
        # numeric columns come back as Decimal — normalize to float for arithmetic.
        centroid_by_cluster = {
            cluster_id: (float(x), float(y))
            for cluster_id, domain, label, member_count, x, y in self._store.list_cluster_positions()
        }
        rows: list[tuple] = []
        for repo_id, cluster_id in self._store.list_due_layout():
            position = centroid_by_cluster.get(cluster_id)
            if position is None:
                continue  # no centroid yet — defer to the next full recompute
            cx, cy = position
            jx, jy = jitter_offset(repo_id, self._config)
            rows.append((cx + jx, cy + jy, repo_id))
        self._store.set_repo_positions(rows)

        self._record_state(version, run_stamp, len(centroid_by_cluster), len(rows))
        return LayoutResult(
            version=version,
            force_full=False,
            clusters_placed=len(centroid_by_cluster),
            repos_placed=len(rows),
        )

    def _record_state(self, version: str, run_stamp: str, clusters: int, repos: int) -> None:
        self._store.set_state(LAYOUT_VERSION_KEY, version)
        self._store.set_state(PROGRESS_PREFIX + "last_run_at", run_stamp)
        self._store.set_state(PROGRESS_PREFIX + "last_clusters", clusters)
        self._store.set_state(PROGRESS_PREFIX + "last_repos", repos)
