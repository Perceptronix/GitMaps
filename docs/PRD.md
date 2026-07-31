# GitMaps — Product Vision & Requirements

**One line:** GitMaps helps developers discover high-quality open-source repositories *before they become mainstream* — by analyzing growth across multiple signals and rendering the open-source landscape as an interactive semantic map.

## Problem

GitHub Trending ranks by absolute star gains in a window. That structurally guarantees **mainstream repos win**, because they have the most traffic — so it answers "what is already popular," never "what is about to be." Developers who want to stay ahead of the curve (new frameworks, emerging categories, the next big thing in their stack) are underserved. The existing alternatives don't fix this:

- **GitTrends** — a faithful clone of the Trending list. Same mainstream bias.
- **GitGenius** — week-over-week arrows and a 30-day total over a *manually curated* set (~2,185 repos). Editorial bias baked in; no way to find what nobody remembered to add.

Nobody in the reference set does multi-signal growth analysis, age-normalized ranking, or any spatial/semantic exploration. That is GitMaps' whitespace.

*Competitors are reference material only: study their UX, features, and navigation. Never copy their code or UI.*

## Primary user

The **Explorer** — a developer using GitMaps to discover emerging technologies and high-quality repositories before they become mainstream. The job-to-be-done is *discovery*; growth signals are the filter, not the product.

Secondary audience (future, only if Momentum proves credible): investors, analysts, recruiters scanning for fast-growing OSS signals.

## The core score: Momentum

Everything ranked in GitMaps derives from one score, **Momentum**:

- Combines multiple growth signals — stars, forks, watchers, contributors, commits.
- **Normalized by repository age and prior size**, so an emerging repo adding 5★/day can outrank an established giant adding 50★/day. Momentum ranks by *distance from mainstream*, not size.
- **Transparent and explainable by design** — an Explorer can see how a repo's score decomposes into its signals. It is rule-based, not a black-box model (see ADR-0002).
- Powers node size on the Semantic map, the Trending rankings, the Fast-growing preset, the Similar panel, and recommendations — one score everywhere, so the surfaces never disagree.

Original to GitMaps — not GitHub Trending's absolute delta, not GitGenius's week-over-week arrow.

## Product surfaces

The six capabilities from the brief, each now concrete:

| Capability | Surface | Definition |
|---|---|---|
| Discover trending repositories | **Trending** | Repos ranked by Momentum over a selected period (today / 7 days default / 30 days). A list readout of the same score that drives the map. |
| Explore technology clusters | **Semantic map** | The flagship. A full, zoomable canvas where every significant repo is a node, positioned by embedding similarity (description + README + topics) and clustered by technology. Node **size = Momentum**, node **color = technology cluster**; clusters are emergent and auto-labeled. Pan, zoom, hover for quick facts, click into analytics, filter by signal. Inspired by alphaXiv's researcher map. |
| Detect fast-growing projects | **Fast-growing** | A discovery preset on the Momentum axis — highest Momentum among *young* repos. Distinct by intent, not by algorithm. |
| View repository analytics | **Analytics** | The growth story: star/fork/watch history, the **Momentum breakdown** (each signal's contribution + age/size normalization — the transparency payoff), recent contributor activity, and Semantic map context (cluster, neighbors). |
| Find similar repositories | **Similar repositories** | Nearest neighbors by embedding, re-ranked to boost rising-Momentum look-alikes — the emerging doppelgänger outranks the famous twin. Spatially (select a node → neighborhood highlight) and as a panel on the Analytics view. |
| Search naturally using AI | **Semantic search** | A natural-language search box retrieving repos by embedding similarity over descriptions/READMEs/topics. Uses the same embeddings as the map. A conversational assistant is a later phase built on the same retrieval, not a separate system. |

## Guiding principles

1. **One score, transparent everywhere.** Momentum is the single source of truth (ADR-0002).
2. **No popularity gate.** The universe is significance-gated, deliberately without a stars floor (ADR-0003).
3. **Anonymous-first.** Everything browsable without an account; shareable URLs. (Accounts deferred.)
4. **Simple, self-hosted, scalable-as-a-seam.** Snapshot-first ingestion with a pluggable provider for later GH Archive backfill (ADR-0001). No managed-service lock-in.
5. **Competitors are reference only.** Study UX; never copy code.

## Deferred (non-goals for MVP)

- Accounts, watchlists, momentum-spike alerts, saved searches.
- Conversational AI assistant.
- Investor/B2B signal products; paid tiers, API access.
- Sub-daily freshness (hourly snapshots).
- GH Archive backfill — until history depth outweighs simplicity.
- Freemium monetization — the path stays open architecturally, nothing is built.

## MVP scope

The full core loop in one coherent slice:

Significance-gated universe → daily snapshots → Momentum → **Semantic map** (embedding-positioned, cluster-colored, momentum-sized) → Trending → Fast-growing → Analytics (growth story + momentum breakdown) → Similar panel → Semantic search.

Everything derives from one score and one embedding index, so this is the coherent minimum — not a list app with a map bolted on later.

## Open questions for implementation

- Embedding model + projection method for map layout; cluster labeling.
- Exact Momentum formula and normalization parameters (with the transparency constraint).
- Significance-gate tuning and spam/star-farming handling.
- Snapshot queue mechanics within GitHub API rate limits at universe scale.
