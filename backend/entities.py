from datetime import date
from enum import StrEnum

from pydantic import BaseModel


class MealTime(StrEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class DietType(StrEnum):
    VEG = "veg"
    NON_VEG = "non_veg"


class Flatmate(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    flat_id: str
    diet_types: List[DietType]
    like_recipes: List[str]
    dislike_recipes: List[str]

class FlatmateAvailability(BaseModel):
    flatmate_id: str
    date: date
    available: bool

class Recipe(BaseModel):
    id: str
    meal_time: MealTime

    diet_types: List[DietType]
    photo: str
    url: str

class Cook(BaseModel):
    id: str
    name: str

class Flat(BaseModel):
    id: str
    address: str
    cook_id: str
    recipes: List[str]

class FlatActions(BaseModel):
    flat_id: str
    date: date
    meal_time: MealTime
    is_meal_made: bool
    meal_id: Optional[str]
