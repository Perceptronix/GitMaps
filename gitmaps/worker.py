"""Worker entrypoint — run one ingestion job, committing on success.

    python -m gitmaps.worker discover
    python -m gitmaps.worker snapshot_core
    python -m gitmaps.worker snapshot_deep
    python -m gitmaps.worker promote
    python -m gitmaps.worker momentum
    python -m gitmaps.worker embed
    python -m gitmaps.worker classify
    python -m gitmaps.worker cluster
    python -m gitmaps.worker layout

Every job runs inside a transaction that COMMITS on success and ROLLS BACK on
failure (architecture D-10 single-writer, and the fix for the collector's
missing-commit finding: DiscoveryRunner/SnapshotRunner are transaction-agnostic;
persistence happens here). `settings`, `db`, and `client_factory` are injectable
so tests can drive the full dispatch without env, network, or a database.
"""

from __future__ import annotations

import sys
from typing import Callable, Sequence

from gitmaps.classification import ClassificationRunner
from gitmaps.clustering import ClusteringRunner
from gitmaps.collector import DiscoveryRunner
from gitmaps.config import Settings
from gitmaps.db import Db
from gitmaps.embeddings import EmbeddingRunner, build_embedding_provider
from gitmaps.github.client import GitHubClient
from gitmaps.github.graphql_client import GraphQLBatchClient, GraphQLClient
from gitmaps.layout import LayoutRunner
from gitmaps.momentum import MomentumConfig, MomentumRunner
from gitmaps.promotion import GateConfig, PromotionRunner
from gitmaps.repo_store import RepoStore
from gitmaps.snapshotter import SnapshotRunner

JOBS = ("discover", "snapshot_core", "snapshot_deep", "promote", "momentum", "embed", "classify", "cluster", "layout")


def run_job(
    job: str,
    settings: Settings,
    store: RepoStore,
    client_factory: Callable[[Settings], object],
    graphql_factory: Callable[[Settings], GraphQLBatchClient] | None = None,
) -> str:
    client = client_factory(settings)
    if job == "discover":
        # Discovery enriches the screened repos via a batched GraphQL fetch
        # (metadata + README in one call per ~50 repos); REST search data is the
        # fallback when the GraphQL path fails. Optional so tests stay hermetic.
        graphql = graphql_factory(settings) if graphql_factory is not None else None
        discovery = DiscoveryRunner(client, store, graphql=graphql).run()
        return (
            f"discover: found={discovery.found} stored={discovery.stored} "
            f"dropped={discovery.dropped} sweeps={len(discovery.sweeps)}"
        )
    if job == "promote":
        promoter = PromotionRunner(store, config=GateConfig(threshold=settings.significance_threshold))
        promo_result = promoter.run()
        # The candidates→surfaced funnel: how many repos the significance gate
        # saw (surfaced_candidates) vs how many it actually surfaced. A tiny
        # ratio here means the gate is over-filtering, not the discovery sweep.
        return (
            f"promote: candidates={promo_result.candidates} tracked={promo_result.promoted_tracked} "
            f"surfaced_candidates={promo_result.surfaced_candidates} "
            f"promoted_surfaced={promo_result.promoted_surfaced}"
        )
    if job == "momentum":
        momentum = MomentumRunner(
            store, config=MomentumConfig(weights=settings.momentum_signal_weights)
        ).run()
        return (
            f"momentum: repos={momentum.repos_scored} rows={momentum.rows_written} "
            f"periods={'/'.join(momentum.periods)}"
        )
    if job == "embed":
        provider = build_embedding_provider(
            provider=settings.embedding_provider,
            model=settings.embedding_model,
            dimension=settings.embedding_dimension,
            http_url=settings.embedding_http_url,
            http_api_key=settings.embedding_http_api_key,
        )
        embedding_result = EmbeddingRunner(
            client, store, provider=provider, budget_per_hour=settings.rate_budget_per_hour
        ).run()
        return (
            f"embed: seen={embedding_result.repos_seen} "
            f"embedded={embedding_result.embedded} "
            f"skipped={embedding_result.skipped} model={embedding_result.model_version}"
        )
    if job == "classify":
        classification_result = ClassificationRunner(
            client, store, budget_per_hour=settings.rate_budget_per_hour
        ).run()
        return (
            f"classify: seen={classification_result.repos_seen} "
            f"classified={classification_result.classified} "
            f"skipped={classification_result.skipped} "
            f"errors={classification_result.errors}"
        )
    if job == "cluster":
        clustering_result = ClusteringRunner(store).run()
        return (
            f"cluster: seen={clustering_result.repos_seen} "
            f"domains={clustering_result.domains_clustered} "
            f"clusters={clustering_result.clusters_created} "
            f"assigned={clustering_result.repos_assigned}"
        )
    if job == "layout":
        layout_result = LayoutRunner(store).run()
        return (
            f"layout: clusters={layout_result.clusters_placed} "
            f"repos={layout_result.repos_placed} full={layout_result.force_full}"
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
    graphql_factory: Callable[[Settings], GraphQLBatchClient] | None = None,
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
    # GraphQL enrichment is on by default for discovery; tests inject a fake.
    gfactory = graphql_factory or (lambda s: GraphQLClient(list(s.github_tokens)))
    try:
        with (db if db is not None else Db.connect(settings.database_url)) as conn:
            store = RepoStore(conn)
            summary = run_job(job, settings, store, factory, gfactory)
    except Exception as exc:  # propagates through `with` -> rollback, then reported
        print(f"{job} failed: {exc}", file=sys.stderr)
        return 1

    print(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
