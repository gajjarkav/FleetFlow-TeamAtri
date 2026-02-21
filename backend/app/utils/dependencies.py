from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.security import get_user_from_token
from app.models.user import User


def get_current_user(
        token: str = Header(...),
        db: Session = Depends(get_db)
):
    user_id = get_user_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid Token")
    
    user = db.query(User).get(user_id)

    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    
    return user

def manager_required(current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="manager access required")
    

    return current_user