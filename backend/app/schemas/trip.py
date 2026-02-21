from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class TripStatus(str, Enum):
    assined = "assigned"
    in_progress = "in_progress"
    copmleted = "completed"
    cancelled = "cancelled"

class TripStart(BaseModel):
    pass

class TripComplete(BaseModel):
    end_odometer: int

class TripCreate(BaseModel):
    vehicle_id: int
    dispatcher_id: int
    total_km: float
    start_time: datetime
    end_time: datetime
    payment_amount: float

class TripOut(BaseModel):
    id: int
    vehicle_id: int
    dispatcher_id: int
    total_km: float
    start_time: datetime
    end_time: datetime
    payment_amount: float
    status: TripStatus

    class Config:
        from_attributes = True