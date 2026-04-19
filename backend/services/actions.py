from datetime import date
from typing import List

from fastapi import HTTPException

import db
from dtos import CreateFlatActionDto, UpdateFlatActionDto
from entities import FlatAction, MealTime


def _now() -> date:
    return date.today()


def _row_to_action(row: dict) -> FlatAction:
    return FlatAction(**row)


def create_action(dto: CreateFlatActionDto) -> FlatAction:
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(
            conn,
            "SELECT flat_id FROM flat_actions WHERE flat_id = %s AND date = %s AND meal_time = %s",
            (dto.flat_id, dto.date, dto.meal_time),
        )
        if existing:
            raise HTTPException(400, "FlatAction already exists")
        db.execute(
            conn,
            """
            INSERT INTO flat_actions
                (flat_id, date, meal_time, is_meal_made, meal_id, is_deleted, created_on, last_updated)
            VALUES (%s, %s, %s, %s, %s, FALSE, %s, %s)
            """,
            (dto.flat_id, dto.date, dto.meal_time, dto.is_meal_made, dto.meal_id, today, today),
        )
        conn.commit()
        row = db.fetchone(
            conn,
            "SELECT * FROM flat_actions WHERE flat_id = %s AND date = %s AND meal_time = %s",
            (dto.flat_id, dto.date, dto.meal_time),
        )
    return _row_to_action(row)


def list_actions(flat_id: str | None = None, start_date: date | None = None, end_date: date | None = None) -> List[FlatAction]:
    with db.get_conn() as conn:
        conditions = ["is_deleted = FALSE"]
        params: list = []
        if flat_id:
            conditions.append("flat_id = %s")
            params.append(flat_id)
        if start_date:
            conditions.append("date >= %s")
            params.append(start_date)
        if end_date:
            conditions.append("date <= %s")
            params.append(end_date)
        where = " AND ".join(conditions)
        rows = db.fetchall(conn, f"SELECT * FROM flat_actions WHERE {where}", params)
    return [_row_to_action(r) for r in rows]


def get_action(flat_id: str, action_date: date, meal_time: MealTime) -> FlatAction:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT * FROM flat_actions WHERE flat_id = %s AND date = %s AND meal_time = %s AND is_deleted = FALSE",
            (flat_id, action_date, meal_time),
        )
    if not row:
        raise HTTPException(404, "FlatAction not found")
    return _row_to_action(row)


def update_action(flat_id: str, action_date: date, meal_time: MealTime, dto: UpdateFlatActionDto) -> FlatAction:
    updates = dto.model_dump(exclude_none=True)
    if not updates:
        return get_action(flat_id, action_date, meal_time)
    updates["last_updated"] = _now()
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [flat_id, action_date, meal_time]
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT flat_id FROM flat_actions WHERE flat_id = %s AND date = %s AND meal_time = %s AND is_deleted = FALSE",
            (flat_id, action_date, meal_time),
        )
        if not row:
            raise HTTPException(404, "FlatAction not found")
        db.execute(
            conn,
            f"UPDATE flat_actions SET {set_clause} WHERE flat_id = %s AND date = %s AND meal_time = %s",
            values,
        )
        conn.commit()
        updated = db.fetchone(
            conn,
            "SELECT * FROM flat_actions WHERE flat_id = %s AND date = %s AND meal_time = %s",
            (flat_id, action_date, meal_time),
        )
    return _row_to_action(updated)


def delete_action(flat_id: str, action_date: date, meal_time: MealTime) -> None:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT flat_id FROM flat_actions WHERE flat_id = %s AND date = %s AND meal_time = %s AND is_deleted = FALSE",
            (flat_id, action_date, meal_time),
        )
        if not row:
            raise HTTPException(404, "FlatAction not found")
        db.execute(
            conn,
            "UPDATE flat_actions SET is_deleted = TRUE, last_updated = %s WHERE flat_id = %s AND date = %s AND meal_time = %s",
            (_now(), flat_id, action_date, meal_time),
        )
        conn.commit()
