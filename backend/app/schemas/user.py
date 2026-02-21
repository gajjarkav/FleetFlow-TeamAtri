from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum


class DutyStatus(str, Enum):
    available = "available"
    unavailable = "unavailabel"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DispatcherStatusUpdate(BaseModel):
    duty_status: DutyStatus | None

class DispatcherCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    mobile_number: str
    license_number: str
    license_expiry: datetime

class UserOut(BaseModel):
    id: int
    name: str | None
    email: EmailStr
    role: str
    mobile_number: str | None
    license_number: str | None
    license_expiry: datetime | None

    class Config:
        from_attributes = True