from typing import List

from fastapi import APIRouter

from dtos import CreateFlatDto, UpdateFlatDto
from entities import Flat
import services.flats as flats_service

router = APIRouter(prefix="/flats", tags=["flats"])


@router.post("", response_model=Flat, status_code=201)
def create_flat(dto: CreateFlatDto):
    return flats_service.create_flat(dto)


@router.get("", response_model=List[Flat])
def list_flats():
    return flats_service.list_flats()


@router.get("/{flat_id}", response_model=Flat)
def get_flat(flat_id: str):
    return flats_service.get_flat(flat_id)


@router.patch("/{flat_id}", response_model=Flat)
def update_flat(flat_id: str, dto: UpdateFlatDto):
    return flats_service.update_flat(flat_id, dto)


@router.delete("/{flat_id}", status_code=204)
def delete_flat(flat_id: str):
    flats_service.delete_flat(flat_id)
