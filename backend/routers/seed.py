"""Idempotent seed endpoint — upserts cooks, flats, and flatmates so the API
has the same entities the frontend mock uses. Recipes are not touched here;
they are seeded directly in the DB via migrations.
"""
from datetime import date

from fastapi import APIRouter

import db

router = APIRouter(prefix="/seed", tags=["seed"])


COOKS = [
    {"id": "cook-kabir", "name": "Chef Kabir"},
    {"id": "cook-meera", "name": "Chef Meera"},
]

FLATS = [
    {
        "id": "flat-green-park",
        "address": "B-42, Green Park, New Delhi 110016",
        "cook_id": "cook-kabir",
        "recipes": [],
    },
    {
        "id": "flat-bachelor-pad",
        "address": "A-17, Hauz Khas, New Delhi 110016",
        "cook_id": "cook-kabir",
        "recipes": [],
    },
    {
        "id": "flat-gulmohar",
        "address": "C-12, Gulmohar Park, New Delhi 110049",
        "cook_id": "cook-meera",
        "recipes": [],
    },
]

FLATMATES = [
    {
        "id": "fm-aman", "name": "Aman Gupta", "email": "aman@bite.buddy",
        "flat_id": "flat-green-park", "diet_types": ["non_veg"],
    },
    {
        "id": "fm-riya", "name": "Riya Sharma", "email": "riya@bite.buddy",
        "flat_id": "flat-green-park", "diet_types": ["non_veg"],
    },
    {
        "id": "fm-arjun", "name": "Arjun Mehta", "email": "arjun@bite.buddy",
        "flat_id": "flat-green-park", "diet_types": ["veg"],
    },
    {
        "id": "fm-sarah", "name": "Sarah Jenkins", "email": "sarah@bite.buddy",
        "flat_id": "flat-green-park", "diet_types": ["non_veg"],
    },
    {
        "id": "fm-vikram", "name": "Vikram Malhotra", "email": "vikram@bite.buddy",
        "flat_id": "flat-bachelor-pad", "diet_types": ["non_veg"],
    },
    {
        "id": "fm-daniel", "name": "Daniel Choi", "email": "daniel@bite.buddy",
        "flat_id": "flat-bachelor-pad", "diet_types": ["non_veg"],
    },
]


@router.post("")
def seed() -> dict:
    today = date.today()
    with db.get_conn() as conn:
        for c in COOKS:
            db.execute(
                conn,
                """
                INSERT INTO cook (id, name, is_deleted, created_on, last_updated)
                VALUES (%s, %s, FALSE, %s, %s)
                ON CONFLICT (id) DO UPDATE
                    SET name = EXCLUDED.name,
                        is_deleted = FALSE,
                        last_updated = EXCLUDED.last_updated
                """,
                (c["id"], c["name"], today, today),
            )
        for f in FLATS:
            db.execute(
                conn,
                """
                INSERT INTO flat (id, address, cook_id, recipes, is_deleted, created_on, last_updated)
                VALUES (%s, %s, %s, %s, FALSE, %s, %s)
                ON CONFLICT (id) DO UPDATE
                    SET address = EXCLUDED.address,
                        cook_id = EXCLUDED.cook_id,
                        is_deleted = FALSE,
                        last_updated = EXCLUDED.last_updated
                """,
                (f["id"], f["address"], f["cook_id"], f["recipes"], today, today),
            )
        for fm in FLATMATES:
            db.execute(
                conn,
                """
                INSERT INTO flatmate
                    (id, name, email, flat_id, diet_types, like_recipes, dislike_recipes,
                     is_deleted, created_on, last_updated)
                VALUES (%s, %s, %s, %s, %s::diet_type[], %s, %s, FALSE, %s, %s)
                ON CONFLICT (id) DO UPDATE
                    SET name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        flat_id = EXCLUDED.flat_id,
                        diet_types = EXCLUDED.diet_types,
                        is_deleted = FALSE,
                        last_updated = EXCLUDED.last_updated
                """,
                (
                    fm["id"], fm["name"], fm["email"], fm["flat_id"],
                    fm["diet_types"], [], [],
                    today, today,
                ),
            )
        conn.commit()
    return {
        "cooks": len(COOKS),
        "flats": len(FLATS),
        "flatmates": len(FLATMATES),
    }
