-- ============================================================================
-- 05 — `snapshots` growth time-series
-- Ticket: .scratch/db-schema/issues/05-snapshots-growth-timeseries.md
-- The tiered snapshot cadence (architecture D-03): core signals daily,
-- deep signals weekly. Momentum computation and analytics read this series.
-- ============================================================================
begin;

create table if not exists public.snapshots (
    id              bigint      generated always as identity primary key,
    repo_id         bigint      not null references public.repos (id) on delete cascade,
    taken_at        timestamptz not null,
    kind            text        not null check (kind in ('core', 'deep')),
    -- core (daily, 1 call per repo): stars, forks, watchers, open issues
    stars           integer,
    forks           integer,
    watchers        integer,
    open_issues     integer,
    -- deep (weekly, stats endpoints): contributor count + commit activity
    contributors    integer,
    commit_activity jsonb,
    -- at most one core and one deep point per repo per timestamp
    unique (repo_id, taken_at, kind)
);

comment on table public.snapshots is
    'Growth time-series (D-03 tiered cadence): core signals daily, deep signals weekly. Momentum and analytics read this.';

-- Growth-series reads: "the history for repo X, newest first".
create index if not exists snapshots_repo_taken_idx
    on public.snapshots (repo_id, taken_at desc);

-- Cadence scans: which repos are due for a core/deep snapshot.
create index if not exists snapshots_kind_idx
    on public.snapshots (kind);

commit;
