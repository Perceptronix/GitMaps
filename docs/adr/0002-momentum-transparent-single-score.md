# 0002 — Momentum is a transparent, explainable, single ranking score

Momentum is the one score that drives every ranked surface in GitMaps: node size on the Semantic map, the Trending rankings, the Fast-growing preset, the Similar-repositories panel, and recommendations. It is computed from multiple growth signals, normalized by repository age and prior size — and it is **transparent by design**: a repository's score decomposes into each signal's contribution, and Explorers can see the breakdown on the analytics view.

**Why:** GitMaps is "AI-powered," which tempts a black-box learned ranking. We choose an explainable, rule-based score instead — it is the product promise ("see why this is emerging") and it keeps Momentum consistent across every surface, so the map, lists, and recommendations never disagree. Recomputed from the same snapshot series everywhere.

**Trade-off accepted:** a learned model might rank more predictively; we accept that for trust and consistency.

**Consequences:** Momentum must stay a single source of truth — no bespoke secondary scores for specific views; "Fast-growing" and "Similar" are filters/levers on this one axis, not new algorithms.
