"""Validate the semantic clustering pipeline against real GitHub repositories.

Usage:
    python tools/validate_clustering.py [--limit N] [--min-members M] [--force-full]

Connects to the live Supabase database, pulls every embedded, classified
repository (optionally capped), and clusters each technology domain with the
real HDBSCAN engine, then prints the resulting clusters and their term-based
labels. This is the real-data sanity check that (a) the per-domain clusters are
coherent and (b) the labels read like real technology ("AI agents", "Rust
tooling") — the deterministic counterpart is the rolled-back live test in
`tests/test_clustering_integration.py`.

By default this is a **dry run**: it clusters in memory and writes nothing. Pass
`--force-full` to actually persist a full recompute through the store (the same
write path as `python -m gitmaps.worker cluster`); without it the real clusters
are replaced only in the printed output. The daily incremental assignment is the
worker job's business, not this tool's.
"""

from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2  # noqa: E402  (importable only after the repo root is on sys.path)

from gitmaps.clustering import (  # noqa: E402
    ClusteringConfig,
    ClusteringRunner,
    RepoClusterInput,
    cluster_by_domain,
    clustering_row_to_input,
    label_cluster,
)
from gitmaps.db import Db  # noqa: E402
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


def _dry_run_clusters(members: list[RepoClusterInput], config: ClusteringConfig) -> list[dict]:
    """Cluster `members` in memory (no DB writes) and return printable rows.

    Runs the same `cluster_by_domain` core the worker persists, so the dry run
    can never drift from a real full recompute — multi-domain repos are resolved
    to one cluster here exactly as they are on the write path.
    """
    clustering = cluster_by_domain(members, config)
    out: list[dict] = []
    for key, idxs in clustering.resolved_groups:
        label_text = label_cluster(
            key.domain,
            [members[i] for i in idxs],
            domain_term_counts=clustering.domain_term_counts[key.domain],
            domain_size=clustering.domain_size[key.domain],
            config=config,
        )
        out.append({
            "domain": key.domain,
            "label": label_text,
            "members": sorted(members[i].full_name for i in idxs),
        })
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=0, help="cap the number of repos read (0 = no cap)")
    parser.add_argument("--min-members", type=int, default=5, help="min_cluster_size (default 5)")
    parser.add_argument("--force-full", action="store_true", help="persist a full recompute (like the worker job)")
    args = parser.parse_args()

    url = _env_url()
    if not url:
        print("no DATABASE_URL in env or .env", file=sys.stderr)
        return 1
    conn = psycopg2.connect(url, connect_timeout=15)
    db = Db(conn)
    store = RepoStore(db)
    config = ClusteringConfig(min_cluster_size=args.min_members)

    members: list[RepoClusterInput] = []
    if not args.force_full:
        conn.set_session(readonly=True)
        offset = 0
        while True:
            batch = store.list_all_for_clustering(config.universe, 500, offset)
            if not batch:
                break
            members.extend(clustering_row_to_input(row) for row in batch)
            offset += 500
            if len(batch) < 500:
                break
        if args.limit and len(members) > args.limit:
            members = members[: args.limit]

    if args.force_full:
        result = ClusteringRunner(store, config=config).run()
        print(f"persisted full recompute: {result.domains_clustered} domains, "
              f"{result.clusters_created} clusters, {result.repos_assigned}/{result.repos_seen} assigned")
        conn.commit()
        rows = []
        cur = db.execute(
            "SELECT c.domain, c.label, c.member_count FROM clusters c ORDER BY c.domain, c.member_count DESC"
        )
        for domain, label, count in cur.fetchall():
            rows.append({"domain": domain, "label": label, "members": [f"({count} repos)"]})
    else:
        rows = _dry_run_clusters(members, config)
        print(f"\nclustering universe: {len(members)} embedded, classified repos "
              f"(min_cluster_size={args.min_members})")

    total = 0
    for row in rows:
        total += len(row["members"])
        print(f"\n  [{row['domain']}] {row['label']}")
        for name in row["members"]:
            print(f"      - {name}")
    print(f"\n{len(rows)} clusters, {total} member assignments")
    db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
