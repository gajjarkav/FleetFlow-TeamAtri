from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceOut,
    MaintenanceUpdateStatus
)
from app.services.maintenance import (
    create_request,
    get_all_requests,
    get_dispatcher_requests,
    update_status
)
from app.utils.dependencies import get_current_user, manager_required
from app.models.maintenance import MaintenanceRequest

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


# Dispatcher submit request
@router.post("/", response_model=MaintenanceOut)
def submit_request(
    data: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "dispatcher":
        raise HTTPException(status_code=403, detail="Only dispatcher can submit")

    return create_request(db, data, current_user.id)


# Dispatcher view their requests
@router.get("/me", response_model=list[MaintenanceOut])
def my_requests(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_dispatcher_requests(db, current_user.id)


# Manager view all
@router.get("/", response_model=list[MaintenanceOut])
def all_requests(
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return get_all_requests(db)


# Manager update status
@router.patch("/{request_id}/status", response_model=MaintenanceOut)
def change_status(
    request_id: int,
    data: MaintenanceUpdateStatus,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    req = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.id == request_id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    return update_status(db, req, data.status)