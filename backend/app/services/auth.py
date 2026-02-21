from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password

def authenticate_user(db: Session, email:str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_dispatcher(db: Session, data):
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="dispatcher",
        mobile_number=data.mobile_number,
        license_number=data.license_number,
        license_expiry=data.license_expiry,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_dispatcher_status(db: Session, user: Session, status: str):
    user.duty_status = status
    db.commit()
    db.refresh(user)
    return user

def get_dispatcher(db: Session):
    return db.query(User).filter(User.role == "dispatcher").all()

def delete_dispatcher(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id, User.role == "dispatcher").first()
    if user:
        db.delete(user)
        db.commit()
    return user