from datetime import date
from typing import List

from fastapi import HTTPException

import db
from dtos import CreateFlatmateDto, UpdateFlatmateDto
from entities import Flatmate


def _now() -> date:
    return date.today()


def _row_to_flatmate(row: dict) -> Flatmate:
    return Flatmate(**row)


def create_flatmate(dto: CreateFlatmateDto) -> Flatmate:
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(conn, "SELECT id FROM flatmates WHERE id = %s", (dto.id,))
        if existing:
            raise HTTPException(400, "Flatmate already exists")
        db.execute(
            conn,
            """
            INSERT INTO flatmates
                (id, name, email, flat_id, diet_types, like_recipes, dislike_recipes,
                 is_deleted, created_on, last_updated)
            VALUES (%s, %s, %s, %s, %s, %s, %s, FALSE, %s, %s)
            """,
            (
                dto.id, dto.name, dto.email, dto.flat_id,
                dto.diet_types, dto.like_recipes, dto.dislike_recipes,
                today, today,
            ),
        )
        conn.commit()
        row = db.fetchone(conn, "SELECT * FROM flatmates WHERE id = %s", (dto.id,))
    return _row_to_flatmate(row)


def list_flatmates(flat_id: str | None = None) -> List[Flatmate]:
    with db.get_conn() as conn:
        if flat_id:
            rows = db.fetchall(
                conn,
                "SELECT * FROM flatmates WHERE is_deleted = FALSE AND flat_id = %s",
                (flat_id,),
            )
        else:
            rows = db.fetchall(conn, "SELECT * FROM flatmates WHERE is_deleted = FALSE")
    return [_row_to_flatmate(r) for r in rows]


def get_flatmate(flatmate_id: str) -> Flatmate:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT * FROM flatmates WHERE id = %s AND is_deleted = FALSE", (flatmate_id,)
        )
    if not row:
        raise HTTPException(404, "Flatmate not found")
    return _row_to_flatmate(row)


def update_flatmate(flatmate_id: str, dto: UpdateFlatmateDto) -> Flatmate:
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_flatmate(flatmate_id)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [flatmate_id]
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT id FROM flatmates WHERE id = %s AND is_deleted = FALSE", (flatmate_id,)
        )
        if not row:
            raise HTTPException(404, "Flatmate not found")
        db.execute(conn, f"UPDATE flatmates SET {set_clause} WHERE id = %s", values)
        conn.commit()
        updated = db.fetchone(conn, "SELECT * FROM flatmates WHERE id = %s", (flatmate_id,))
    return _row_to_flatmate(updated)


def delete_flatmate(flatmate_id: str) -> None:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT id FROM flatmates WHERE id = %s AND is_deleted = FALSE", (flatmate_id,)
        )
        if not row:
            raise HTTPException(404, "Flatmate not found")
        db.execute(
            conn,
            "UPDATE flatmates SET is_deleted = TRUE, last_updated = %s WHERE id = %s",
            (_now(), flatmate_id),
        )
        conn.commit()
