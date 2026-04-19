import os
from contextlib import contextmanager
from pathlib import Path

import psycopg2
import psycopg2.extras
import psycopg2.pool
from dotenv import load_dotenv

load_dotenv()

_pool: psycopg2.pool.SimpleConnectionPool | None = None

_MIGRATIONS_DIR = Path(__file__).parent / "migrations"

def init_db() -> None:
    global _pool
    _pool = psycopg2.pool.SimpleConnectionPool(
        1, 10,
        host=os.environ["DB_HOST"],
        port=os.environ.get("DB_PORT", "5432"),
        dbname=os.environ.get("DB_NAME", "postgres"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ["DB_PASSWORD"],
    )
    _register_enum_array_casters()
    _run_migrations()


def _register_enum_array_casters() -> None:
    # psycopg2 returns custom-enum arrays (e.g. diet_type[]) as raw postgres
    # literals like '{veg,non_veg}'. Register casters so they decode to
    # Python lists of strings, which Pydantic can then coerce to enums.
    conn = _pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT typarray FROM pg_type WHERE typname = ANY(%s) AND typarray <> 0",
                (["diet_type", "meal_time"],),
            )
            oids = tuple(r[0] for r in cur.fetchall())
        if oids:
            array_type = psycopg2.extensions.new_array_type(
                oids, "ENUM_ARRAY", psycopg2.STRING
            )
            psycopg2.extensions.register_type(array_type)
    finally:
        _pool.putconn(conn)


def _run_migrations() -> None:
    conn = _pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    filename TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
            """)
            cur.execute("SELECT filename FROM schema_migrations")
            applied = {row[0] for row in cur.fetchall()}

            for f in sorted(_MIGRATIONS_DIR.glob("*.sql")):
                if f.name not in applied:
                    cur.execute(f.read_text())
                    cur.execute(
                        "INSERT INTO schema_migrations (filename) VALUES (%s)",
                        (f.name,),
                    )
        conn.commit()
    finally:
        _pool.putconn(conn)


@contextmanager
def get_conn():
    conn = _pool.getconn()
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


def fetchone(conn, query: str, params=()) -> dict | None:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params)
        row = cur.fetchone()
        return dict(row) if row else None


def fetchall(conn, query: str, params=()) -> list[dict]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params)
        return [dict(r) for r in cur.fetchall()]


def execute(conn, query: str, params=()) -> None:
    with conn.cursor() as cur:
        cur.execute(query, params)
