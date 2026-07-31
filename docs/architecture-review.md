# GitMaps — Architecture Review: Storage, Resource Usage & Maintainability

**Date:** 2026-08-01 · **Reviewed at:** commit `12f28bd` + working tree (worker ingestion core).
**Scope:** disk usage, memory, dependency footprint, model footprint, database growth, caches, build artifacts, overall complexity. **Out of scope:** the Next.js web app and FastAPI read API (not yet present in this repo); test correctness.

**Method:** full read of the worker source (`gitmaps/`), all 10 SQL migrations, `docs/architecture.md`, `PRD.md`, `.env.example`, git history and object store, and the local Python environment. Storage figures below are **order-of-magnitude estimates** for the stated tracked-universe sizes (10k / 50k / 100k), based on the actual row shapes in the code — treat them as ranges, not budgets.

---

## Executive summary

The architecture is sound and the code is unusually clean: three processes over one Postgres+pgvector database (D-01), a single-writer worker (D-10), pure engines behind injected seams, and well-faked tests. **Nothing below requires re-architecting.** The problems are concentrated in four areas:

1. **Unbounded database growth** is the dominant issue. Three structures grow forever with no retention policy — `momentum_scores` (full decomposition JSONB for every repo, 3 periods, every day), `snapshots` (the 52-week `commit_activity` array re-stored weekly, ~52× redundant), and the core snapshot series. At the architecture's own target of ~100k tracked repos this reaches **~150–200 GB/year** of new data. This is a storage-budget problem, not a performance one, and it is fully addressable with retention + decomposition scoping.
2. **The default embedding path is far heavier than it needs to be, and its dependencies are undeclared.** `EMBEDDING_PROVIDER=local` silently pulls `sentence-transformers` + `torch` + `transformers` + `tokenizers` (~1 GB installed, ~175 MB model cache) that are **not** in `pyproject.toml` — yet `.env.example` documents a dependency-free `local-hash-v1` embedder that does not exist. A fresh install then the default `embed` job crashes with `ModuleNotFoundError`.
3. **Several columns and one table are dead or stale**, including one live correctness bug: `repos.contributors` is never written, so the significance gate's contributors signal (weight 0.15) is permanently 0. The `candidates` table exists and is asserted by the schema-verification migration, but nothing writes it.
4. **Batch-job resource coordination has gaps**: embedding calls the model one text at a time (no batching), snapshot/promotion jobs process a single 100-item batch per invocation (the architecture's 100k universe would take ~1,000 days at the documented daily cron), the shared GitHub rate budget is a read-modify-write race across processes, and the promised APScheduler in-process scheduler is not implemented (`worker.py` is a one-shot CLI; the `SCHEDULE_*` env keys are never read).

The prioritized recommendations (§4) are each self-contained, none touches the domain model, and together they cut the storage growth estimate from **~150–200 GB/yr → a few GB/yr steady-state** at 100k tracked, roughly halve the dependency footprint, and fix the gate's dead signal.

---

## 1. Current bottlenecks

### F1 — `momentum_scores` grows without bound, and the full decomposition is written for every repo every day (dominant)

**What happens today.** `MomentumRunner.run()` scores every repo that has *any* snapshot (`MOMENTUM_LIST_REPO_IDS_SQL` → `SELECT DISTINCT repo_id FROM snapshots` — the entire tracked set, not just surfaced) across 3 periods (`1d`/`7d`/`30d`). Each row carries a decomposition JSONB with ~61 key/value pairs (per-signal start/end/growth/rate/size-factor/target/weight/score/contribution + age and window factors). The primary key is `(repo_id, period, computed_at)`, so **every daily run inserts a fresh row per repo per period** — the upsert's `ON CONFLICT (repo_id, period, computed_at)` never fires on the following day's `computed_at`. Nothing prunes older `computed_at` values, and reads only ever use the *latest* row per `(repo_id, period)` (architecture §2: "Latest row per (repo_id, period) serves reads").

**Estimated impact (unbounded):** ~1 KB decomposition per row.
| tracked | rows/day | rows/yr | GB/yr |
|---|---|---|---|
| 10k | 30k | ~11M | ~12 GB |
| 50k | 150k | ~55M | ~60 GB |
| 100k | 300k | ~110M | ~120 GB |

This is the single largest growth item — larger than snapshots and repos combined.

**Alternatives / trade-offs.**
- **Scope the decomposition** — write score + rank for all tracked repos (the trending/fast-growing surfaces only read score + rank), and the full decomposition only for surfaced repos (analytics pages are surfaced-only). Cuts the JSONB write volume ~80–95% while preserving every surface's transparency contract. *Trade-off:* a not-yet-surfaced repo's analytics page would lack the breakdown until it surfaces — acceptable, since it's not displayed to Explorers anyway.
- **Retention via partitioning** — partition by `computed_at` (e.g. monthly) and drop partitions older than ~90 days. *Trade-off:* only bounds *steady-state* size; the daily write volume stays ~120 GB/yr unless combined with decomposition scoping. A 90-day partition at 100k ≈ 27 M rows ≈ 8–10 GB steady.
- **Roll up older decompositions** — keep daily decomposition for the last 30 days, weekly after. *Trade-off:* more complexity for marginal benefit once scoping + retention are in.

**Effort:** ~1–2 days + one migration.

---

### F2 — `snapshots` series is unbounded and the `commit_activity` payload is ~52× redundant

**What happens today.** `snapshot.core` inserts 1 row/repo/day (small: 5 ints + timestamp). `snapshot.deep` inserts 1 row/repo/week carrying the *full* ~52-week `commit_activity` array (~6–9 KB JSON per row). Momentum only consumes the **latest** deep row's weeks inside the 30-day window (`_commits_in_window`), and analytics only needs a bounded history — yet every weekly deep row stores all 52 weeks, so the same week's data is re-stored ~52 times across rows. No pruning anywhere (`grep DELETE FROM gitmaps/` → no hits).

**Estimated impact (unbounded):**
| tracked | core rows/yr | core GB/yr | deep rows/yr | deep GB/yr (≈7 KB/row) |
|---|---|---|---|---|
| 10k | 3.65M | ~0.4 | 520k | ~3.6 |
| 100k | 36.5M | ~4.4 | 5.2M | ~36 |

**Alternatives / trade-offs.**
- **Retention windows** — keep core snapshots ~90–180 days, deep ~26 weeks, prune the rest (or roll core up into weekly/monthly aggregates for long-horizon analytics). *Trade-off:* deep growth-history on the analytics page is capped; the architecture's "growth story" only needs a few months to be compelling.
- **Store a bounded `commit_activity` tail** — persist only the last ~8 weeks per deep row (the momentum window is 30 days; 8 covers it with margin). Cuts each deep row from ~7 KB to ~1.2 KB. *Trade-off:* if a future surface wants year-over-year commit trends, the tail would need a rollup job — leave a note in the migration.
- **Only the latest deep row carries activity** — each repo keeps its newest activity array, older deep rows store just `contributors`. *Trade-off:* loses per-week contributor history on analytics.

**Effort:** ~1–2 days + one migration.

---

### F3 — Embedding: heavy default dependency, undeclared in `pyproject.toml`, plus a phantom lightweight option

**What happens today.** `build_embedding_provider(provider="local")` returns `SentenceTransformerEmbedder`, which lazily imports `sentence_transformers` (→ `torch`, `transformers`, `tokenizers`, `numpy`, …) on the first embed. `pyproject.toml` declares only `requests` + `psycopg2-binary`, so the transitive stack is **undeclared** — a clean `pip install -e .` followed by the documented default `EMBEDDING_PROVIDER=local` run fails at runtime with `ModuleNotFoundError`. Meanwhile `.env.example` (line 19–20) documents `EMBEDDING_PROVIDER=local` / `EMBEDDING_MODEL=local-hash-v1` as a "deterministic, dependency-free hash embedder (development + tests)" — **no such embedder exists in the code** (verified: zero hits for `local-hash`/`hash-v1`). The shipped default silently commits the operator to a ~1 GB dependency and a ~90 MB model they were told they could avoid.

**Footprint measured on this box:** `all-MiniLM-L6-v2` cache = 175 MB; the sentence-transformers stack (torch CPU + transformers + tokenizers) is several hundred MB; the global `~/.cache/huggingface` is 7.8 GB (mostly *other* projects sharing this environment — GitMaps contributes the 175 MB MiniLM cache).

**Alternatives / trade-offs.**
- **Declare the local path as an extra** — `[project.optional-dependencies] embed = ["sentence-transformers>=…", "numpy>=…"]`; `EMBEDDING_PROVIDER=local` documented as requiring `pip install -e .[embed]`. Zero behavior change, fixes reproducibility. *Trade-off:* none.
- **Implement the documented `local-hash-v1` embedder** — a deterministic, dependency-free (pure `hashlib`/`numpy`-free) vector for dev/test, so the default config has zero heavy deps. *Trade-off:* not semantic — fine for tests/dev, wrong for production search/map; production must set `EMBEDDING_PROVIDER=http` or opt into `[embed]`.
- **Switch the production local provider to ONNX** (`fastembed` / `onnxruntime` + a quantized MiniLM) — ~10× footprint reduction (runtime ~40–80 MB, model ~15–25 MB), near-identical MiniLM quality, still fully self-hosted (D-05 intact). *Trade-off:* a new (smaller) dependency; the `EmbeddingProvider` class and the model-version registry absorb the change — the seam exists precisely for this.
- **Keep sentence-transformers** — acceptable if the box has the headroom; the current state is fine *except* for the undeclared deps and the phantom hash embedder.

**Effort:** deps declaration ~0.5 day; hash embedder ~0.5–1 day; ONNX provider ~1 day.

---

### F4 — `repos`: dead/stale columns, a dead table, and write amplification from the inline vector

**What happens today (all verified by reading the SQL):**

- **`repos.contributors` is never written** — `repo_to_row()` has no `contributors` key, the discovery upsert doesn't include it, and the snapshot path writes contributors only to `snapshots`. The promotion gate (`PROMOTION_COLUMNS` reads `contributors` from `repos`) therefore sees `NULL` for every repo, and `contributors_signal` is **permanently 0.0**. The gate silently ignores a weight-0.15 signal (and momentum's `contributors` *signal* is fine because it reads from `snapshots` — only the gate is broken).
- **`repos.significance_score` / `significance_vars` are never written** — `PROMOTE_TO_SURFACED_SQL` sets only `surfaced` + `surfaced_at`. The gate's decomposition is computed in `evaluate()` and immediately discarded. The schema's stated transparency intent (ADR-0002/0003) is not persisted for the gate, only for momentum.
- **`repos.stars/forks/watchers/open_issues` go stale** — they're set once at discovery (`repo_to_row` in `upsert_many`); the snapshot path fetches the repo fresh (`_snapshot_core`) but never writes the latest values back to `repos`. The only `UPDATE repos` statements are touch-times / promotions / embeddings. So the "denormalized latest signals for reads" columns drift for weeks on tracked repos, and the gate evaluates candidates and tracked-not-surfaced repos on stale star/fork counts.
- **The `candidates` table is dead** — migration 02 creates it and migration 09's schema-verification gate asserts it, but discovery writes candidates as `repos` rows with `tracked=false` (`LIST_CANDIDATES_SQL` reads `repos`, not `candidates`). Two parallel "discovery queue" structures, one of which nothing writes, plus a maintained-but-never-used index (`candidates_status_last_checked_idx`).
- **Write amplification from the inline vector** — `embedding vector(384)` (1.5 KB) lives on the `repos` row. Every metadata touch (`TOUCH_SNAPSHOT_SQL` fires for ~100k tracked repos/day, plus promotion/embedding updates) rewrites the whole tuple including the vector, producing ~190 MB/day of heap churn (dead tuples) at 100k tracked before autovacuum.

