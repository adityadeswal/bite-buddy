from datetime import date
from typing import List

from fastapi import HTTPException

import db
from dtos import CreateCookDto, UpdateCookDto
from entities import Cook


def _now() -> date:
    return date.today()


def _row_to_cook(row: dict) -> Cook:
    return Cook(**row)


def create_cook(dto: CreateCookDto) -> Cook:
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(conn, "SELECT id FROM cook WHERE id = %s", (dto.id,))
        if existing:
            raise HTTPException(400, "Cook already exists")
        db.execute(
            conn,
            "INSERT INTO cook (id, name, is_deleted, created_on, last_updated) VALUES (%s, %s, FALSE, %s, %s)",
            (dto.id, dto.name, today, today),
        )
        conn.commit()
        row = db.fetchone(conn, "SELECT * FROM cook WHERE id = %s", (dto.id,))
    return _row_to_cook(row)


def list_cooks() -> List[Cook]:
    with db.get_conn() as conn:
        rows = db.fetchall(conn, "SELECT * FROM cook WHERE is_deleted = FALSE")
    return [_row_to_cook(r) for r in rows]


def get_cook(cook_id: str) -> Cook:
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT * FROM cook WHERE id = %s AND is_deleted = FALSE", (cook_id,))
    if not row:
        raise HTTPException(404, "Cook not found")
    return _row_to_cook(row)


def update_cook(cook_id: str, dto: UpdateCookDto) -> Cook:
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_cook(cook_id)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [cook_id]
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT id FROM cook WHERE id = %s AND is_deleted = FALSE", (cook_id,))
        if not row:
            raise HTTPException(404, "Cook not found")
        db.execute(conn, f"UPDATE cook SET {set_clause} WHERE id = %s", values)
        conn.commit()
        updated = db.fetchone(conn, "SELECT * FROM cook WHERE id = %s", (cook_id,))
    return _row_to_cook(updated)


def delete_cook(cook_id: str) -> None:
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT id FROM cook WHERE id = %s AND is_deleted = FALSE", (cook_id,))
        if not row:
            raise HTTPException(404, "Cook not found")
        db.execute(
            conn,
            "UPDATE cook SET is_deleted = TRUE, last_updated = %s WHERE id = %s",
            (_now(), cook_id),
        )
        conn.commit()
