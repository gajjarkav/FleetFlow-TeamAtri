from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique= True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


    name = Column(String, nullable=True)
    mobile_number = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    license_expiry = Column(DateTime, nullable=True)

    create_at = Column(DateTime, default=datetime.utcnow)
    duty_status = Column(String, default="available")