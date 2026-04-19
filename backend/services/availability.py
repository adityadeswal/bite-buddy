from datetime import date
from typing import List

from fastapi import HTTPException

import db
from dtos import CreateFlatmateAvailabilityDto, UpdateFlatmateAvailabilityDto
from entities import FlatmateAvailability


def _now() -> date:
    return date.today()


def _row_to_availability(row: dict) -> FlatmateAvailability:
    return FlatmateAvailability(**row)


def create_availability(dto: CreateFlatmateAvailabilityDto) -> FlatmateAvailability:
    today = _now()
    with db.get_conn() as conn:
        existing = db.fetchone(
            conn,
            "SELECT flatmate_id FROM flatmate_availability WHERE flatmate_id = %s AND date = %s",
            (dto.flatmate_id, dto.date),
        )
        if existing:
            raise HTTPException(400, "Availability record already exists")
        db.execute(
            conn,
            """
            INSERT INTO flatmate_availability
                (flatmate_id, date, available, is_deleted, created_on, last_updated)
            VALUES (%s, %s, %s, FALSE, %s, %s)
            """,
            (dto.flatmate_id, dto.date, dto.available, today, today),
        )
        conn.commit()
        row = db.fetchone(
            conn,
            "SELECT * FROM flatmate_availability WHERE flatmate_id = %s AND date = %s",
            (dto.flatmate_id, dto.date),
        )
    return _row_to_availability(row)


def list_availability(flatmate_id: str | None = None) -> List[FlatmateAvailability]:
    with db.get_conn() as conn:
        if flatmate_id:
            rows = db.fetchall(
                conn,
                "SELECT * FROM flatmate_availability WHERE is_deleted = FALSE AND flatmate_id = %s",
                (flatmate_id,),
            )
        else:
            rows = db.fetchall(
                conn, "SELECT * FROM flatmate_availability WHERE is_deleted = FALSE"
            )
    return [_row_to_availability(r) for r in rows]


def get_availability(flatmate_id: str, avail_date: date) -> FlatmateAvailability:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT * FROM flatmate_availability WHERE flatmate_id = %s AND date = %s AND is_deleted = FALSE",
            (flatmate_id, avail_date),
        )
    if not row:
        raise HTTPException(404, "Availability not found")
    return _row_to_availability(row)


def update_availability(flatmate_id: str, avail_date: date, dto: UpdateFlatmateAvailabilityDto) -> FlatmateAvailability:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT flatmate_id FROM flatmate_availability WHERE flatmate_id = %s AND date = %s AND is_deleted = FALSE",
            (flatmate_id, avail_date),
        )
        if not row:
            raise HTTPException(404, "Availability not found")
        db.execute(
            conn,
            "UPDATE flatmate_availability SET available = %s, last_updated = %s WHERE flatmate_id = %s AND date = %s",
            (dto.available, _now(), flatmate_id, avail_date),
        )
        conn.commit()
        updated = db.fetchone(
            conn,
            "SELECT * FROM flatmate_availability WHERE flatmate_id = %s AND date = %s",
            (flatmate_id, avail_date),
        )
    return _row_to_availability(updated)


def delete_availability(flatmate_id: str, avail_date: date) -> None:
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT flatmate_id FROM flatmate_availability WHERE flatmate_id = %s AND date = %s AND is_deleted = FALSE",
            (flatmate_id, avail_date),
        )
        if not row:
            raise HTTPException(404, "Availability not found")
        db.execute(
            conn,
            "UPDATE flatmate_availability SET is_deleted = TRUE, last_updated = %s WHERE flatmate_id = %s AND date = %s",
            (_now(), flatmate_id, avail_date),
        )
        conn.commit()
