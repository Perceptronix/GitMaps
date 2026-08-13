"""
populate_map.py — Full pipeline run to populate the GitMaps semantic map.

Runs every stage in order, with settings tuned for a small/growing dataset:

  1. diagnose   — show current DB counts at each pipeline stage
  2. discover   — fetch new repos from GitHub (extends the watermark)
  3. snapshot   — take core snapshots for all tracked repos
  4. promote    — surface repos that pass the significance gate
                  (uses a LOWER threshold=0.25 for small datasets)
  5. embed      — generate embeddings for all surfaced repos
  6. classify   — assign technology domains
  7. cluster    — HDBSCAN clustering (min_cluster_size=2, universe="all")
  8. layout     — 2-D MDS positions for clusters + members

Usage:
    python .scratch/populate_map.py [--stages all|diagnose|discover|...]
    python .scratch/populate_map.py --stages diagnose
    python .scratch/populate_map.py --stages promote,embed,classify,cluster,layout
    python .scratch/populate_map.py --force-recluster   (wipes cluster/layout state)
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from typing import Any

# ── Load .env ────────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

env_path = os.path.join(ROOT, ".env")
if os.path.exists(env_path):
    with open(env_path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))

import psycopg2  # noqa: E402

from gitmaps.clustering import ClusteringConfig, ClusteringRunner  # noqa: E402
from gitmaps.db import Db  # noqa: E402
from gitmaps.layout import LayoutRunner, LayoutConfig  # noqa: E402
from gitmaps.promotion import GateConfig, PromotionRunner  # noqa: E402
from gitmaps.repo_store import RepoStore  # noqa: E402
from gitmaps.worker import main as worker_main  # noqa: E402

# ── Colours ──────────────────────────────────────────────────────────────────
G = "\033[92m"   # green
Y = "\033[93m"   # yellow
R = "\033[91m"   # red
B = "\033[94m"   # blue
DIM = "\033[2m"
RST = "\033[0m"


def hdr(title: str) -> None:
    bar = "─" * (len(title) + 4)
    print(f"\n{B}┌{bar}┐{RST}")
    print(f"{B}│  {title}  │{RST}")
    print(f"{B}└{bar}┘{RST}")


def ok(msg: str) -> None:
    print(f"  {G}✓{RST}  {msg}")


def warn(msg: str) -> None:
    print(f"  {Y}⚠{RST}  {msg}")


def info(msg: str) -> None:
    print(f"  {DIM}·{RST}  {msg}")


def err(msg: str) -> None:
    print(f"  {R}✗{RST}  {msg}", file=sys.stderr)


# ── Database helpers ─────────────────────────────────────────────────────────

def connect() -> psycopg2.extensions.connection:
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        err("DATABASE_URL not set")
        sys.exit(1)
    return psycopg2.connect(url, connect_timeout=20)


def scalar(conn: Any, sql: str, params: tuple = ()) -> Any:
    with conn.cursor() as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
        return row[0] if row else None


# ── Stage: diagnose ──────────────────────────────────────────────────────────

def run_diagnose(conn: Any) -> dict[str, int]:
    hdr("Diagnose — current pipeline state")

    counts: dict[str, int] = {}

    total       = scalar(conn, "SELECT COUNT(*) FROM repos") or 0
    tracked     = scalar(conn, "SELECT COUNT(*) FROM repos WHERE tracked") or 0
    surfaced    = scalar(conn, "SELECT COUNT(*) FROM repos WHERE surfaced") or 0
    embedded    = scalar(conn, "SELECT COUNT(*) FROM repos WHERE embedded_at IS NOT NULL") or 0
    classified  = scalar(conn, "SELECT COUNT(*) FROM repos WHERE classified_at IS NOT NULL") or 0
    has_domains = scalar(conn, "SELECT COUNT(*) FROM repos WHERE domains IS NOT NULL AND array_length(domains,1) > 0") or 0
    clustered   = scalar(conn, "SELECT COUNT(*) FROM repos WHERE cluster_id IS NOT NULL") or 0
    positioned  = scalar(conn, "SELECT COUNT(*) FROM repos WHERE map_x IS NOT NULL") or 0
    n_clusters  = scalar(conn, "SELECT COUNT(*) FROM clusters") or 0
    with_pos    = scalar(conn, "SELECT COUNT(*) FROM clusters WHERE centroid_x IS NOT NULL") or 0

    counts = {
        "total": total,
        "tracked": tracked,
        "surfaced": surfaced,
        "embedded": embedded,
        "classified": classified,
        "has_domains": has_domains,
        "clustered": clustered,
        "positioned": positioned,
        "n_clusters": n_clusters,
        "clusters_with_position": with_pos,
    }

    rows = [
        ("Total repos",           total,      None),
        ("Tracked",               tracked,    total),
        ("Surfaced",              surfaced,   total),
        ("Embedded",              embedded,   surfaced),
        ("Classified (domains)",  classified, surfaced),
        ("Has domains",           has_domains,surfaced),
        ("Cluster assigned",      clustered,  surfaced),
        ("Map position",          positioned, surfaced),
        ("Clusters",              n_clusters, None),
        ("Clusters with position",with_pos,   n_clusters),
    ]

    max_label = max(len(r[0]) for r in rows)
    for label, count, denom in rows:
        pct = f"  ({count/denom*100:.0f}% of {denom})" if denom else ""
        colour = G if (denom is None or (denom > 0 and count > 0)) else R
        print(f"  {colour}{label:<{max_label}}{RST}  {count:>6}{DIM}{pct}{RST}")

    # Bottleneck diagnosis
    print()
    if positioned == 0:
        warn("No map positions — run the full pipeline.")
    elif n_clusters < 5:
        warn(f"Only {n_clusters} cluster(s) — need more surfaced+embedded+classified repos.")
    else:
        ok(f"Map has {positioned} repos across {n_clusters} clusters.")

    if surfaced == 0 and total > 0:
        warn("No surfaced repos — try lowering SIGNIFICANCE_THRESHOLD or running promote.")
    if embedded == 0 and surfaced > 0:
        warn("Surfaced repos exist but none embedded — run embed.")
    if has_domains == 0 and embedded > 0:
        warn("Embedded repos exist but none classified — run classify.")

    return counts


# ── Stage: promote (lowered threshold) ──────────────────────────────────────

def run_promote(conn: Any, threshold: float = 0.25) -> None:
    hdr(f"Promote  (threshold={threshold})")
    store = RepoStore(Db(conn))
    result = PromotionRunner(
        store,
        config=GateConfig(threshold=threshold),
    ).run()
    conn.commit()
    ok(f"candidates={result.candidates}  tracked={result.promoted_tracked}  "
       f"surfaced_candidates={result.surfaced_candidates}  "
       f"promoted_surfaced={result.promoted_surfaced}")
    if result.promoted_surfaced == 0 and result.surfaced_candidates > 0:
        warn("Nothing surfaced — repos may lack snapshots/momentum data. "
             "Run snapshot_core + momentum first.")


# ── Stage: cluster (min_cluster_size=2, universe=all) ────────────────────────

def run_cluster(conn: Any, force_full: bool = False) -> None:
    hdr("Cluster  (min_cluster_size=2, universe=all)")
    store = RepoStore(Db(conn))

    if force_full:
        info("Force-full: clearing stored clustering version to trigger recompute…")
        store.set_state("clustering_algorithm_version", "")
        conn.commit()

    config = ClusteringConfig(
        min_cluster_size=2,
        universe="all",   # include every embedded+classified repo, not just surfaced
    )
    t0 = time.perf_counter()
    runner = ClusteringRunner(store, config=config)
    result = runner.run()
    conn.commit()
    elapsed = time.perf_counter() - t0

    ok(f"seen={result.repos_seen}  domains={result.domains_clustered}  "
       f"clusters={result.clusters_created}  assigned={result.repos_assigned}  "
       f"noise={result.noise}  ({elapsed:.1f}s)")

    if result.repos_seen == 0:
        warn("No repos seen by clustering — need embedded+classified repos.")
        info("Tip: run embed and classify first.")
    elif result.clusters_created == 0 and not result.force_full:
        info("Incremental pass (no new repos to assign). Use --force-recluster to recompute from scratch.")
    elif result.clusters_created == 0:
        warn("Full pass but 0 clusters created — repos may lack embeddings or domains.")


# ── Stage: layout ────────────────────────────────────────────────────────────

def run_layout(conn: Any, force_full: bool = False) -> None:
    hdr("Layout  (MDS cluster positions + PCA member scatter)")
    store = RepoStore(Db(conn))

    if force_full:
        info("Force-full: clearing stored layout version to trigger recompute…")
        store.set_state("layout_version", "")
        conn.commit()

    t0 = time.perf_counter()
    result = LayoutRunner(store).run()
    conn.commit()
    elapsed = time.perf_counter() - t0

    ok(f"clusters_placed={result.clusters_placed}  repos_placed={result.repos_placed}  "
       f"full={result.force_full}  ({elapsed:.1f}s)")

    if result.repos_placed == 0:
        warn("No repos placed — need cluster assignments first (run cluster stage).")


# ── Stage: worker job passthrough ────────────────────────────────────────────

def run_worker_job(job: str) -> None:
    hdr(f"Worker job: {job}")
    t0 = time.perf_counter()
    rc = worker_main([job])
    elapsed = time.perf_counter() - t0
    if rc == 0:
        ok(f"done ({elapsed:.1f}s)")
    else:
        err(f"job failed with rc={rc}")
        sys.exit(rc)


# ── Main ─────────────────────────────────────────────────────────────────────

ALL_STAGES = ["diagnose", "discover", "snapshot_core", "promote",
              "embed", "classify", "cluster", "layout"]

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--stages",
        default="all",
        help=f"Comma-separated stages to run, or 'all'. Options: {', '.join(ALL_STAGES)}",
    )
    parser.add_argument(
        "--force-recluster",
        action="store_true",
        help="Force a full cluster+layout recompute (clears stored version fingerprints).",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.25,
        help="Significance threshold for promote stage (default: 0.25 — lenient for small datasets).",
    )
    args = parser.parse_args()

    stages_raw = args.stages.strip().lower()
    if stages_raw == "all":
        stages = ALL_STAGES
    else:
        stages = [s.strip() for s in stages_raw.split(",") if s.strip()]
        unknown = [s for s in stages if s not in ALL_STAGES]
        if unknown:
            err(f"Unknown stages: {unknown}. Valid: {ALL_STAGES}")
            sys.exit(1)

    print(f"\n{B}GitMaps Pipeline Runner{RST}")
    print(f"  Stages : {', '.join(stages)}")
    print(f"  Threshold : {args.threshold}")
    print(f"  Force recluster : {args.force_recluster}")

    # Stages that need a direct DB connection (non-worker)
    direct_stages = {"diagnose", "promote", "cluster", "layout"}
    # Stages that go through worker_main (handles their own connection + commit)
    worker_stages = {"discover", "snapshot_core", "embed", "classify"}

    conn = None
    try:
        for stage in stages:
            if stage in worker_stages:
                # Worker handles its own DB connection and commit
                run_worker_job(stage)
            else:
                # Need a direct connection for custom runners
                if conn is None:
                    conn = connect()

                if stage == "diagnose":
                    counts = run_diagnose(conn)
                elif stage == "promote":
                    run_promote(conn, threshold=args.threshold)
                elif stage == "cluster":
                    run_cluster(conn, force_full=args.force_recluster)
                elif stage == "layout":
                    run_layout(conn, force_full=args.force_recluster)

        # Final diagnose after everything
        if stages != ["diagnose"]:
            print()
            if conn is None:
                conn = connect()
            hdr("Final state")
            run_diagnose(conn)

    finally:
        if conn is not None:
            conn.close()

    print(f"\n{G}Done.{RST}\n")


if __name__ == "__main__":
    main()
