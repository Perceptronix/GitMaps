"""Validate the technology classification pipeline against real GitHub repos.

Usage:
    python tools/validate_classification.py [--limit N]

Connects to the live Supabase database (**read-only**), pulls a sample of real
embedded repositories across languages, and for each one fetches its **real
README** through the GitHub client, composes the semantic text the pipeline
uses (identity + description + topics + language + homepage + README), and
prints the domains the taxonomy assigns. This is the real-data sanity check
that the keyword taxonomy is sensible — the deterministic counterpart is the
rolled-back live test in `tests/test_classification_integration.py`.

Nothing is written: the DB connection is read-only and every README fetch
charges the normal shared rate budget, but no domain is ever persisted here.
Persisting happens by running the worker job: `python -m gitmaps.worker classify`.
"""

from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2  # noqa: E402  (importable only after the repo root is on sys.path)

from gitmaps.classification import DEFAULT_TAXONOMY, classify_domains  # noqa: E402
from gitmaps.config import Settings  # noqa: E402
from gitmaps.db import Db  # noqa: E402
from gitmaps.embeddings import compose_semantic_text  # noqa: E402
from gitmaps.github.client import GitHubApiError, GitHubClient, RateLimitError  # noqa: E402

SAMPLE_SQL = """
SELECT id, owner, name, full_name, description, topics, language, homepage
FROM repos
WHERE embedding IS NOT NULL AND description IS NOT NULL AND length(description) > 25
ORDER BY id
LIMIT %s
"""

#: A working keyword set that should be *absent* from a genuinely non-matching
#: repo, used to sanity-check a couple of negative examples.
NEGATIVE_DOMAINS = ("Cybersecurity", "Blockchain", "Game Development")


def _load_dotenv(path: str = ".env") -> None:
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip().strip("'\""))
    except OSError:
        pass


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=12, help="repos to classify (default 12)")
    args = parser.parse_args()

    _load_dotenv()
    try:
        settings = Settings.from_env()
    except ValueError as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return 1

    try:
        conn = psycopg2.connect(settings.database_url, connect_timeout=15)
        conn.set_session(readonly=True)  # validation must never write
        db = Db(conn)
    except psycopg2.Error as exc:
        print(f"Supabase unreachable: {exc}", file=sys.stderr)
        return 1

    client = None
    try:
        client = GitHubClient(list(settings.github_tokens))

        cur = db.execute(SAMPLE_SQL, (args.limit,))
        rows = cur.fetchall()

        print(f"taxonomy: {len(DEFAULT_TAXONOMY)} domains; validating {len(rows)} real repos\n")
        rate_limited = False
        for row in rows:
            repo_id, owner, name, full_name, description, topics, language, homepage = row
            try:
                readme = client.get_readme(owner, name)
            except RateLimitError:
                print(f"{full_name}: !! rate limited, stopping")
                rate_limited = True
                break
            except GitHubApiError:
                readme = None  # no README (404) or fetch failure — metadata still counts

            text = compose_semantic_text(
                full_name=full_name, description=description, topics=topics,
                language=language, homepage=homepage, readme=readme,
                readme_max_chars=2000,
            )
            domains = classify_domains(text)
            negative = ", ".join(d for d in NEGATIVE_DOMAINS if d not in domains)
            print(f"{full_name}")
            print(f"    lang={language or '-':<10} readme={len(readme) if readme else 0} chars")
            print(f"    domains=[{', '.join(domains) or '-'}]" + (f"   (no: {negative})" if negative else ""))

        if rate_limited:
            print("\nstopped early: GitHub rate limit reached", file=sys.stderr)
        return 0
    finally:
        db.rollback()
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
