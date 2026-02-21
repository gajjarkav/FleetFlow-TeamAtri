from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.trip import Trip
from app.db.base import get_db
from app.schemas.trip import TripCreate,TripOut, TripStart, TripComplete
from app.services.trip import create_trip, get_trips, get_dispatcher_trips, start_trip, complete_trip
from app.utils.dependencies import manager_required, get_current_user


router = APIRouter(
    prefix='/trips',
    tags=["Trips"]
)

@router.post('/', response_model=TripOut)
def create_trip_route(
    data: TripCreate,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return create_trip(db, data)

@router.get('/', response_model= list[TripOut])
def list_trips(
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return get_trips(db)


@router.get('/me', response_model=list[TripOut])
def mytrips(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
    ):
    if current_user.role != "dispatcher": 
        return []
    
    return get_dispatcher_trips(db, current_user.id)

@router.patch("/{trip_id}/start", response_model=TripOut)
def start_trip_route(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if current_user.id != trip.dispatcher_id:
        raise HTTPException(status_code=403, detail="Not your trip")

    return start_trip(db, trip)

@router.patch("/{trip_id}/complete", response_model=TripOut)
def complete_trip_route(
    trip_id: int,
    data: TripComplete,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if current_user.id != trip.dispatcher_id:
        raise HTTPException(status_code=403, detail="Not your trip")

    return complete_trip(db, trip, data.end_odometer)