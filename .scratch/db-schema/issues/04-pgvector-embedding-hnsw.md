# 04 — pgvector: `repos.embedding` + HNSW index

**Type:** task
**Status:** ready-for-agent

**What to build:** the semantic layer's vector store. Enable the `vector` extension (idempotent); add `embedding VECTOR(n)` to `repos` with the dimension set to the embedding model's output at migration time; create a cosine-similarity HNSW index; establish the distance-query convention (cosine, threshold-gated) that semantic search, similar-repos, and map ANN queries all use. This single column is the whole vector space — the map, search, and similar all read from it.

**Blocked by:** 03

- [ ] `vector` extension enabled via migration, idempotently.
- [ ] `repos.embedding` column exists with the model's dimension.
- [ ] Cosine HNSW index created on the embedding column.
- [ ] An ANN query (nearest-N by cosine) against seeded vectors returns correct ordering.
- [ ] Model dimension / version is recordable in the ingestion_state conventions (ticket 08).
