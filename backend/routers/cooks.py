from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException

import db
from dtos import CreateCookDto, UpdateCookDto
from entities import Cook

router = APIRouter(prefix="/cooks", tags=["cooks"])


def _now() -> date:
    return date.today()


def _row_to_cook(row: dict) -> Cook:
    return Cook(**row)


@router.post("", response_model=Cook, status_code=201)
def create_cook(dto: CreateCookDto):
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(conn, "SELECT id FROM cooks WHERE id = %s", (dto.id,))
        if existing:
            raise HTTPException(400, "Cook already exists")
        db.execute(
            conn,
            "INSERT INTO cooks (id, name, is_deleted, created_on, last_updated) VALUES (%s, %s, FALSE, %s, %s)",
            (dto.id, dto.name, today, today),
        )
        conn.commit()
        row = db.fetchone(conn, "SELECT * FROM cooks WHERE id = %s", (dto.id,))
    return _row_to_cook(row)


@router.get("", response_model=List[Cook])
def list_cooks():
    with db.get_conn() as conn:
        rows = db.fetchall(conn, "SELECT * FROM cooks WHERE is_deleted = FALSE")
    return [_row_to_cook(r) for r in rows]


@router.get("/{cook_id}", response_model=Cook)
def get_cook(cook_id: str):
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT * FROM cooks WHERE id = %s AND is_deleted = FALSE", (cook_id,))
    if not row:
        raise HTTPException(404, "Cook not found")
    return _row_to_cook(row)


@router.patch("/{cook_id}", response_model=Cook)
def update_cook(cook_id: str, dto: UpdateCookDto):
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_cook(cook_id)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [cook_id]
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT id FROM cooks WHERE id = %s AND is_deleted = FALSE", (cook_id,))
        if not row:
            raise HTTPException(404, "Cook not found")
        db.execute(conn, f"UPDATE cooks SET {set_clause} WHERE id = %s", values)
        conn.commit()
        updated = db.fetchone(conn, "SELECT * FROM cooks WHERE id = %s", (cook_id,))
    return _row_to_cook(updated)


@router.delete("/{cook_id}", status_code=204)
def delete_cook(cook_id: str):
    with db.get_conn() as conn:
        row = db.fetchone(conn, "SELECT id FROM cooks WHERE id = %s AND is_deleted = FALSE", (cook_id,))
        if not row:
            raise HTTPException(404, "Cook not found")
        db.execute(
            conn,
            "UPDATE cooks SET is_deleted = TRUE, last_updated = %s WHERE id = %s",
            (_now(), cook_id),
        )
        conn.commit()
