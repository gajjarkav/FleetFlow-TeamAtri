from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Float
from datetime import datetime
from app.db.base import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    dispatcher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    total_km = Column(Float, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    payment_amount = Column(Float, nullable=False)

    status = Column(String, default="assigned")
    created_at = Column(DateTime, default=datetime.utcnow)

    