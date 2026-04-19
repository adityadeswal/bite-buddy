from datetime import date
from enum import StrEnum

from typing import List, Optional

from pydantic import BaseModel


class DatabaseRecord(BaseModel):
    is_deleted: bool
    last_updated: date
    created_on: date


class MealTime(StrEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class DietType(StrEnum):
    VEG = "veg"
    NON_VEG = "non_veg"


class Flatmate(DatabaseRecord):
    id: str
    name: str
    email: str
    flat_id: str
    diet_types: List[DietType]
    like_recipes: List[str]
    dislike_recipes: List[str]

class FlatmateAvailability(DatabaseRecord):
    flatmate_id: str
    date: date
    available: bool

class Recipe(DatabaseRecord):
    id: str
    name: str
    meal_time: MealTime
    diet_types: List[DietType]
    photo: str
    url: str

class Cook(DatabaseRecord):
    id: str
    name: str

class Flat(DatabaseRecord):
    id: str
    address: str
    cook_id: str
    recipes: List[str]

class FlatAction(DatabaseRecord):
    flat_id: str
    date: date
    meal_time: MealTime
    is_meal_made: bool
    meal_id: Optional[str]
