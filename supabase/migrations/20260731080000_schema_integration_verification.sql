-- ============================================================================
-- 09 — Schema integration verification (gate, not a data change)
-- Ticket: .scratch/db-schema/issues/09-schema-integration-verification.md
-- Runs LAST (by filename order). Passes if every expected table, index, and
-- extension from migrations 01–08 is present; raises otherwise, so a partial
-- or mis-ordered apply fails loudly here instead of in the worker.
-- Structural checks only — value-level assertions (embedding dimension,
-- model version) belong to the application layer, not to a migration.
-- ============================================================================
begin;

do $$
declare
    missing text[] := '{}';
begin
    -- Extension (migration 04)
    if not exists (select 1 from pg_extension where extname = 'vector') then
        missing := missing || 'extension vector';
    end if;

    -- Tables (migrations 02, 03, 05, 06, 07, 08)
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'candidates') then
        missing := missing || 'table candidates';
    end if;
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'repos') then
        missing := missing || 'table repos';
    end if;
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'snapshots') then
        missing := missing || 'table snapshots';
    end if;
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'momentum_scores') then
        missing := missing || 'table momentum_scores';
    end if;
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'clusters') then
        missing := missing || 'table clusters';
    end if;
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'ingestion_state') then
        missing := missing || 'table ingestion_state';
    end if;

    -- Indexes (migrations 02, 03, 04, 05, 06, 07)
    if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'repos_embedding_hnsw_idx') then
        missing := missing || 'index repos_embedding_hnsw_idx';
    end if;
    if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'candidates_status_last_checked_idx') then
        missing := missing || 'index candidates_status_last_checked_idx';
    end if;
    if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'snapshots_repo_taken_idx') then
        missing := missing || 'index snapshots_repo_taken_idx';
    end if;
    if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'momentum_scores_rank_idx') then
        missing := missing || 'index momentum_scores_rank_idx';
    end if;
    if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'repos_cluster_id_idx') then
        missing := missing || 'index repos_cluster_id_idx';
    end if;

    if cardinality(missing) > 0 then
        raise exception 'Schema verification failed — missing: %', array_to_string(missing, ', ');
    end if;
end $$;

commit;
