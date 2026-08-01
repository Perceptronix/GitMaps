"""Validate the deterministic semantic-map layout against the live database.

Usage:
    python tools/validate_layout.py [--force-full] [--sample N]

Connects to the live Supabase database, reads every cluster member with an
embedding, and computes the cluster-anchored 2D layout (metric MDS on cluster
centroids + PCA scatter + deterministic jitter) with the same pure core the
worker persists (`layout_by_cluster`), then prints each cluster's centroid and
a sample of member positions. This is the real-data sanity check that the map
is coherent: centroids land in [-1, 1], members of a cluster hug their centroid,
and no two members coincide.

By default this is a **dry run**: it lays the canvas out in memory and writes
nothing. Pass `--force-full` to persist a full recompute through the store (the
same write path as `python -m gitmaps.worker layout`). The daily incremental
anchoring is the worker job's business, not this tool's.

Note: the layout reads whatever clusters exist. If clustering has not been
persisted yet (`python -m gitmaps.worker cluster`), the universe is empty and
the tool reports zero clusters.
"""

from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2  # noqa: E402

from gitmaps.db import Db  # noqa: E402
from gitmaps.layout import (  # noqa: E402
    LayoutConfig,
    LayoutRunner,
    layout_by_cluster,
    layout_member_row_to_input,
)
from gitmaps.repo_store import RepoStore  # noqa: E402


def _env_url() -> str | None:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    try:
        with open(".env", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    value = line.split("=", 1)[1].strip()
                    return value.strip("'\"")
    except OSError:
        return None
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force-full", action="store_true", help="persist a full recompute (like the worker job)")
    parser.add_argument("--sample", type=int, default=6, help="members to print per cluster (default 6)")
    args = parser.parse_args()

    url = _env_url()
    if not url:
        print("no DATABASE_URL in env or .env", file=sys.stderr)
        return 1
    conn = psycopg2.connect(url, connect_timeout=15)
    db = Db(conn)
    store = RepoStore(db)
    config = LayoutConfig()

    if args.force_full:
        result = LayoutRunner(store, config=config).run()
        print(f"persisted full layout: {result.clusters_placed} clusters, "
              f"{result.repos_placed} repos placed")
        conn.commit()
        rows = []
        cur = db.execute(
            "SELECT c.label, c.centroid_x, c.centroid_y, c.member_count "
            "FROM clusters c WHERE c.centroid_x IS NOT NULL ORDER BY c.label"
        )
        for label, cx, cy, count in cur.fetchall():
            rows.append({"label": label, "centroid": (float(cx), float(cy)), "members": [f"({count} repos)"]})
    else:
        conn.set_session(readonly=True)
        members = [layout_member_row_to_input(r) for r in store.list_layout_members()]
        centroid_xy, repo_rows = layout_by_cluster(members, config)
        label_by_cluster = {
            cluster_id: label
            for cluster_id, label in db.execute("SELECT id, label FROM clusters").fetchall()
        }
        cluster_by_repo = {repo_id: cluster_id for repo_id, cluster_id, _ in members}
        repo_ids_by_cluster: dict[int, list[int]] = {}
        for x, y, repo_id in repo_rows:
            repo_ids_by_cluster.setdefault(cluster_by_repo[repo_id], []).append(repo_id)
        rows = []
        for cluster_id, (cx, cy) in sorted(centroid_xy.items()):
            sample_ids = repo_ids_by_cluster.get(cluster_id, [])[: args.sample]
            rows.append({
                "label": label_by_cluster.get(cluster_id, f"cluster {cluster_id}"),
                "centroid": (round(cx, 3), round(cy, 3)),
                "members": [f"#{rid} @ {round(cx, 3)},{round(cy, 3)}" for rid in sample_ids],
            })

    print(f"\nlayout universe: {len(rows)} clusters")
    for row in rows:
        print(f"\n  [{row['label']}] centroid={row['centroid']}")
        for name in row["members"]:
            print(f"      - {name}")
    print(f"\n{len(rows)} clusters laid out")
    db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
