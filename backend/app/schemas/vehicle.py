from pydantic import BaseModel

class VehicleBase(BaseModel):
    name: str
    category: str
    plate_number: str
    region: str
    capacity_kg: int
    odometer: int

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    region: str | None = None
    capacity_kg: int | None = None
    odometer: int | None = None
    status: str | None = None

class VehicleOut(VehicleBase):
    id: int
    status: str

    class Config:
        from_attributes = True