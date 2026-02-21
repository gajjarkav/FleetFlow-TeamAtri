from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle

def create_vehicle(db: Session, data):
    vehicle = Vehicle(**data.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def get_vehicles(db: Session):
    return db.query(Vehicle).all()

def get_vehicle(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def update_vehicle(db: Session, vehicle: Vehicle, data):
    for field, value in data.dict(exclude_unset=True).items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


def delete_vehicle(db: Session, vehicle: Vehicle):
    db.delete(vehicle)
    db.commit()