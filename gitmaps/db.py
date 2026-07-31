"""The DB seam — a thin psycopg2 wrapper.

Plain SQL, no ORM (architecture §2, §11). RepoStore and the worker talk to
Postgres only through this class, so unit tests substitute a recording fake
at this seam. Transaction handling: the caller controls commit/rollback; the
context manager commits on success and rolls back on exception.
"""

from __future__ import annotations

import psycopg2
from psycopg2.extensions import connection, cursor


class Db:
    def __init__(self, conn: connection) -> None:
        self._conn = conn

    @classmethod
    def connect(cls, url: str) -> "Db":
        return cls(psycopg2.connect(url))

    def execute(self, sql: str, params=None) -> cursor:
        cur = self._conn.cursor()
        cur.execute(sql, params)
        return cur

    def executemany(self, sql: str, seq: list) -> cursor:
        cur = self._conn.cursor()
        cur.executemany(sql, seq)
        return cur

    def commit(self) -> None:
        self._conn.commit()

    def rollback(self) -> None:
        self._conn.rollback()

    def close(self) -> None:
        self._conn.close()

    def __enter__(self) -> "Db":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        try:
            if exc_type is None:
                self.commit()
            else:
                self.rollback()
        finally:
            self.close()
