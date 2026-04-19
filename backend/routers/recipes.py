from typing import List

from fastapi import APIRouter

from dtos import CreateRecipeDto, UpdateRecipeDto
from entities import Recipe
import services.recipes as recipes_service

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.post("", response_model=Recipe, status_code=201)
def create_recipe(dto: CreateRecipeDto):
    return recipes_service.create_recipe(dto)


@router.get("", response_model=List[Recipe])
def list_recipes():
    return recipes_service.list_recipes()


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: str):
    return recipes_service.get_recipe(recipe_id)


@router.patch("/{recipe_id}", response_model=Recipe)
def update_recipe(recipe_id: str, dto: UpdateRecipeDto):
    return recipes_service.update_recipe(recipe_id, dto)


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: str):
    recipes_service.delete_recipe(recipe_id)
