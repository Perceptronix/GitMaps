-- ============================================================================
-- 03 — `repos` universe core table
-- Ticket: .scratch/db-schema/issues/03-repos-universe-core.md
-- The central table every tier references (tracked/surfaced, significance,
-- latest signals, layout position). Additive seams left open, per the ticket:
--   * embedding VECTOR(n)  added by migration 04
--   * cluster_id FK        added by migration 07
-- ============================================================================
begin;

create table if not exists public.repos (
    id                 bigint      primary key,            -- GitHub repo id (inserted by the worker)
    owner              text        not null,
    name               text        not null,
    full_name          text        not null unique,        -- "owner/name"
    description        text,
    topics             text[]      not null default '{}',
    language           text,
    license            text,
    homepage           text,
    archived           boolean     not null default false,
    is_fork            boolean     not null default false,
    created_at         timestamptz,                        -- repo birth (the age signal)
    pushed_at          timestamptz,
    tracked            boolean     not null default false, -- tracked tier (snapshotted daily)
    surfaced           boolean     not null default false, -- surfaced tier (significant, on the map)
    significance_score numeric,                            -- gate result (transparency)
    significance_vars  jsonb,                              -- gate component inputs
    stars              integer     not null default 0,
    forks              integer     not null default 0,
    watchers           integer     not null default 0,
    open_issues        integer     not null default 0,
    contributors       integer,
    first_snapshot_at  timestamptz,
    last_snapshot_at   timestamptz,
    surfaced_at        timestamptz,
    map_x              numeric,                            -- current layout position
    map_y              numeric
);

comment on table public.repos is
    'One row per known repository. The two tiers: tracked (snapshotted) and surfaced (significant, on the semantic map).';

-- Tier scans: which repos to snapshot (tracked) / which to show (surfaced).
create index if not exists repos_tracked_idx  on public.repos (tracked);
create index if not exists repos_surfaced_idx on public.repos (surfaced);

commit;
