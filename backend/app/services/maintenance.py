from sqlalchemy.orm import Session
from app.models.maintenance import MaintenanceRequest


def create_request(db: Session, data, dispatcher_id: int):
    req = MaintenanceRequest(
        dispatcher_id=dispatcher_id,
        **data.dict()
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def get_all_requests(db: Session):
    return db.query(MaintenanceRequest).all()


def get_dispatcher_requests(db: Session, dispatcher_id: int):
    return db.query(MaintenanceRequest).filter(
        MaintenanceRequest.dispatcher_id == dispatcher_id
    ).all()


def update_status(db: Session, request, status: str):
    request.status = status
    db.commit()
    db.refresh(request)
    return request