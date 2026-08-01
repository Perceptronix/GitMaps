-- ============================================================================
-- 11 — `repos` technology-domain classification (additive, Phase 6.5)
-- The classification pipeline assigns one-or-more technology domains (AI,
-- Frontend, DevOps, ...) to each Repository via a configurable keyword
-- taxonomy, stored independently of the primary programming language.
-- Incremental state on the repos row, mirroring the embedding tracking
-- columns (migration 10):
--   * domains              the assigned domains (text[], multi-assignable)
--   * domains_fingerprint  content hash that produced the assignment
--   * classified_at        when the assignment was written (or verified)
-- classified_at < pushed_at => the content may have changed => re-classify.
-- Additive only: migrations 03/04/10 are never edited.
-- ============================================================================
begin;

alter table public.repos
    add column if not exists domains text[] not null default '{}';

alter table public.repos
    add column if not exists domains_fingerprint text;

alter table public.repos
    add column if not exists classified_at timestamptz;

comment on column public.repos.domains is
    'Technology domains assigned by the classification pipeline (configurable keyword taxonomy), independent of the primary language; a repository may belong to several.';

comment on column public.repos.domains_fingerprint is
    'Stable hash of the composed semantic content that produced the assigned domains; a mismatch signals the content changed.';

comment on column public.repos.classified_at is
    'When the domains were assigned (or verified unchanged); classified_at < pushed_at makes a repo due for re-classification.';

commit;
