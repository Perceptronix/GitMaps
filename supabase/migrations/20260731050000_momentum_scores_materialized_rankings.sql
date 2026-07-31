-- ============================================================================
-- 06 — `momentum_scores` materialized rankings
-- Ticket: .scratch/db-schema/issues/06-momentum-scores-materialized-rankings.md
-- Materialized, decomposed Momentum per period (ADR-0002: transparent and
-- explainable — the decomposition JSONB holds per-signal contributions plus
-- age and size normalization factors). Trending, Fast-growing, node size, and
-- the analytics breakdown all read this table.
-- ============================================================================
begin;

create table if not exists public.momentum_scores (
    repo_id       bigint      not null references public.repos (id) on delete cascade,
    period        text        not null check (period in ('1d', '7d', '30d')),
    computed_at   timestamptz not null,
    score         numeric,                                  -- the Momentum score
    decomposition jsonb,                                    -- per-signal contributions + normalization factors
    rank          integer,                                  -- per-period rank
    primary key (repo_id, period, computed_at)
);

comment on table public.momentum_scores is
    'Materialized, decomposed Momentum per period. The latest computed_at per (repo_id, period) serves reads (upsert convention: a re-run replaces that day''s rows).';

-- Ranking reads: "top N for this period".
create index if not exists momentum_scores_rank_idx
    on public.momentum_scores (period, computed_at, score desc);

-- Latest-score lookup: "current score for repo X in period Y".
create index if not exists momentum_scores_repo_period_idx
    on public.momentum_scores (repo_id, period);

commit;
