from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.db.base import Base,  engine, SessionLocal
from app.core.config import get_settings
from app.models.user import User
from app.core.security import hash_password
from app.api.auth import router as auth_router

settings = get_settings()

app = FastAPI(
    title="FleetFlow",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

def seed_manager():
    db: Session = SessionLocal()
    manager = db.query(User).filter(User.role == "manager").first()
    if not manager:
        manager = User(
            email=settings.MANAGER_EMAIL,
            password_hash=hash_password(settings.MANAGER_PASSWORD),
            role="manager"
        )

        db.add(manager)
        db.commit()
    db.close()

seed_manager()

app.include_router(auth_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(port=8000, host="0.0.0.0", reload=True)