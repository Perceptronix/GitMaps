"""Worker entrypoint — run one ingestion job, committing on success.

    python -m gitmaps.worker discover
    python -m gitmaps.worker snapshot_core
    python -m gitmaps.worker snapshot_deep
    python -m gitmaps.worker promote
    python -m gitmaps.worker momentum

Every job runs inside a transaction that COMMITS on success and ROLLS BACK on
failure (architecture D-10 single-writer, and the fix for the collector's
missing-commit finding: DiscoveryRunner/SnapshotRunner are transaction-agnostic;
persistence happens here). `settings`, `db`, and `client_factory` are injectable
so tests can drive the full dispatch without env, network, or a database.
"""

from __future__ import annotations

import sys
from typing import Callable, Sequence

from gitmaps.collector import DiscoveryRunner
from gitmaps.config import Settings
from gitmaps.db import Db
from gitmaps.github.client import GitHubClient
from gitmaps.momentum import MomentumConfig, MomentumRunner
from gitmaps.promotion import GateConfig, PromotionRunner
from gitmaps.repo_store import RepoStore
from gitmaps.snapshotter import SnapshotRunner

JOBS = ("discover", "snapshot_core", "snapshot_deep", "promote", "momentum")


def run_job(job: str, settings: Settings, store: RepoStore, client_factory: Callable[[Settings], object]) -> str:
    client = client_factory(settings)
    if job == "discover":
        discovery = DiscoveryRunner(client, store).run()
        return f"discover: found={discovery.found} stored={discovery.stored} dropped={discovery.dropped}"
    if job == "promote":
        promoter = PromotionRunner(store, config=GateConfig(threshold=settings.significance_threshold))
        promo_result = promoter.run()
        return (
            f"promote: candidates={promo_result.candidates} tracked={promo_result.promoted_tracked} "
            f"surfaced={promo_result.promoted_surfaced}"
        )
    if job == "momentum":
        momentum = MomentumRunner(
            store, config=MomentumConfig(weights=settings.momentum_signal_weights)
        ).run()
        return (
            f"momentum: repos={momentum.repos_scored} rows={momentum.rows_written} "
            f"periods={'/'.join(momentum.periods)}"
        )
    runner = SnapshotRunner(client, store, budget_per_hour=settings.rate_budget_per_hour)
    if job == "snapshot_core":
        result = runner.run_core()
    else:
        result = runner.run_deep()
    return (
        f"{job}: attempted={result.attempted} inserted={result.inserted} "
        f"skipped={result.skipped} rate_limited={result.rate_limited}"
    )


def main(
    argv: Sequence[str] | None = None,
    *,
    settings: Settings | None = None,
    db: Db | None = None,
    client_factory: Callable[[Settings], object] | None = None,
) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 1 or argv[0] not in JOBS:
        print(f"usage: python -m gitmaps.worker <{'|'.join(JOBS)}>", file=sys.stderr)
        return 2

    job = argv[0]
    try:
        settings = settings if settings is not None else Settings.from_env()
    except ValueError as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return 1

    factory = client_factory or (lambda s: GitHubClient(list(s.github_tokens)))
    try:
        with (db if db is not None else Db.connect(settings.database_url)) as conn:
            store = RepoStore(conn)
            summary = run_job(job, settings, store, factory)
    except Exception as exc:  # propagates through `with` -> rollback, then reported
        print(f"{job} failed: {exc}", file=sys.stderr)
        return 1

    print(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
