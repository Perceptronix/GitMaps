-- ============================================================================
-- 04 — pgvector: `repos.embedding` + HNSW index
-- Ticket: .scratch/db-schema/issues/04-pgvector-embedding-hnsw.md
-- The semantic layer's vector store — one column, one HNSW cosine index,
-- backing semantic search, similar-repos, and map ANN queries.
-- ============================================================================
begin;

create extension if not exists vector;

-- Embedding dimension = output of the EmbeddingProvider's model.
-- architecture.md leaves it open ("dimension = model, set at migration"); the
-- default compact open sentence-encoder (all-MiniLM-L6-v2 class) emits 384.
-- If the EmbeddingProvider model changes, this is a NEW additive migration,
-- never an edit to this one; the model version is recorded in ingestion_state.
alter table public.repos
    add column if not exists embedding vector(384);

create index if not exists repos_embedding_hnsw_idx
    on public.repos using hnsw (embedding vector_cosine_ops);

comment on index public.repos_embedding_hnsw_idx is
    'HNSW cosine index backing semantic search, similar-repos, and map ANN queries.';

commit;
