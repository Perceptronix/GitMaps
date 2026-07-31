# 07 — `clusters` + cluster linkage

**Type:** task
**Status:** ready-for-agent

**What to build:** the map's cluster model. `clusters` (`id` PK, `label`, `label_source`, `member_count`, `centroid_x`, `centroid_y`, `computed_at`) and the nullable `repos.cluster_id` foreign key with an index on it. Recreate-on-recompute convention: a layout recompute replaces the cluster set and reassigns repos — additively on the daily anneal pass, wholesale on the full pass — without orphaning rows. This is what cluster coloring and cluster filters on the map read from.

**Blocked by:** 03

- [ ] `clusters` exists with the full column set and primary key.
- [ ] `repos.cluster_id` nullable FK added; indexed.
- [ ] Truncate-and-rebuild on recompute leaves no orphaned repos (FK/delete semantics defined).
- [ ] Cluster lookups by label and centroid queries are supported.
