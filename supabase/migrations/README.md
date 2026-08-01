# GitMaps — Database Migrations

Plain-SQL migrations for the approved GitMaps database schema, targeting **Supabase PostgreSQL** (Postgres + pgvector). Generated from the `db-schema` tickets (`.scratch/db-schema/`) and the schema defined in `docs/architecture.md §2`. No ORM, no application code.

## Run order

Migrations are applied **in filename order**, which matches the ticket dependency order. The migration runner is the **Supabase CLI**, which records each applied migration in `supabase_migrations.schema_migrations` and skips already-applied files — so applying the full set is safe on an empty database, a partially-migrated one, and one that is already current.

| # | File | Ticket | Creates |
|---|---|---|---|
| 01 | `20260731000000_migration_foundation.sql` | 01 | Convention baseline / ordering anchor |
| 02 | `20260731010000_candidates_discovery_queue.sql` | 02 | `candidates` (+ screening index) |
| 03 | `20260731020000_repos_universe_core.sql` | 03 | `repos` (tier flags, significance, latest signals, layout position) |
| 04 | `20260731030000_pgvector_embedding_hnsw.sql` | 04 | `vector` extension, `repos.embedding vector(384)`, HNSW cosine index |
| 05 | `20260731040000_snapshots_growth_timeseries.sql` | 05 | `snapshots` (core/deep series + indexes) |
| 06 | `20260731050000_momentum_scores_materialized_rankings.sql` | 06 | `momentum_scores` (per-period scores + decomposition + ranking indexes) |
| 07 | `20260731060000_clusters_cluster_linkage.sql` | 07 | `clusters` + `repos.cluster_id` FK (additive) |
| 08 | `20260731070000_ingestion_state_job_budget.sql` | 08 | `ingestion_state` (key/value job/budget state) |
| 09 | `20260731080000_schema_integration_verification.sql` | 09 | Verification gate — asserts all of the above exist; **runs last** |
| 10 | `20260801000000_repos_embedding_tracking.sql` | 10 | `repos.embedding_fingerprint`, `repos.embedded_at` (additive, embedding incremental state) |
| 11 | `20260801010000_technology_domains.sql` | — | `repos.domains` (technology domains), `repos.domains_fingerprint`, `repos.classified_at` (additive, classification incremental state) |
| 12 | `20260801020000_semantic_clustering.sql` | — | `clusters.domain`, `repos.clustered_at` (additive, clustering incremental state) |

## Applying

```bash
supabase db push        # apply pending migrations to the linked remote database
supabase migration up   # apply migrations one at a time
```

For a local Supabase stack: `supabase start`, then `supabase db push`. A CI step can run `supabase db push --include-all` to assert the schema is current.

## Conventions

- **Additive only.** A shipped migration is never edited or dropped. Schema change = a new migration with a later timestamp. This is what lets migrations 04 and 07 add the embedding column and `cluster_id` to the already-shipped `repos` table from migration 03.
- **Idempotent where possible.** Statements use `IF NOT EXISTS` / `add column if not exists` where Postgres supports it; the one non-idempotent statement (the `repos.cluster_id` FK in migration 07) is guarded by a `DO` block checking `pg_constraint`. Idempotency is a second line of defence — the CLI's tracking table is the primary one.
- **Plain SQL, no ORM.** Tables live in the `public` schema and are schema-qualified in every file.
- **Verification gate.** Migration 09 fails loudly if any expected table, index, or the `vector` extension is missing — a partial or mis-ordered apply surfaces there instead of in the worker.

## Notes

- **Embedding dimension (`384`)** — set in migration 04. It must match the EmbeddingProvider model's output (the architecture's compact open sentence-encoder class, e.g. all-MiniLM-L6-v2, emits 384). Changing the model is a **new additive migration** (new column or re-embed flow), never an edit to 04; the model version lives in `ingestion_state`.
- **FK delete behavior** — `snapshots` and `momentum_scores` cascade when a `repos` row is deleted; `repos.cluster_id` → `clusters` is `SET NULL` so a layout recompute can replace the cluster set by deleting rows (TRUNCATE would block on the FK).
- **Clustering (migration 12)** — the clustering pipeline (Phase 7) runs HDBSCAN per technology domain over existing embeddings; `clusters.domain` tags each cluster with the domain it was computed within, and `repos.clustered_at` is the incremental-state column (`clustered_at IS NULL` ⇒ due for the incremental nearest-centroid pass). A tuning change to the algorithm is a re-cluster pass driven by `ingestion_state.clustering_algorithm_version`, not a schema edit.
- **Concurrent appliers** — the CLI's migration tracking serializes applies; don't bypass it with manual `psql` DDL.
