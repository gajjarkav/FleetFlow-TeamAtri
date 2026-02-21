from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.user import User



def create_trip(db: Session, data):
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if not vehicle or vehicle.status != "available":
        raise HTTPException(status_code=400, detail="Vehicle not available")

    dispatcher = db.query(User).filter(
        User.id == data.dispatcher_id,
        User.role == "dispatcher"
    ).first()

    if not dispatcher or dispatcher.duty_status != "available":
        raise HTTPException(status_code=400, detail="Dispatcher not available")

    trip = Trip(**data.dict(), status="assigned")


    vehicle.status = "on_trip"
    dispatcher.duty_status = "unavailable"


    db.add(trip)
    db.commit()
    db.refresh(trip)

    return trip

def start_trip(db: Session, trip: Trip):
    if trip.status != "assigned":
        raise HTTPException(status_code=400, detail="trip cannot be started")
    
    trip.status = "in_progress"
    db.commit()
    db.refresh(trip)
    return trip

def complete_trip(db: Session, trip: Trip, end_odometer: int):
    if trip.status != "in_progress":
        raise HTTPException(status_code=400, detail="Trip not in progress")

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    dispatcher = db.query(User).filter(User.id == trip.dispatcher_id).first()

    trip.status = "completed"

    vehicle.status = "available"
    vehicle.odometer = end_odometer

    dispatcher.duty_status = "available"

    db.commit()
    db.refresh(trip)

    return trip

def get_trips(db: Session):
    return db.query(Trip).all()


def get_dispatcher_trips(db: Session, dispatcher_id: int):
    return db.query(Trip).filter(Trip.dispatcher_id == dispatcher_id).all()