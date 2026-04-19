from datetime import date
from typing import List, Optional

from pydantic import BaseModel

from entities import DietType, MealTime


class CreateFlatDto(BaseModel):
    id: str
    address: str
    cook_id: str
    recipes: List[str] = []


class UpdateFlatDto(BaseModel):
    address: Optional[str] = None
    cook_id: Optional[str] = None
    recipes: Optional[List[str]] = None


class CreateFlatmateDto(BaseModel):
    id: str
    name: str
    email: str
    flat_id: str
    diet_types: List[DietType]
    like_recipes: List[str] = []
    dislike_recipes: List[str] = []


class UpdateFlatmateDto(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    flat_id: Optional[str] = None
    diet_types: Optional[List[DietType]] = None
    like_recipes: Optional[List[str]] = None
    dislike_recipes: Optional[List[str]] = None


class CreateFlatmateAvailabilityDto(BaseModel):
    flatmate_id: str
    date: date
    available: bool


class UpdateFlatmateAvailabilityDto(BaseModel):
    available: bool


class CreateRecipeDto(BaseModel):
    id: str
    name: str
    meal_time: MealTime
    diet_types: List[DietType]
    photo: str
    url: str


class UpdateRecipeDto(BaseModel):
    name: Optional[str] = None
    meal_time: Optional[MealTime] = None
    diet_types: Optional[List[DietType]] = None
    photo: Optional[str] = None
    url: Optional[str] = None


class CreateCookDto(BaseModel):
    id: str
    name: str


class UpdateCookDto(BaseModel):
    name: Optional[str] = None


class CreateFlatActionDto(BaseModel):
    flat_id: str
    date: date
    meal_time: MealTime
    is_meal_made: bool
    meal_id: Optional[str] = None


class UpdateFlatActionDto(BaseModel):
    is_meal_made: Optional[bool] = None
    meal_id: Optional[str] = None
