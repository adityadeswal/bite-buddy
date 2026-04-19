from datetime import date
from typing import List

from fastapi import HTTPException

import db
from dtos import CreateFlatDto, UpdateFlatDto
from entities import Flat


def _now() -> date:
    return date.today()


def _row_to_flat(row: dict) -> Flat:
    return Flat(**row)


def create_flat(dto: CreateFlatDto) -> Flat:
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(conn, "SELECT id FROM flats WHERE id = %s", (dto.id,))
        if existing:
            raise HTTPException(400, "Flat already exists")
        db.execute(
            conn,
            """
            INSERT INTO flats (id, address, cook_id, recipes, is_deleted, created_on, last_updated)
            VALUES (%s, %s, %s, %s, FALSE, %s, %s)
            """,
            (dto.id, dto.address, dto.cook_id, dto.recipes, today, today),
        )
        conn.commit()
        row = db.fetchone(conn, "SELECT * FROM flats WHERE id = %s", (dto.id,))
    return _row_to_flat(row)


def list_flats() -> List[Flat]:
    with db.get_conn() as conn:
        rows = db.fetchall(conn, "SELECT * FROM flats WHERE is_deleted = FALSE")
    return [_row_to_flat(r) for r in rows]


def get_flat(flat_id: str) -> Flat:
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT * FROM flats WHERE id = %s AND is_deleted = FALSE", (flat_id,))
    if not row:
        raise HTTPException(404, "Flat not found")
    return _row_to_flat(row)


def update_flat(flat_id: str, dto: UpdateFlatDto) -> Flat:
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_flat(flat_id)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [flat_id]
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT id FROM flats WHERE id = %s AND is_deleted = FALSE", (flat_id,))
        if not row:
            raise HTTPException(404, "Flat not found")
        db.execute(conn, f"UPDATE flats SET {set_clause} WHERE id = %s", values)
        conn.commit()
        updated = db.fetchone(conn, "SELECT * FROM flats WHERE id = %s", (flat_id,))
    return _row_to_flat(updated)


def delete_flat(flat_id: str) -> None:
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT id FROM flats WHERE id = %s AND is_deleted = FALSE", (flat_id,))
        if not row:
            raise HTTPException(404, "Flat not found")
        db.execute(
            conn,
            "UPDATE flats SET is_deleted = TRUE, last_updated = %s WHERE id = %s",
            (_now(), flat_id),
        )
        conn.commit()
