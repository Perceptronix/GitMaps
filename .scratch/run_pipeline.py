"""One-off: persist the semantic map on the live DB (cluster -> layout).

Loads .env, runs the clustering runner with the tuning validated in Phase 7
(min_cluster_size=3 — the worker's default of 5 yields no clusters on the
~60-repo universe), then the `layout` worker job, then reports counts. Each
step commits on success.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

with open(".env", encoding="utf-8") as fh:
    for line in fh:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))

from gitmaps.clustering import ClusteringConfig, ClusteringRunner  # noqa: E402
from gitmaps.db import Db  # noqa: E402
from gitmaps.repo_store import RepoStore  # noqa: E402
from gitmaps.worker import main  # noqa: E402

if __name__ == "__main__":
    import psycopg2  # noqa: E402

    conn = psycopg2.connect(os.environ["DATABASE_URL"], connect_timeout=15)
    store = RepoStore(Db(conn))
    cluster_result = ClusteringRunner(
        store, config=ClusteringConfig(min_cluster_size=3)
    ).run()
    print(f"cluster: {cluster_result}", flush=True)
    conn.commit()

    print("=== layout worker job ===", flush=True)
    rc = main(["layout"])
    print(f"rc={rc}", flush=True)
    sys.exit(0)
