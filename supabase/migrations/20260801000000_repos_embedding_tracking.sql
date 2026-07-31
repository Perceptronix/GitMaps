-- ============================================================================
-- 10 — `repos` embedding tracking columns (additive, semantic stage 1)
-- Ticket: .scratch/db-schema/issues/10-repos-embedding-tracking.md
-- The embedding pipeline's incremental state on the repos row: the semantic
-- fingerprint (stable hash of description+topics+language+homepage+truncated
-- README) that produced the current embedding, and when it was written.
-- embedded_at < pushed_at => the repo's content may have changed => re-embed.
-- Additive only: migrations 03/04 are never edited. A model change is a
-- re-embed pass driven by ingestion_state.embedding_model_version, not a
-- schema edit (architecture §7, D-05).
-- ============================================================================
begin;

alter table public.repos
    add column if not exists embedding_fingerprint text;

alter table public.repos
    add column if not exists embedded_at timestamptz;

comment on column public.repos.embedding_fingerprint is
    'Stable hash of the composed semantic content (description+topics+language+homepage+truncated README) that produced the current embedding; a mismatch signals the content changed.';

comment on column public.repos.embedded_at is
    'When the current embedding was written (or verified unchanged); embedded_at < pushed_at makes a repo due for re-embedding.';

commit;
