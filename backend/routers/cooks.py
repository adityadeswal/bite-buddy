from typing import List

from fastapi import APIRouter

from dtos import CreateCookDto, UpdateCookDto
from entities import Cook
import services.cooks as cooks_service

router = APIRouter(prefix="/cooks", tags=["cooks"])


@router.post("", response_model=Cook, status_code=201)
def create_cook(dto: CreateCookDto):
    return cooks_service.create_cook(dto)


@router.get("", response_model=List[Cook])
def list_cooks():
    return cooks_service.list_cooks()


@router.get("/{cook_id}", response_model=Cook)
def get_cook(cook_id: str):
    return cooks_service.get_cook(cook_id)


@router.patch("/{cook_id}", response_model=Cook)
def update_cook(cook_id: str, dto: UpdateCookDto):
    return cooks_service.update_cook(cook_id, dto)


@router.delete("/{cook_id}", status_code=204)
def delete_cook(cook_id: str):
    cooks_service.delete_cook(cook_id)
