# 0001 — Snapshot-first ingestion, pluggable for GH Archive backfill

For the MVP, GitMaps collects repository history by taking **periodic snapshots of tracked repositories through the GitHub API**, rather than replaying the public GH Archive event stream. The ingestion layer is abstracted behind a provider interface so a GH Archive backfill can be added later without changing the database schema or the analytics pipeline.

**Why:** GitHub's API only offers point-in-time data, so growth analysis (charts, fast-growing detection) needs a time-series built by repeated snapshots. GH Archive (full event history since 2011, free, on BigQuery) would give deep history immediately, but operating it — replay, transforms, storage, compute — contradicts the MVP priority of simplicity and self-hosting. Self-collecting from launch is cheap and self-contained; the pluggable interface keeps GH Archive as a drop-in upgrade when history depth outweighs that simplicity.

**Trade-off accepted:** growth analytics are initially shallow (only as deep as accumulated snapshots). Fast-growing detection is only meaningful after enough snapshot history exists; the pipeline anticipates backfill rather than shipping with it.

**Rejected:** third-party data vendors (cost, lock-in, we don't own the raw data).
