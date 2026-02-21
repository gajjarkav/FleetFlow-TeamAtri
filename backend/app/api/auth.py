from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import UserLogin, DispatcherCreate, UserOut, DispatcherStatusUpdate
from app.services.auth import (
    authenticate_user,
    create_dispatcher,
    get_dispatcher,
    delete_dispatcher,
    update_dispatcher_status
)
from app.db.base import get_db
from app.utils.dependencies import manager_required, get_current_user
from app.core.security import create_session

router = APIRouter(
    prefix='/auth',
    tags=["Auth"]
)

@router.post('/login')
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=400, detail="invalid creds")
    
    token = create_session(user.id)
    return {
        "token": token,
        "role": user.role
    }

@router.post('/dispatchers', response_model=UserOut)
def create_dispatcher_route(
    data: DispatcherCreate,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return create_dispatcher(db, data)


@router.get('/dispatchers', response_model=list[UserOut])
def list_dispatchers(
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return get_dispatcher(db)

@router.patch('/me/status', response_model=UserOut)
def change_my_status(
    data: DispatcherStatusUpdate,
    current_user= Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "dispatcher":
        raise HTTPException(status_code=403, detail="only dispatcher can update status")
    return update_dispatcher_status(db, current_user, data.duty_status)

@router.get('/me', response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.delete('/dispatchers/{user_id}')
def remove_dispatcher(
    user_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    user = delete_dispatcher(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Dispatcher not found")
    return {"message": "Deleted"}