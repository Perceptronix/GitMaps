"""Validate the Similar repositories service against real embedded data.

Usage:
    python tools/validate_similarity.py [--top N] [full_name ...]

Connects to the live Supabase database **read-only**, resolves each source
repository (the CLI args, or one per major language auto-selected from the
embedded set), and prints its top-N nearest neighbors with cosine scores — the
real-data sanity check that the ANN retrieval returns semantically sensible
look-alikes. The deterministic counterpart is the rolled-back live test in
`tests/test_similarity_integration.py`.
"""

from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2  # noqa: E402  (importable only after the repo root is on sys.path)

from gitmaps.db import Db  # noqa: E402
from gitmaps.repo_store import RepoStore  # noqa: E402
from gitmaps.similarity import SimilarityConfig, SimilarityError, SimilarityService  # noqa: E402

MAJOR_LANGUAGES = ("Python", "TypeScript", "Rust", "Go", "Swift", "JavaScript")

SELECT_SOURCE_BY_LANGUAGE_SQL = """
SELECT full_name FROM repos
WHERE embedding IS NOT NULL AND language = %s
  AND description IS NOT NULL AND length(description) > 25
ORDER BY stars DESC
LIMIT 1
"""


def _env_url() -> str | None:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    try:
        with open(".env", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line.startswith("DATABASE_URL="):
                    value = line.split("=", 1)[1].strip()
                    return value.strip("'\"")
    except OSError:
        return None
    return None


def default_sources(db: Db) -> list[str]:
    """One embedded source repo per major language, most-starred with a description."""
    sources: list[str] = []
    for language in MAJOR_LANGUAGES:
        cur = db.execute(SELECT_SOURCE_BY_LANGUAGE_SQL, (language,))
        row = cur.fetchone()
        if row:
            sources.append(row[0])
    return sources


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--top", type=int, default=5, help="neighbors per source (default 5)")
    parser.add_argument("full_names", nargs="*", help="source repos (default: one per major language)")
    args = parser.parse_args()

    url = _env_url()
    if not url:
        print("DATABASE_URL not available", file=sys.stderr)
        return 1
    try:
        conn = psycopg2.connect(url, connect_timeout=15)
        conn.set_session(readonly=True)  # validation must never write
        db = Db(conn)
    except psycopg2.Error as exc:
        print(f"Supabase unreachable: {exc}", file=sys.stderr)
        return 1

    try:
        sources = args.full_names or default_sources(db)
        if not sources:
            print("no embedded repos found to validate against", file=sys.stderr)
            return 1

        store = RepoStore(db)
        service = SimilarityService(store, config=SimilarityConfig(top_n=args.top))
        for full_name in sources:
            print(f"\n{full_name} ->")
            try:
                for i, repo in enumerate(service.similar(full_name), 1):
                    topics = ",".join(repo.topics) or "-"
                    print(
                        f"  {i}. {repo.full_name:<40} sim={repo.similarity:.4f} "
                        f"lang={repo.language or '-':<10} stars={repo.stars} topics=[{topics}]"
                    )
            except SimilarityError as exc:
                print(f"  !! {exc}")
        return 0
    finally:
        db.rollback()
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
