from datetime import date
from typing import List

from fastapi import APIRouter

from dtos import CreateFlatmateAvailabilityDto, UpdateFlatmateAvailabilityDto
from entities import FlatmateAvailability
import services.availability as availability_service

router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("", response_model=FlatmateAvailability, status_code=201)
def create_availability(dto: CreateFlatmateAvailabilityDto):
    return availability_service.create_availability(dto)


@router.get("", response_model=List[FlatmateAvailability])
def list_availability(flatmate_id: str | None = None):
    return availability_service.list_availability(flatmate_id)


@router.get("/{flatmate_id}/{date}", response_model=FlatmateAvailability)
def get_availability(flatmate_id: str, date: date):
    return availability_service.get_availability(flatmate_id, date)


@router.patch("/{flatmate_id}/{date}", response_model=FlatmateAvailability)
def update_availability(flatmate_id: str, date: date, dto: UpdateFlatmateAvailabilityDto):
    return availability_service.update_availability(flatmate_id, date, dto)


@router.delete("/{flatmate_id}/{date}", status_code=204)
def delete_availability(flatmate_id: str, date: date):
    availability_service.delete_availability(flatmate_id, date)
