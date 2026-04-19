from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException

import db
from dtos import CreateFlatmateAvailabilityDto, UpdateFlatmateAvailabilityDto
from entities import FlatmateAvailability

router = APIRouter(prefix="/availability", tags=["availability"])


def _now() -> date:
    return date.today()


def _row_to_availability(row: dict) -> FlatmateAvailability:
    return FlatmateAvailability(**row)


@router.post("", response_model=FlatmateAvailability, status_code=201)
def create_availability(dto: CreateFlatmateAvailabilityDto):
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


@router.get("", response_model=List[FlatmateAvailability])
def list_availability(flatmate_id: str | None = None):
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


@router.get("/{flatmate_id}/{date}", response_model=FlatmateAvailability)
def get_availability(flatmate_id: str, date: date):
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT * FROM flatmate_availability WHERE flatmate_id = %s AND date = %s AND is_deleted = FALSE",
            (flatmate_id, date),
        )
    if not row:
        raise HTTPException(404, "Availability not found")
    return _row_to_availability(row)


@router.patch("/{flatmate_id}/{date}", response_model=FlatmateAvailability)
def update_availability(flatmate_id: str, date: date, dto: UpdateFlatmateAvailabilityDto):
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT flatmate_id FROM flatmate_availability WHERE flatmate_id = %s AND date = %s AND is_deleted = FALSE",
            (flatmate_id, date),
        )
        if not row:
            raise HTTPException(404, "Availability not found")
        db.execute(
            conn,
            "UPDATE flatmate_availability SET available = %s, last_updated = %s WHERE flatmate_id = %s AND date = %s",
            (dto.available, _now(), flatmate_id, date),
        )
        conn.commit()
        updated = db.fetchone(
            conn,
            "SELECT * FROM flatmate_availability WHERE flatmate_id = %s AND date = %s",
            (flatmate_id, date),
        )
    return _row_to_availability(updated)


@router.delete("/{flatmate_id}/{date}", status_code=204)
def delete_availability(flatmate_id: str, date: date):
    with db.get_conn() as conn:
        row = db.fetchone(
            conn,
            "SELECT flatmate_id FROM flatmate_availability WHERE flatmate_id = %s AND date = %s AND is_deleted = FALSE",
            (flatmate_id, date),
        )
        if not row:
            raise HTTPException(404, "Availability not found")
        db.execute(
            conn,
            "UPDATE flatmate_availability SET is_deleted = TRUE, last_updated = %s WHERE flatmate_id = %s AND date = %s",
            (_now(), flatmate_id, date),
        )
        conn.commit()
