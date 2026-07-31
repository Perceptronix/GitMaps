# 0003 — Significance-gated universe, deliberately no stars floor

GitMaps tracks the full public GitHub universe, then surfaces a Repository only if it clears a multi-signal **Significance** bar — commit activity, contributor count, age, momentum, and README substance. The bar deliberately contains **no absolute stars floor**, so a young, small, high-quality Repository can qualify for the map and rankings.

**Why:** the product promise is "discover before mainstream." A stars floor would structurally blind GitMaps to the earliest stage of a Repository's life — the exact repos it exists to surface. GitHub Trending's absolute-delta ranking is mainstream-biased for the same reason; we choose a multivariate quality gate instead of a popularity gate.

**Consequences:** a star-farming or commit-padded Repository must be handled explicitly, and the universe's scale is unbounded, so the gate must be continuously tuned to keep noise out without reintroducing a popularity bias.
