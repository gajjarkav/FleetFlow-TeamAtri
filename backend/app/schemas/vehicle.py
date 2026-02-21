from pydantic import BaseModel
from enum import Enum


class VehicleStatus(str, Enum):
    available = "available"
    on_trip = "on_trip"
    in_shop = "in_shop"
    retired = "retired"

class VehicleBase(BaseModel):
    name: str
    category: str
    plate_number: str
    region: str
    capacity_kg: int
    odometer: int

class VehicleCreate(VehicleBase):
    status: VehicleStatus = VehicleStatus.available

class VehicleUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    region: str | None = None
    capacity_kg: int | None = None
    odometer: int | None = None
    status: VehicleStatus | None = None

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus

class VehicleOut(VehicleBase):
    id: int
    status: VehicleStatus

    class Config:
        from_attributes = True