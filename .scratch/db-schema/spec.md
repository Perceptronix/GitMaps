# db-schema — Database Schema

The database tier of GitMaps, implemented on Supabase Postgres + pgvector.

**Source of truth:** [docs/architecture.md §2 (data model)](../../docs/architecture.md#2-repositories-of-record-the-data-model), §4 (universe tiers), §5 (job graph), §6 (rate budget), §7 (semantic pipeline). Do not drift from the approved architecture; this feature implements its schema and nothing else.

**Scope:** tables, indexes, migrations, and pgvector — no worker/API/frontend logic.

## Tickets

| # | Ticket | Blocked by |
|---|---|---|
| [01](issues/01-migration-foundation.md) | Migration foundation | — |
| [02](issues/02-candidates-discovery-queue.md) | `candidates` discovery queue | 01 |
| [03](issues/03-repos-universe-core.md) | `repos` universe core table | 01 |
| [04](issues/04-pgvector-embedding-hnsw.md) | pgvector: `repos.embedding` + HNSW index | 03 |
| [05](issues/05-snapshots-growth-timeseries.md) | `snapshots` growth time-series | 03 |
| [06](issues/06-momentum-scores-materialized-rankings.md) | `momentum_scores` materialized rankings | 03 |
| [07](issues/07-clusters-cluster-linkage.md) | `clusters` + cluster linkage | 03 |
| [08](issues/08-ingestion-state-job-budget.md) | `ingestion_state` job/budget state | 01 |
| [09](issues/09-schema-integration-verification.md) | Schema integration verification | 02–08 |
