-- ============================================================================
-- 07 — `clusters` + cluster linkage
-- Ticket: .scratch/db-schema/issues/07-clusters-cluster-linkage.md
-- The semantic map's cluster model, plus the additive `repos.cluster_id` FK.
-- Recompute convention: a layout recompute REPLACES the cluster set (DELETE +
-- re-insert, not TRUNCATE — TRUNCATE would block on the FK below). Deleting a
-- cluster row SET NULLs the cluster_id of its member repos.
-- ============================================================================
begin;

create table if not exists public.clusters (
    id           bigint      generated always as identity primary key,
    label        text,                                      -- human-readable, e.g. "Rust tooling"
    label_source text,                                      -- 'terms' (keyword/term-based labeling)
    member_count integer,
    centroid_x   numeric,
    centroid_y   numeric,
    computed_at  timestamptz not null default now()
);

comment on table public.clusters is
    'Technology clusters on the semantic map, recreated on each layout recompute. Recompute deletes rows (repos.cluster_id is SET NULL) — TRUNCATE is not used because the FK would block it.';

-- Additive seam (migration 03 left this column out).
alter table public.repos
    add column if not exists cluster_id bigint;

-- The one non-idempotent statement in the set — guarded via pg_constraint.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'repos_cluster_id_fkey'
    ) then
        alter table public.repos
            add constraint repos_cluster_id_fkey
            foreign key (cluster_id) references public.clusters (id) on delete set null;
    end if;
end $$;

-- Map reads: "all repos in cluster X".
create index if not exists repos_cluster_id_idx
    on public.repos (cluster_id);

commit;
