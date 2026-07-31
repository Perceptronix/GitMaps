-- ============================================================================
-- 02 — `candidates` discovery queue
-- Ticket: .scratch/db-schema/issues/02-candidates-discovery-queue.md
-- Enables the discovery stage to enqueue candidate repos, screen them, and
-- record promotion/rejection without touching any other table.
-- ============================================================================
begin;

create table if not exists public.candidates (
    full_name       text        primary key,
    discovered_at   timestamptz not null default now(),
    source          text        not null,
    last_checked_at timestamptz,
    screen_score    numeric,
    status          text        not null default 'pending'
        check (status in ('pending', 'tracked', 'rejected'))
);

comment on table public.candidates is
    'Discovery-stage queue: repos found by search polling, waiting to be screened into the tracked tier.';

-- Worker scan: "what still needs screening".
create index if not exists candidates_status_last_checked_idx
    on public.candidates (status, last_checked_at);

commit;
