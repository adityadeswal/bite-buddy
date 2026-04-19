from datetime import date
from typing import List

from fastapi import APIRouter

from dtos import CreateFlatActionDto, UpdateFlatActionDto
from entities import FlatAction, MealTime
import services.actions as actions_service

router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("", response_model=FlatAction, status_code=201)
def create_action(dto: CreateFlatActionDto):
    return actions_service.create_action(dto)


@router.get("", response_model=List[FlatAction])
def list_actions(flat_id: str | None = None):
    return actions_service.list_actions(flat_id)


@router.get("/{flat_id}/{date}/{meal_time}", response_model=FlatAction)
def get_action(flat_id: str, date: date, meal_time: MealTime):
    return actions_service.get_action(flat_id, date, meal_time)


@router.patch("/{flat_id}/{date}/{meal_time}", response_model=FlatAction)
def update_action(flat_id: str, date: date, meal_time: MealTime, dto: UpdateFlatActionDto):
    return actions_service.update_action(flat_id, date, meal_time, dto)


@router.delete("/{flat_id}/{date}/{meal_time}", status_code=204)
def delete_action(flat_id: str, date: date, meal_time: MealTime):
    actions_service.delete_action(flat_id, date, meal_time)
