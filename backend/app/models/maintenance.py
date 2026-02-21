from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from datetime import datetime
from app.db.base import Base


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)

    dispatcher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)

    maintenance_type = Column(String, nullable=False)
    description = Column(String(400), nullable=False)
    date = Column(DateTime, nullable=False)

    estimated_cost = Column(Float, nullable=False)
    workshop = Column(String, nullable=True)

    status = Column(String, default="pending")  
    created_at = Column(DateTime, default=datetime.utcnow)