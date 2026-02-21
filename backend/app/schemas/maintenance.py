from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class MaintenanceStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    maintenance_type: str
    description: str = Field(max_length=400)
    date: datetime
    estimated_cost: float
    workshop: str | None = None


class MaintenanceUpdateStatus(BaseModel):
    status: MaintenanceStatus


class MaintenanceOut(BaseModel):
    id: int
    dispatcher_id: int
    vehicle_id: int
    maintenance_type: str
    description: str
    date: datetime
    estimated_cost: float
    workshop: str | None
    status: MaintenanceStatus

    class Config:
        from_attributes = True