from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    plate_number = Column(String, unique=True, index=True, nullable=False)
    region = Column(String, nullable=False)
    capacity_kg = Column(Integer, nullable=False)
    odometer = Column(Integer, default=0)
    status = Column(String, default="available")
    created_at = Column(DateTime, default=datetime.utcnow)