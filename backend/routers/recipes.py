from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException

import db
from dtos import CreateRecipeDto, UpdateRecipeDto
from entities import Recipe

router = APIRouter(prefix="/recipes", tags=["recipes"])


def _now() -> date:
    return date.today()


def _row_to_recipe(row: dict) -> Recipe:
    return Recipe(**row)


@router.post("", response_model=Recipe, status_code=201)
def create_recipe(dto: CreateRecipeDto):
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(conn, "SELECT id FROM recipes WHERE id = %s", (dto.id,))
        if existing:
            raise HTTPException(400, "Recipe already exists")
        db.execute(
            conn,
            """
            INSERT INTO recipes (id, meal_time, diet_types, photo, url, is_deleted, created_on, last_updated)
            VALUES (%s, %s, %s, %s, %s, FALSE, %s, %s)
            """,
            (dto.id, dto.meal_time, dto.diet_types, dto.photo, dto.url, today, today),
        )
        conn.commit()
        row = db.fetchone(conn, "SELECT * FROM recipes WHERE id = %s", (dto.id,))
    return _row_to_recipe(row)


@router.get("", response_model=List[Recipe])
def list_recipes():
    with db.get_conn() as conn:
        rows = db.fetchall(conn, "SELECT * FROM recipes WHERE is_deleted = FALSE")
    return [_row_to_recipe(r) for r in rows]


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: str):
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT * FROM recipes WHERE id = %s AND is_deleted = FALSE", (recipe_id,)
        )
    if not row:
        raise HTTPException(404, "Recipe not found")
    return _row_to_recipe(row)


@router.patch("/{recipe_id}", response_model=Recipe)
def update_recipe(recipe_id: str, dto: UpdateRecipeDto):
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_recipe(recipe_id)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [recipe_id]
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT id FROM recipes WHERE id = %s AND is_deleted = FALSE", (recipe_id,)
        )
        if not row:
            raise HTTPException(404, "Recipe not found")
        db.execute(conn, f"UPDATE recipes SET {set_clause} WHERE id = %s", values)
        conn.commit()
        updated = db.fetchone(conn, "SELECT * FROM recipes WHERE id = %s", (recipe_id,))
    return _row_to_recipe(updated)


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: str):
    with db.get_conn() as conn:
        row = db.fetchone(
            conn, "SELECT id FROM recipes WHERE id = %s AND is_deleted = FALSE", (recipe_id,)
        )
        if not row:
            raise HTTPException(404, "Recipe not found")
        db.execute(
            conn,
            "UPDATE recipes SET is_deleted = TRUE, last_updated = %s WHERE id = %s",
            (_now(), recipe_id),
        )
        conn.commit()
