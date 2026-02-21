from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.services.vehicle import (
    create_vehicle, 
    get_vehicle,
    get_vehicles,
    update_vehicle,
    delete_vehicle
)

from app.utils.dependencies import manager_required


router = APIRouter(
    prefix='/vehicle',
    tags=["Vehicles"]
)

@router.post('/', response_model=VehicleOut)
def create_vehicle_route(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return create_vehicle(db, data)

@router.get('/', response_model=list[VehicleOut])
def list_vehicles(
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return get_vehicles(db)

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle_route(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    vehicle = get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle_route(
    vehicle_id: int,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    vehicle = get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return update_vehicle(db, vehicle, data)

@router.delete("/{vehicle_id}")
def delete_vehicle_route(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    vehicle = get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    delete_vehicle(db, vehicle)
    return {"message": "Vehicle deleted"}