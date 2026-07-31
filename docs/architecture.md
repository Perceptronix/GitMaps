# GitMaps — Architecture

The complete technical architecture for GitMaps, derived from the approved [vision](PRD.md), [ADRs](adr/), and [glossary](../CONTEXT.md). This document serves the vision — it changes none of it. Where a decision is recorded here, the rationale and rejected alternatives are in [§11 Decision records](#11-decision-records).

## 0. System context

GitMaps discovers high-quality repositories before they become mainstream. Every ranked surface derives from one transparent **Momentum** score (ADR-0002) computed over a time-series of **Snapshots** (ADR-0001) of a **significance-gated universe** (ADR-0003). The flagship **Semantic map** positions repositories by embedding similarity and colors them by emergent technology clusters.

Three processes, one database, no container runtime:

```
┌─────────────┐      ┌─────────────┐      ┌──────────────────┐
│  Next.js    │ HTTP │  FastAPI    │ SQL  │   Supabase       │
│  (web)      │ ───► │  (read API) │ ───► │   Postgres       │
└─────────────┘      └─────────────┘      │   + pgvector     │
         ▲                 ▲              └────────▲─────────┘
         │  static build   │  batch writes         │
         │                 └────────────────────────┘
   ┌───────────────────────────┐  GitHub API (REST + Search)
   │   Python worker           │ ◄─────────────────────►
   │  (snapshots, momentum,    │
   │   embeddings, clustering, │
   │   map projection)         │
   └───────────────────────────┘
```

- **Next.js** — the anonymous-first public web app (PRD: accounts deferred). Renders the map, lists, analytics, search. Static build, deployed as a Node process.
- **FastAPI** — the read API. Serves map data, trending, analytics, search, similar. The only writer is the worker; the API is read-only against Postgres.
- **Python worker** — all batch compute. Self-schedules via an in-process scheduler (§5). Talks to the GitHub API and writes Supabase. Loads the embedding model.
- **Supabase Postgres + pgvector** — the *only* database: relational data, the snapshot time-series, the vector index (map + search), and all materialized scores.

## 1. Architecture vocabulary

Architecture-level terms (the domain glossary is frozen; these are structural, not domain, terms):

- **Tracked repository** — a repo the collector snapshots on the daily cadence.
- **Surfaced repository** — a tracked repo that cleared the **Significance** gate; appears on the map, trending, search, and recommendations. Surfaced ⊆ Tracked.
- **Promising fringe** — tracked-but-not-yet-significant repos (young, rising). Tracked so their growth is measured *before* they surface. This is what makes "before mainstream" real.
- **Core snapshot** — the daily 1-call capture: stars, forks, watchers, open issues.
- **Deep snapshot** — the weekly capture: contributor count and commit activity.
- **Layout** — the persisted 2D positions, cluster assignments, and labels; versioned so the frontend can animate between layouts.
- **Significance gate** — the multivariate quality screen that promotes Tracked → Surfaced (mechanism in §4; formula is a tunable seam, per PRD open questions).

## 2. Repositories of record: the data model

All storage is one Supabase Postgres database. Vector columns use `pgvector` (HNSW index). Table design below is the shape, not a migration.

### `repos` — one row per known repository
| column | notes |
|---|---|
| `id` BIGINT PK | GitHub repo id |
| `owner`, `name`, `full_name` UNIQUE | |
| `description`, `topics TEXT[]`, `language`, `license`, `homepage`, `archived`, `is_fork` | metadata captured at discovery |
| `created_at`, `pushed_at` | repo birth / last push (the age signal) |
| `tracked BOOL`, `surfaced BOOL` | the two tiers (§4) |
| `significance_score`, `significance_vars JSONB` | gate result + its component inputs (transparency) |
| `stars`, `forks`, `watchers`, `open_issues`, `contributors` | latest signal values (denormalized for reads) |
| `embedding VECTOR` | one vector per repo (dimension = model, set at migration) |
| `map_x`, `map_y NUMERIC` | current layout position |
| `cluster_id FK` | current cluster assignment |
| `first_snapshot_at`, `last_snapshot_at`, `surfaced_at` | lifecycle timestamps |

### `snapshots` — the growth time-series
`id` PK, `repo_id` FK, `taken_at`, `kind TEXT` (`core` | `deep`), `stars`, `forks`, `watchers`, `open_issues` (core); `contributors`, `commit_activity JSONB` (deep, weekly commit counts). `UNIQUE(repo_id, taken_at, kind)`. Index `(repo_id, taken_at DESC)` for growth series.

### `momentum_scores` — materialized, decomposed, per period
`repo_id`, `period TEXT` (`1d`|`7d`|`30d`), `computed_at`, `score NUMERIC`, `decomposition JSONB` (per-signal contributions + age and size normalization factors), `rank INT`. Latest row per `(repo_id, period)` serves reads. Index `(period, computed_at, score DESC)` for rankings.

### `clusters`
`id` PK, `label`, `label_source`, `member_count`, `centroid_x`, `centroid_y`, `computed_at`. Recreated on each layout recompute.

### `candidates` — the discovery queue
`full_name` PK, `discovered_at`, `source`, `last_checked_at`, `screen_score`, `status` (`pending`|`tracked`|`rejected`).

### `ingestion_state` — key/value job + budget state
Watermarks (last discovery bounds), last run of each job, per-hour GitHub rate-budget accounting, current `embedding_model_version`, current `layout_version`.

## 3. Processes and boundaries

| process | tech | responsibility | scales to |
|---|---|---|---|
| `web` | Next.js (App Router) | map, trending, analytics, search UI | horizontal (stateless) |
| `api` | FastAPI, asyncpg/SQLAlchemy | read-only REST over Postgres; embeds search queries via the shared EmbeddingProvider | horizontal (stateless) |
| `worker` | Python, APScheduler | discovery, snapshots, momentum, embeddings, layout | one now; job-wise later (§12) |

**Wiring:** the web app reaches the API through a Next.js rewrite (`/api/*` → FastAPI), so the browser sees a single origin — no CORS, no exposed API surface. The worker and API never call each other; Postgres is the only *runtime* channel between them (batch-written, read-served). The one shared artifact is the **EmbeddingProvider** package both processes import — shared code, no shared runtime. This keeps the three processes independently deployable and restartable.

## 4. Ingestion and universe management

The three-stage flow resolves ADR-0003 ("full universe, significance-gated") into something the API budget can actually sustain:

```
discovery ──► candidates ──► screen ──► tracked ──► significance ──► surfaced
 (search      (queue)      (cheap       (daily        (multivariate      (embedded,
  polling)                  filter)      snapshots)    gate)              mapped)
```

1. **Discovery** (daily) — GitHub Search API queries for newly created / recently updated repos (`created:>N days`, topic sweeps, repos crossing low star thresholds). Each query returns up to 1000 hits; a small daily query set keeps candidates flowing without exhausting search quota (30 req/min authenticated).
2. **Screen** (cheap) — drop forks, archives, empty repos, spam signals (from metadata captured at discovery). Survivors become `candidates`.
3. **Tracked** — a candidate is promoted to tracked if it is already significant *or* if it looks like a fringe promise (young, non-trivial activity). Tracked repos enter the daily snapshot rotation. The fringe is capped by the API budget (§6) and re-screened as it ages.
4. **Surfaced** — a tracked repo clears the **Significance gate** when its multivariate score (commit activity, contributor count, age-appropriate momentum, README substance) crosses the threshold. It is embedded, assigned a map position, and starts appearing in map/trending/search. Promoted once; `surfaced_at` recorded. (Gate formula is a tunable seam; the transparency requirement of ADR-0002 applies to its decomposition as well.)

**The fringe is the point.** A repo that is *not yet* significant is still tracked, so when it takes off, GitMaps already has its growth history — the difference between "measuring a rise" and "discovering a rise after the fact."

## 5. The batch pipeline (worker)

The worker is a single process supervised by systemd (no container runtime). APScheduler fires each job on a cron expression; internal ordering is explicit (a job's code asserts its dependencies have run via `ingestion_state`). Overlap protection is built into the scheduler (a job instance that exceeds its period is skipped, not stacked).

| job | cadence | work |
|---|---|---|
| `discover` | daily | search polling → candidates → screen → promote to tracked |
| `snapshot.core` | daily | 1 call per tracked repo (stars/forks/watchers/issues); throttled to the hourly rate budget, spread across the day |
| `snapshot.deep` | weekly | stats endpoints: contributor counts, commit activity |
| `momentum` | daily, after snapshots | recompute `momentum_scores` for 1d/7d/30d + decomposition + ranks (materialize, upsert) |
| `semantic.incremental` | daily | semantic pipeline stages 1–3 + 5 (incremental): embed new/changed surfaced repos → anchor positions → assign clusters → bump `layout_version` |
| `semantic.full` | weekly / on model change | semantic pipeline stages 1–5 (full): re-embed → UMAP → HDBSCAN → keyword labels → new `layout_version` |
| `significance` | daily | re-evaluate tracked fringe against the gate; promote to surfaced |

**Why anchor + periodic recompute (not nightly full recompute):** nightly UMAP over the whole canvas would move every node every day and reform clusters — destroying the spatial memory a map depends on. So geometry is quiet: the daily `semantic.incremental` pass places only *new* nodes (projected from their embedding-nearest neighbors already on the map, weighted centroid + jitter to avoid overlap), and the weekly `semantic.full` pass rebuilds the whole layout. Node size (Momentum) and color (cluster) update daily from data; only geometry waits for the full recompute, which the frontend animates as a transition rather than a jump.

## 6. GitHub API budget

The constraint that bounds the universe:

- **Core snapshots** cost 1 call/repo/day. The core REST limit is 5,000 req/hr authenticated, so a tracked set of ~100k repos snapshots cleanly within a day (≈4,200/hr average) with headroom for discovery and deep snapshots.
- **Deep snapshots** add ~2 calls/repo/week (≈2·N/7 per day) — accounted in the same budget.
- **Discovery** is bounded by the Search API quota (30 req/min) — a handful of daily queries, not a bottleneck.
- The worker tracks a rolling per-hour counter in `ingestion_state` and backs off with exponential jitter rather than 403ing.

Multiple `GITHUB_TOKEN`s are supported; the budget model treats them as one shared pool. Capacity math is explicit so growing the tracked set is a numbers conversation, not a surprise.

## 7. Semantic layer

The semantic pipeline is one staged process, always in the same stage order, run in two modes:

**Embedding → UMAP → HDBSCAN → Keyword Labels → Layout Version**

| stage | full pass — `semantic.full` (weekly / on model change) | incremental pass — `semantic.incremental` (daily) |
|---|---|---|
| 1. Embedding | re-embed the surfaced set (full, on model change) | embed newly surfaced + changed repos |
| 2. UMAP | reproject the full set to 2D | anchor new nodes from their embedding-nearest neighbors (no full reprojection) |
| 3. HDBSCAN | re-cluster the full set | assign new nodes to their nearest cluster |
| 4. Keyword labels | re-label all clusters | — (no relabel) |
| 5. Layout version | write positions/clusters/labels; bump `layout_version` | write new nodes' positions/clusters; bump `layout_version` |

The **EmbeddingProvider** is the single shared implementation of stage 1 for the whole system: one package that both the worker and the API import. It owns model loading (lazy, once per process), `embed(texts)` for batch pipeline work, `embed_query(query)` for search, and the `embedding_model_version` registry. There is exactly one embedding implementation — the worker uses it for the pipeline, the API uses it at query time; they differ only in caller, never in logic (D-11).

- **Model** — a compact open sentence-encoder (all-MiniLM / E5 / bge class), one vector per repo composed from `full_name + description + topics + primary language + homepage + truncated README` (the "other meaningful metadata" of the Phase 5 spec; the README is truncated to `readme_max_chars` before embedding), dimension set at migration. A model upgrade is a deliberate full pass of the pipeline, recorded via `embedding_model_version`.
- **Change detection** — a repo is *due* for embedding when it has none (`embedding IS NULL`), or its content may have changed since last embed (`embedded_at < pushed_at`), or the model version changed (full pass). Within the due set, a repo whose freshly-computed semantic fingerprint (a stable hash of the composed content) matches the stored one is skipped, not re-embedded — `embedded_at` advances either way. A metadata-only edit with no push therefore waits for the next push to be re-examined; this is the accepted trade-off for avoiding a per-repo re-fetch on every run. Every README fetch charges the shared rolling per-hour rate budget (§6), so one embed pass cannot exhaust the day's GitHub API budget.
- **Projection** — UMAP to 2D (stage 2); **clustering** — HDBSCAN (stage 3); **labels** — keyword/term-based (stage 4): dominant terms across member descriptions/READMEs/topics yield human-readable labels ("Rust tooling", "AI agents frameworks"). Deterministic, self-hosted, explainable — consistent with ADR-0002's transparency principle. (Local/hosted LLM labeling is a future enhancement, not in scope.)
- **Layout versioning** (stage 5) — `layout_version` in `ingestion_state`; the map API serves the current layout and the frontend animates between versions.

The five stages describe the full recompute. The daily incremental pass is stages 1–3 and 5 only — new nodes are embedded, anchored, cluster-assigned, and versioned, but the canvas is never reprojected or relabeled, so day-to-day geometry stays stable (D-04).

## 8. Read API (FastAPI)

REST + JSON, read-only. No GraphQL (no multi-surface client, no need).

| endpoint | purpose |
|---|---|
| `GET /map/data` | the full surfaced node set — id, full_name, name, description (truncated), language, stars, momentum score, size, cluster label, x, y. One payload; deck.gl renders 10k–100k nodes comfortably, so no viewport tiling in the MVP. Optional `?query=` embeds and narrows to similar nodes. |
| `GET /trending?period=7d` | ranked by momentum; includes the decomposition summary |
| `GET /fast-growing` | the young-repos preset on the momentum axis |
| `GET /repos/{owner}/{name}` | repo detail (metadata + latest signals + significance) |
| `GET /repos/{owner}/{name}/analytics` | growth series (core daily + deep weekly from `snapshots`) + the momentum breakdown (from `decomposition`) |
| `GET /repos/{owner}/{name}/similar` | embedding nearest neighbors, re-ranked to boost rising momentum; flags "similar & emerging" |
| `GET /search?q=…` | semantic search (§9) |
| `GET /clusters` | cluster labels, counts, centroids |

## 9. Semantic search and similarity

Both read from the same pgvector index — one vector space, two queries:

- **Search** — the API embeds the query through the shared EmbeddingProvider (the same package as the worker — one implementation, one model). `q` → vector → HNSW ANN (cosine) with a relevance threshold → surfaced repos ordered by similarity; momentum shown alongside so the list doubles as a discovery surface.
- **Similar** — the same ANN nearest-neighbor query from a repo's own vector, then re-ranked by momentum so emerging look-alikes outrank already-famous twins (PRD: "the unknown doppelgänger outranks the famous twin"), with an explicit "similar & emerging" grouping.

## 10. Frontend (Next.js)

- App Router, anonymous-first. Pages: `/` (the map), `/trending`, `/fast-growing`, `/repos/[owner]/[name]` (analytics + similar), `/search`. No auth anywhere (PRD).
- The map is a **client component** using **deck.gl** (React binding): `ScatterplotLayer` for nodes (size = normalized momentum, color = cluster), hover → tooltip card (name, stars, momentum, cluster), click → repo page, pan/zoom built in. deck.gl over MapLibre because this is a data-viz canvas, not a slippy geo map; it handles the node counts at issue with GPU batching.
- Filter controls (fast-growing toggle, period, language, cluster) hit the API and update the layer data.
- All data via `/api/*` rewrites to FastAPI; layout transitions animate on `layout_version` change.
- The analytics page renders the growth series and the momentum breakdown bars — the transparency payoff from ADR-0002.

## 11. Deployment and operations (no Docker)

Three systemd services on one self-hosted box, plus a reverse proxy. No container runtime, no Redis, no managed services beyond Supabase itself (which the PRD's self-hosting intent treats as "Postgres we don't have to operate").

| unit | command | listens |
|---|---|---|
| `gitmaps-web.service` | `next start` | 127.0.0.1:3000 |
| `gitmaps-api.service` | `uvicorn app.main:app` | 127.0.0.1:8000 |
| `gitmaps-worker.service` | `python -m gitmaps.worker` | none (outbound only) |

- Reverse proxy (Caddy or nginx) terminates HTTPS: `/api/*` → FastAPI, everything else → Next.js.
- Config in a single env file: `DATABASE_URL` (Supabase connection string), `GITHUB_TOKENS`, `EMBEDDING_MODEL`, schedule overrides, gate/momentum tunables.
- Migrations: versioned SQL applied by the worker on boot (idempotent), `pgvector` extension enabled on Supabase. Schema changes are additive and coordinated with `embedding_model_version` / `layout_version`.
- Backups and point-in-time restore: Supabase-managed; nothing extra to operate.

## 12. Decision records

Decisions made in this design. Each is an ADR-style entry, kept in one doc per the "architecture.md only" constraint.

**D-01 — Three processes, one database, no container runtime.** *Context:* self-hosted, simple-first (ADR-0001). *Decided:* Next.js + FastAPI + Python worker, Supabase Postgres+pgvector as the only store. *Why:* splits batch (worker) from interactive (API) without microservice overhead; pgvector makes the vector store a column, not a service. *Rejected:* microservices (distributed-system tax on day one), Docker/Compose (per explicit constraint), separate vector DB / Redis (no strong need — pgvector + in-process scheduler suffice).

**D-02 — Tracked + surfaced tiers with a promising fringe.** *Context:* ADR-0003, full universe. *Decided:* discovery → screen → tracked (snapshotted) → surfaced (significant, mapped). The fringe is tracked so rising repos are measured before they surface. *Why:* the only shape that makes "before mainstream" real within the API budget. *Rejected:* gate-at-entry (can't measure a rise you never snapshot), track-everything (budget flooded with junk).

**D-03 — Tiered snapshots: core daily, deep weekly.** *Context:* five growth signals, 5,000 req/hr. *Decided:* 1-call/day core (stars/forks/watchers/issues); weekly stats-endpoint deep (contributors/commits). *Why:* all five signals enter momentum (ADR-0002's breakdown stays honest) while the daily budget scales with the tracked set. *Rejected:* full-signal daily (caps the universe ~1,500 repos), core-only (drops two of five PRD signals).

**D-04 — Anchor-new layout, periodic full recompute.** *Context:* the map must be stable to be navigable. *Decided:* daily neighbor-anchoring for new nodes; weekly full UMAP + HDBSCAN + labeling; versioned, animated layout. *Why:* nightly recompute jiggles every node; fixed-forever decays. *Rejected:* nightly full recompute, fix positions forever.

**D-05 — Self-hosted compact embedding model, one vector per repo.** *Context:* self-hosting, no vendor lock-in. *Decided:* local open sentence-encoder; description+topics+truncated README; exposed through the single shared EmbeddingProvider package (D-11); model version recorded. *Rejected:* large models (CPU cost), hosted APIs (vendor + cost + corpus exfiltration).

**D-06 — Keyword/term cluster labeling.** *Context:* self-hosted, transparent. *Decided:* deterministic term-based labels. *Why:* no model, no nondeterminism, consistent with ADR-0002. *Rejected:* local LLM labeling (ops weight, nondeterminism), hosted LLM labeling (self-hosting violation).

**D-07 — In-process scheduler (APScheduler), no broker.** *Context:* no Redis. *Decided:* worker self-schedules its job DAG; systemd supervises one process. *Rejected:* cron (hand-rolled sequencing/locking), Supabase pg_cron webhook (splits job definition, adds network dependency).

**D-08 — REST read API, full-dataset map delivery.** *Decided:* REST+JSON, read-only, one `/map/data` payload for the whole surfaced set. *Why:* deck.gl renders 10k–100k nodes from one payload; tiling is premature. *Rejected:* GraphQL, viewport tiling, write-capable API (single-writer rule: only the worker writes).

**D-09 — Next.js rewrites to FastAPI.** *Decided:* the web app proxies `/api/*` to FastAPI — single origin, no CORS, API stays private. *Rejected:* direct browser→FastAPI with CORS.

**D-10 — Single-writer rule.** The worker is the *only* writer to Postgres; the API is strictly read-only. *Why:* eliminates a whole class of write-conflict and consistency bugs, and makes the materialized-score design safe.

**D-11 — One shared EmbeddingProvider; one staged semantic pipeline.** *Context:* the worker embeds in batch and the API embeds at query time; the semantic layer is UMAP + HDBSCAN + labeling. *Decided:* a single EmbeddingProvider package both processes import — shared code, no shared runtime; and the semantic pipeline runs as five explicit stages (Embedding → UMAP → HDBSCAN → Keyword Labels → Layout Version), full (weekly / model change) and incremental (daily) modes. *Why:* one implementation to maintain, version, and upgrade (D-05); the staged order makes each step independently runnable, observable, and testable; the incremental pass preserves layout stability (D-04). *Rejected:* an embedding microservice (adds a process and an HTTP channel between worker and API — violates D-01 and §3's Postgres-only channel), and duplicating embedding logic inside both processes.

## 13. Open seams (not built, kept open)

These are the PRD open questions and the scale-out paths, each a known seam:

- **Momentum formula & Significance gate** — inputs and decomposition are fixed in the schema; the formula, signal weights, and gate threshold are configuration, tunable without code changes, and must stay explainable (ADR-0002).
- **Embedding model upgrade** — a model change is a full re-embed + layout recompute; versioned so it's deliberate.
- **GH Archive backfill** — the ingestion provider interface (ADR-0001) is the seam; history depth replaces shallow self-collected series when it's worth the complexity.
- **Scale-out** — worker jobs → queue-backed workers (a broker decision when the single process is the bottleneck); map delivery → tiling/streaming when the surfaced set outgrows one payload; DB → Supabase read replicas.