**Impact:** F4 is mostly *correctness and clarity* (a permanently-zero gate signal is a product bug) with a modest storage/write-amplification component. Disk directly: negligible; dead schema: medium; gate correctness: **high**.

**Alternatives / trade-offs.**
- Populate `repos.contributors` (and refresh stars/forks/watchers) inside the snapshot write — one small `UPDATE repos SET stars=…, forks=…, contributors=…` alongside the insert. *Trade-off:* none; it's the missing half of the denormalized-latest-signal design.
- Persist the gate result + decomposition to `significance_score`/`significance_vars` on promotion. *Trade-off:* none — this is what the columns are for.
- **Resolve the candidates/repos split** — either write discovery to `candidates` (per architecture §4's explicit flow) and leave `repos` for promoted repos, or drop the `candidates` table + its index + the migration-09 assertion. The second is cheaper and matches the code as written. *Trade-off:* dropping the table changes migration 09; do it as a new migration, never an edit.
- Move the vector to a separate `repo_embeddings` table (`repo_id`, `model_version`, `embedding`, `fingerprint`, `embedded_at`) with a partial HNSW index over surfaced repos, so the hot `repos` table isn't rewritten with 1.5 KB of vector on every touch. *Trade-off:* one join in search/similar reads; the HNSW index is rebuilt once at migration. This is the only F4 item with real disk/write payoff.

**Effort:** contributors/latest-signals refresh ~0.5 day; significance persistence ~0.5 day; candidates cleanup ~0.5 day; separate embeddings table ~1–2 days + migration (HNSW rebuild).

---

### F5 — Batch jobs: no batching in the model call, single-batch snapshot/promotion, no scheduler, and a racy shared rate budget

**What happens today.**

- **Embedding is called one text at a time:** `self._provider.embed([text])[0]` per repo. `sentence-transformers.encode` is dramatically faster with batch sizes 32–128 (SIMD/threaded forward passes); at 1-text batches the model spends most of its time on dispatch overhead. The runner already pages the universe (`batch_size=100`), so it has a natural place to batch.
- **Snapshot and promotion jobs do not loop:** `SnapshotRunner._run` and `PromotionRunner.run` each fetch **one** fixed `batch_size=100` page and stop, while `EmbeddingRunner` and `MomentumRunner` loop until budget-exhausted or page-empty. Combined with the documented cron (`SCHEDULE_SNAPSHOT_CORE="0 2 * * *"` — once daily), a 100k tracked universe would take **~1,000 days to cycle**. The architecture's "spread across the day" (§6) isn't implemented; the runner would need to loop until the per-hour budget is spent (as the embed runner does).
- **The in-process scheduler is absent:** `worker.py` is a one-shot CLI (`python -m gitmaps.worker discover`), APScheduler is not used, and the `SCHEDULE_*` env keys in `.env.example`/`.env` are never read by `Settings` or `worker.py`. D-07 ("worker self-schedules its job DAG") is documented but not built. Today the only way to run the pipeline is external cron/CI.
- **The shared rate budget is a read-modify-write race:** `rate_budget` in `ingestion_state` is read at run start and written at run end by two *separate processes* (`snapshotter.py` and `embeddings.py`, same key). Concurrent runs both read `used=N` and both write `used=N+k` → lost updates → the pool over-commits GitHub API quota (a shared resource). Within a single process it's also unsafe if jobs overlap.
- Minor: `_hour_stamp` and `_budget_state` are copy-pasted between `snapshotter.py` and `embeddings.py`.

**Impact:** medium — under-utilization (snapshot/promotion can't cover the universe), model CPU waste (embedding), and a resource-accounting race on the one externally-shared quota.

**Alternatives / trade-offs.**
- Make `SnapshotRunner`/`PromotionRunner` loop over pages until the budget is exhausted (or no rows remain), mirroring the embed/momentum runners; keep `batch_size` as the internal page size. *Trade-off:* a single invocation does more work — the transaction stays one DB transaction, so a crash mid-loop rolls back cleanly (worker.py already commits-on-success). Low risk.
- Fix the budget atomically: increment with a single `UPDATE ingestion_state SET value = jsonb_set(value,'{used}', to_jsonb(value->>'used' + N))` per batch, or guard with an advisory lock for the run's lifetime. *Trade-off:* slightly less readable; alternatively, move the budget counter into a per-process in-memory counter and only re-sync hourly.
- When the scheduler lands, choose APScheduler (per D-07) or systemd timers — either is fine; the missing piece is that *something* must invoke jobs repeatedly so the "spread across the day" model works.

**Effort:** batching ~0.5 day; runner loops ~0.5 day; budget race fix ~0.5 day; scheduler is a separate (architecture) item.

---

### F6 — Discovery caps out at 1,000 results per day and silently drops the long tail

**What happens today.** `DiscoveryRunner` issues a single query `created:>=since` where `since` is the previous run's watermark, and `client.search()` hard-stops at `MAX_SEARCH_RESULTS = 1000` (GitHub's search pagination cap). GitHub creates ≫1,000 public repos/day, and search ranks `created:>=` results by relevance/stars — so the query returns the ~1,000 most-starred matches and **every newer repo past that cutoff is permanently missed**: the watermark still advances to `run_start`, so those repos are never `created:>=` again. Architecture §4 promised "topic sweeps, repos crossing low star thresholds" to complement the created-sweep — not implemented.

**Impact:** medium — the candidate pool systematically under-covers the long tail, which is precisely the "before mainstream" population the product exists to find. Storage-adjacent: the capped feed also keeps `repos` growth bounded (~365k rows/yr) but at the cost of coverage.

**Alternatives / trade-offs.**
- Multiple complementary sweeps (architecture §4 as written): created-window, low-star-threshold crossings, topic sweeps — each a capped query, so the pool is a union rather than one relevance-ranked slice. *Trade-off:* more search quota (budgeted §6); more screen candidates.
- Finer created-windows (e.g. hour-granularity watermarks) so the per-query ≤1000 cap is rarely hit. *Trade-off:* more queries per day.
- Track per-query coverage (found vs. capped) in `ingestion_state` so silent loss becomes visible. *Trade-off:* none, cheap.

**Effort:** ~1–2 days.

---

### F7 — Disk, caches, and repo hygiene (minor)

- **`Reference/` (38 MB) is untracked but lives in git history.** The baseline commit `ab19388` added the whole scraped reference set (largest blob ~3.9 MB of HTML/JS); `8fb47e6` stopped tracking it but history retains it → `.git` is 8.8 MB and a clone carries ~6 MB of scraper HTML forever. For a private solo repo this is harmless; if the repo ever goes public, purge with `git filter-repo` before first public push.
- **`.mypy_cache` = 11 MB**, `.pytest_cache` 19 KB, `__pycache__` scattered — all correctly gitignored, trivially regenerated. Optionally point mypy's cache at a temp dir. Low priority.
- **`~/.cache/huggingface` = 7.8 GB** on this box — mostly *other* projects (Qwen-Coder 7B = 4.4 GB, mpnet, gpt2, granite) sharing the global environment. GitMaps contributes the 175 MB `all-MiniLM-L6-v2`. Worth a note: the HF cache is unbounded and silently consumes disk on model upgrades — document a cleanup step or pin `HF_HUB_CACHE`.
- **`.env` and `.env.example` have drifted** — the live `.env` (older, missing `EMBEDDING_PROVIDER`, different comments) and the current `.env.example` describe different configurations. The commit-this-version rule ("only commit .env.example") is right; the drift just needs a sync pass.
- **Duplicated helpers:** `_hour_stamp`/`_budget_state` in `snapshotter.py` and `embeddings.py` (F5).

**Effort:** each ≤0.5 day.

---

## 2. Storage growth projection (estimates)

Unbounded (current) vs. with the recommended fixes, for a surfaced set ≈ 20% of tracked:

| tracked | Current — annual write | Current — 3-yr steady | With fixes — steady-state |
|---|---|---|---|
| 10k | ~16 GB/yr | ~50 GB | ~2 GB |
| 50k | ~80 GB/yr | ~250 GB | ~5–8 GB |
| 100k | ~160 GB/yr | ~500 GB | ~10–15 GB |

Fixes assumed: momentum decomposition scoped to surfaced + 90-day partition retention; core snapshots pruned at 180 days (with a monthly rollup for analytics); deep snapshots pruned at 26 weeks with an 8-week `commit_activity` tail; vector moved off the hot `repos` row. At 100k tracked the dominant residual is the *required* score+rank materialization (~9 GB/90d) plus the surfacing-time vector store (~0.5 GB including HNSW at 20k surfaced).

---

## 3. What's already good (don't touch)

- **Seam-based design** — pure engines + injected client/store seams make every runner unit-testable without network or DB (the test fakes are excellent). Any of the changes above should preserve this.
- **Idempotent, additive migrations** with a verification gate (migration 09) — the right discipline; the gate just currently asserts two dead artifacts (`candidates` table + index).
- **Rolling per-hour budget model** and the token-pool GitHub client — sound design; only the cross-process race (F5) needs hardening.
- **Incremental embedding pass** (due-by-`pushed_at` + fingerprint skip) and **layout anchoring** (D-04) — correctly avoid recompute-what-hasn't-changed.
- **Lazy model loading** — the worker only pays for torch when `EMBEDDING_PROVIDER=local` and `embed` runs.
- **No container runtime, no Redis, no broker** — the small-footprint decisions in D-01/D-07 are the right defaults for self-hosting.

---

## 4. Recommendations, prioritized by value and effort

### P0 — high value, low effort (do first)

| # | Recommendation | Fixes | Est. effort |
|---|---|---|---|
| 1 | **Scope the momentum decomposition + add retention.** Write score+rank for all tracked, full decomposition only for surfaced; partition `momentum_scores` by `computed_at`, drop >90 days. | F1 (the dominant growth item) | 1–2 days + migration |
| 2 | **Make the embedding deps real and honest.** Declare the local stack as `[project.optional-dependencies] embed`; implement the documented `local-hash-v1` dev embedder (zero deps) so the default `EMBEDDING_PROVIDER=local` doesn't force torch; sync `.env`/`.env.example`. | F3, F7 | ~1 day |
| 3 | **Fix the dead/stale gate columns.** Populate `repos.contributors` + latest signals during snapshots; persist gate score/decomposition to `significance_score`/`significance_vars`; resolve the `candidates`/`repos` split (drop the dead table+index, adjust migration 09). | F4 (incl. the permanently-zero gate signal — a product bug) | ~1.5 days + migration |

### P1 — high value, moderate effort

| # | Recommendation | Fixes | Est. effort |
|---|---|---|---|
| 4 | **Add snapshot retention + `commit_activity` scoping.** Prune core >180 d (monthly rollup for analytics), deep >26 w, store an 8-week activity tail. | F2 | 1–2 days + migration |
| 5 | **Batch the embedding model calls** at page granularity (batch 32–64) instead of one text at a time. | F5 | 0.5 day |
| 6 | **Move the vector off the hot `repos` row** into a `repo_embeddings` table with a partial HNSW index over surfaced. | F4 (write amplification) | 1–2 days + migration |
| 7 | **Harden the rate budget + make snapshot/promotion loop.** Atomic budget increment or run-level advisory lock; loop snapshot/promotion over pages until the budget is spent (matching the embed/momentum runners). | F5 (race + 1,000-day snapshot cycle) | ~1 day |

### P2 — real value, higher effort (schedule after P0/P1)

| # | Recommendation | Fixes | Est. effort |
|---|---|---|---|
| 8 | **Multi-query discovery** (topic / low-star / finer created-windows) with per-query coverage counters so the 1,000-cap isn't silent. | F6 | 1–2 days |
| 9 | **Purge `Reference/` from git history** (`git filter-repo`) before the repo goes public. | F7 | 0.5 day |
| 10 | **Implement the in-process scheduler** (APScheduler per D-07, or systemd timers) and wire the `SCHEDULE_*` keys into `Settings` — the pipeline cannot run unattended today. | F5 | 1–2 days |
| 11 | **Dedupe `_hour_stamp`/`_budget_state`** into a shared module. | F5/F7 | 0.5 day |

**Ordering rationale:** P0-1 and P0-3 are the highest-leverage — one kills the dominant storage term, the other fixes a live product bug (gate contributors) at negligible cost. P0-2 unblocks reproducible installs. P1 then contains storage growth (retention), CPU (batching), and the two resource-coordination fixes. P2 is coverage and operations completeness — valuable but not urgent at MVP scale.

---

## 5. Minor observations (noted, not prioritized)

- `TOUCH_SNAPSHOT_SQL` bumps `last_snapshot_at` for both core *and* deep snapshots, and `DUE_CORE_SQL` uses `last_snapshot_at` to gate core cadence → the weekly deep-snapshot run (Mondays) suppresses that day's core snapshot for those repos. A repo loses one core point/week. Intentional or not, it's invisible in the docs.
- `snapshots_kind_idx (kind)` has ~2 distinct values (low selectivity) and no query in `repo_store.py` filters snapshots by kind alone — likely dead index weight on the highest-write table.
- `clusters`, `map_x`/`map_y`, `cluster_id` and the `semantic.*` jobs are schema/architecture without code yet (no UMAP/HDBSCAN in the repo) — expected, additive seams; the schema-verification migration currently asserts the inert `clusters` table.
- The planned semantic stack (umap-learn → numba/llvmlite ~300 MB, hdbscan) will be the next heavy dependency when the layout job lands. Two lighter notes for when it does: scikit-learn ≥1.3 ships `HDBSCAN` without the numba dependency, and the map projection could defer full UMAP to the weekly pass (already D-04's design).
- `ReposStore.executemany` snapshots are single-row inserts; at 100k/day this is fine inside one transaction, but `insert_snapshot` is called per repo — if the universe grows past ~250k, a `COPY`-style bulk path (or `executemany`) for the core batch is the exit ramp.
