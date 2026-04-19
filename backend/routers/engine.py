import random
from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from dtos import CreateFlatActionDto
from entities import MealTime, Recipe
from services import flatmates as flatmates_svc
from services import recipes as recipes_svc
from services import actions as actions_svc

router = APIRouter(prefix="/engine", tags=["engine"])


class GeneratePlanRequest(BaseModel):
    flat_id: str
    date: date


@router.post("/generate-plan", response_model=List[Recipe])
def generate_plan(body: GeneratePlanRequest):
    flat_id = body.flat_id
    target_date = body.date

    # 1. Get all flatmates
    flatmates = flatmates_svc.list_flatmates(flat_id=flat_id)
    if not flatmates:
        raise HTTPException(400, "No flatmates found for this flat")

    # 2. Calculate common diet types (intersection)
    common_diet_types = set(flatmates[0].diet_types)
    for fm in flatmates[1:]:
        common_diet_types &= set(fm.diet_types)
    if not common_diet_types:
        raise HTTPException(400, "No common meal types among flatmates")

    # 3. Collect all dislikes (union)
    all_dislikes = set()
    for fm in flatmates:
        all_dislikes.update(fm.dislike_recipes)

    # 4. Get meals made in previous 2 days
    start = target_date - timedelta(days=2)
    end = target_date - timedelta(days=1)
    recent_actions = actions_svc.list_actions(flat_id=flat_id, start_date=start, end_date=end)
    recent_meal_ids = {a.meal_id for a in recent_actions if a.meal_id is not None}

    # 5. Get all available recipes
    candidate_recipes = recipes_svc.list_recipes()

    # 7. For each meal type, select a recipe and persist a FlatAction
    results = []
    for meal_type in [MealTime.BREAKFAST, MealTime.LUNCH, MealTime.DINNER]:
        filtered = [
            r for r in candidate_recipes
            if set(r.diet_types) & common_diet_types
            and r.id not in all_dislikes
            and r.id not in recent_meal_ids
            and r.meal_time == meal_type
        ]

        if not filtered:
            raise HTTPException(400, f"No suitable recipes found for {meal_type} after applying filters")

        selected = random.choice(filtered)

        actions_svc.create_action(CreateFlatActionDto(
            flat_id=flat_id,
            date=target_date,
            meal_time=meal_type,
            is_meal_made=False,
            meal_id=selected.id,
        ))

        results.append(selected)

    return results
