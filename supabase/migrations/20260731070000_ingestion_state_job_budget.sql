-- ============================================================================
-- 08 — `ingestion_state` job/budget state
-- Ticket: .scratch/db-schema/issues/08-ingestion-state-job-budget.md
-- The worker's coordination state — the key/value channel through which jobs
-- stay idempotent, throttle against the GitHub API budget, and remain
-- version-aware (embedding_model_version, layout_version).
-- ============================================================================
begin;

create table if not exists public.ingestion_state (
    key        text        primary key,
    value      jsonb,                                      -- typed per key; see the documented keys below
    updated_at timestamptz not null default now()
);

comment on table public.ingestion_state is
    'Worker coordination state (key/value). Documented keys: job last-run watermarks, rolling per-hour GitHub rate budget, embedding_model_version, layout_version. Single-writer model — only the worker writes.';

commit;
