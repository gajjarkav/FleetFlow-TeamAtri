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


def create_dispatcher(db: Session, email: str, password: str):
    user = User(
        email=email,
        password_hash=hash_password(password),
        role="dispatcher"
    )

    db.add(user)
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