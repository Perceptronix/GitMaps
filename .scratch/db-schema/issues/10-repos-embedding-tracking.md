# 10 — `repos` embedding tracking columns

**Type:** task
**Status:** ready-for-agent

**What to build:** the embedding pipeline's incremental state on the `repos` row. Migration 04 already adds the `embedding vector(384)` column; this adds the two bookkeeping columns the pipeline needs to *skip* already-embedded repositories unless their semantic content changed: `embedding_fingerprint` (a stable hash of the composed semantic content the embedding was built from) and `embedded_at` (when it was written). Additive only — never edit migrations 03/04.

**Blocked by:** 03, 04

- [ ] `repos.embedding_fingerprint` column exists (text, nullable).
- [ ] `repos.embedded_at` column exists (timestamptz, nullable).
- [ ] The migration applies cleanly on fresh and already-migrated databases (`add column if not exists`).
- [ ] The due-repo query (`embedding IS NULL OR embedded_at IS NULL OR embedded_at < pushed_at`) is expressible against this schema.
- [ ] The model version stays in `ingestion_state` (ticket 08 convention), not in the schema.
