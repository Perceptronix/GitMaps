-- ============================================================================
-- 12 — Semantic clustering (additive, Phase 7)
-- Two additive columns that make the clustering pipeline (HDBSCAN over the
-- per-domain embedding universe) incremental, on top of migration 07's
-- `clusters` + `repos.cluster_id` schema:
--   * clusters.domain     the technology domain (classification pipeline) this
--                         cluster was computed within — clustering runs per
--                         domain, so a cluster always knows its domain (Phase 7)
--   * repos.clustered_at  when a repo's cluster assignment was last written
--                         (or it was last considered); clustered_at IS NULL
--                         makes it due for the incremental clustering pass
-- Additive only: migrations 01–11 are never edited.
-- ============================================================================
begin;

alter table public.clusters
    add column if not exists domain text;

alter table public.repos
    add column if not exists clustered_at timestamptz;

comment on column public.clusters.domain is
    'The technology domain this cluster was computed within; clusters are per-domain (Phase 7), so incremental assignment matches a repo only to clusters of its own domains.';

comment on column public.repos.clustered_at is
    'When the repo was last assigned a cluster (or last considered); clustered_at IS NULL makes it due for the incremental clustering pass.';

commit;
