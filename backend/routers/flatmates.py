from typing import List

from fastapi import APIRouter

from dtos import CreateFlatmateDto, UpdateFlatmateDto
from entities import Flatmate
import services.flatmates as flatmates_service

router = APIRouter(prefix="/flatmates", tags=["flatmates"])


@router.post("", response_model=Flatmate, status_code=201)
def create_flatmate(dto: CreateFlatmateDto):
    return flatmates_service.create_flatmate(dto)


@router.get("", response_model=List[Flatmate])
def list_flatmates(flat_id: str | None = None):
    return flatmates_service.list_flatmates(flat_id)


@router.get("/{flatmate_id}", response_model=Flatmate)
def get_flatmate(flatmate_id: str):
    return flatmates_service.get_flatmate(flatmate_id)


@router.patch("/{flatmate_id}", response_model=Flatmate)
def update_flatmate(flatmate_id: str, dto: UpdateFlatmateDto):
    return flatmates_service.update_flatmate(flatmate_id, dto)


@router.delete("/{flatmate_id}", status_code=204)
def delete_flatmate(flatmate_id: str):
    flatmates_service.delete_flatmate(flatmate_id)
