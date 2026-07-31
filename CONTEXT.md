# GitMaps

GitMaps is an AI-powered GitHub intelligence platform. It helps developers discover high-quality repositories before they become mainstream by analyzing growth across multiple signals and rendering the open-source landscape as an interactive semantic map.

## Language

**Repository**:
An open-source project hosted on GitHub that GitMaps tracks and may surface to Explorers.
_Avoid_: repo, project, codebase, repo page

**Explorer**:
The primary user — a developer using GitMaps to discover emerging technologies and quality open-source repositories before they become mainstream.
_Avoid_: user, visitor, developer (when referring to the persona)

**Snapshot**:
A point-in-time capture of a Repository's growth signals (star count, fork count, watcher count, contributor count, recent commit activity) recorded by GitMaps' collector. Growth analysis runs on the series of snapshots, not on live API calls.
_Avoid_: data point, sample, record

**Growth signal**:
A measurable indicator of a Repository's adoption or activity — stars, forks, watchers, contributors, and commit activity. GitMaps judges growth from multiple signals combined, not from stars alone.
_Avoid_: metric, KPI, stat

**Semantic map**:
The flagship GitMaps view — an interactive canvas where each Repository is a node positioned by embedding-based similarity and clustered by technology. Inspired by alphaXiv's researcher map.
_Avoid_: cluster map, word map, scatter plot

**Significance**:
The multi-signal quality bar a Repository must clear to be tracked and surfaced — commit activity, contributor count, age, momentum, and README substance. Deliberately not an absolute stars floor, so young quality Repositories can qualify.
_Avoid_: quality score, threshold, minimum bar

**Technology cluster**:
A group of similar Repositories on the Semantic map, formed by embedding proximity and labeled with its dominant technology (e.g. "Rust tooling", "AI agents frameworks"). Clusters are emergent — computed from the embeddings, not curated.
_Avoid_: category, topic group, bubble

**Momentum**:
GitMaps' score of a Repository's growth. It combines multiple growth signals (stars, forks, watchers, contributors, commits), normalized by repository age and prior size, so an emerging Repository can outrank an established giant. Momentum is transparent and explainable by design — an Explorer can see how a Repository's score decomposes into its signals. It powers node size on the Semantic map, the Trending ranking, and recommendations. Original to GitMaps — not GitHub Trending's absolute-delta or GitGenius's week-over-week arrow.
_Avoid_: trending score, popularity, velocity, hotness

**Trending**:
The ranked discovery feature — Repositories ordered by Momentum over a selected period. A list readout of the same score that drives the Semantic map, not a separate algorithm.
_Avoid_: hot list, top repos

**Fast-growing**:
A discovery preset on the Momentum axis — Repositories with the highest Momentum among young Repositories (short history, small prior size). Distinct from Trending by intent, not by algorithm: the same score, filtered toward emergence.
_Avoid_: breakout, viral, on-the-rise

**Semantic search**:
The AI search feature — an Explorer enters a natural-language query, and GitMaps retrieves Repositories by embedding similarity over their descriptions, READMEs, and topics. Uses the same embeddings that position the Semantic map. A conversational assistant is a later-phase extension of this retrieval, not a separate system.
_Avoid_: AI search (when meaning the MVP box), keyword search, full-text search

**Similar repositories**:
The recommendation feature — a Repository's nearest neighbors by embedding, re-ranked to boost those with rising Momentum, so emerging look-alikes outrank already-famous ones. Expressed both spatially (selecting a node highlights its neighborhood on the Semantic map) and as a panel on the Repository's analytics view.
_Avoid_: related repos, recommendations (when meaning the ranking), recommended

*Glossary current as of the vision interview. Terms are recorded as the domain model evolves; recorded decisions live in `docs/adr/`.*
