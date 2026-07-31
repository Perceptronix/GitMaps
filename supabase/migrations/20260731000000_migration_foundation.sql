-- ============================================================================
-- 01 — Migration foundation
-- Ticket: .scratch/db-schema/issues/01-migration-foundation.md
-- ----------------------------------------------------------------------------
-- Conventions (enforced by this repo, not by Postgres):
--   * Additive only  — a shipped migration is never edited or dropped; change
--     is expressed as new migrations that run later in filename order.
--   * Idempotent where possible — every statement tolerates re-running.
--   * Applied in filename order by the Supabase CLI, which records each applied
--     migration in `supabase_migrations.schema_migrations`; re-running an
--     applied migration is skipped there, so the `IF NOT EXISTS` guards in
--     later files are a second line of defence, not the primary one.
--   * Plain SQL, no ORM; tables live in the `public` schema.
-- ----------------------------------------------------------------------------
begin;

-- `public` always exists in Postgres; kept here as the idempotent baseline
-- statement so this migration is a real ordering anchor, not a comment-only file.
create schema if not exists public;

commit;
