from datetime import date
from typing import List

from fastapi import HTTPException

import db
from dtos import CreateRecipeDto, UpdateRecipeDto
from entities import Recipe


def _now() -> date:
    return date.today()


def _row_to_recipe(row: dict) -> Recipe:
    return Recipe(**row)


def create_recipe(dto: CreateRecipeDto) -> Recipe:
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(conn, "SELECT id FROM recipe WHERE id = %s", (dto.id,))
        if existing:
            raise HTTPException(400, "Recipe already exists")
        db.execute(
            conn,
            """
            INSERT INTO recipe (id, meal_time, diet_types, photo, url, is_deleted, created_on, last_updated)
            VALUES (%s, %s, %s, %s, %s, FALSE, %s, %s)
            """,
            (dto.id, dto.meal_time, dto.diet_types, dto.photo, dto.url, today, today),
        )
        conn.commit()
        row = db.fetchone(conn, "SELECT * FROM recipe WHERE id = %s", (dto.id,))
    return _row_to_recipe(row)


def list_recipes() -> List[Recipe]:
    with db.get_conn() as conn:
        rows = db.fetchall(conn, "SELECT * FROM recipe WHERE is_deleted = FALSE")
    return [_row_to_recipe(r) for r in rows]


def get_recipe(recipe_id: str) -> Recipe:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT * FROM recipe WHERE id = %s AND is_deleted = FALSE", (recipe_id,)
        )
    if not row:
        raise HTTPException(404, "Recipe not found")
    return _row_to_recipe(row)


def update_recipe(recipe_id: str, dto: UpdateRecipeDto) -> Recipe:
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_recipe(recipe_id)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [recipe_id]
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT id FROM recipe WHERE id = %s AND is_deleted = FALSE", (recipe_id,)
        )
        if not row:
            raise HTTPException(404, "Recipe not found")
        db.execute(conn, f"UPDATE recipe SET {set_clause} WHERE id = %s", values)
        conn.commit()
        updated = db.fetchone(conn, "SELECT * FROM recipe WHERE id = %s", (recipe_id,))
    return _row_to_recipe(updated)


def delete_recipe(recipe_id: str) -> None:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT id FROM recipe WHERE id = %s AND is_deleted = FALSE", (recipe_id,)
        )
        if not row:
            raise HTTPException(404, "Recipe not found")
        db.execute(
            conn,
            "UPDATE recipe SET is_deleted = TRUE, last_updated = %s WHERE id = %s",
            (_now(), recipe_id),
        )
        conn.commit()
