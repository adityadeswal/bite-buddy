import random
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from entities import Recipe
from services import flatmates as flatmates_svc
from services import flats as flats_svc
from services import recipes as recipes_svc
from services import actions as actions_svc

router = APIRouter(prefix="/engine", tags=["engine"])


class GeneratePlanRequest(BaseModel):
    flat_id: str
    date: date


@router.post("/generate-plan", response_model=Recipe)
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

    # 5. Get flat's recipe IDs
    flat = flats_svc.get_flat(flat_id)

    # 6. Fetch recipe details, skipping any that no longer exist
    candidate_recipes = []
    for recipe_id in flat.recipes:
        try:
            candidate_recipes.append(recipes_svc.get_recipe(recipe_id))
        except HTTPException:
            pass

    # 7. Filter by common diet types, dislikes, and recent meals
    filtered = [
        r for r in candidate_recipes
        if set(r.diet_types) & common_diet_types
        and r.id not in all_dislikes
        and r.id not in recent_meal_ids
    ]

    if not filtered:
        raise HTTPException(400, "No suitable recipes found after applying filters")

    # 8. Randomly select one
    return random.choice(filtered)
