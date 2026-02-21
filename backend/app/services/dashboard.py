from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.vehicle import Vehicle
from app.models.user import User
from app.models.trip import Trip
from app.models.maintenance import MaintenanceRequest


def get_dashboard_kpis(db: Session):

    total_vehicles = db.query(Vehicle).count()
    active_fleet = db.query(Vehicle).filter(Vehicle.status == "on_trip").count()
    in_maintenance = db.query(Vehicle).filter(Vehicle.status == "in_shop").count()
    available_fleet = db.query(Vehicle).filter(Vehicle.status == "available").count()

    utilization = (active_fleet / total_vehicles * 100) if total_vehicles else 0


    total_drivers = db.query(User).filter(User.role == "dispatcher").count()
    available_drivers = db.query(User).filter(
        User.role == "dispatcher",
        User.duty_status == "available"
    ).count()


    total_trips = db.query(Trip).count()
    trips_in_progress = db.query(Trip).filter(Trip.status == "in_progress").count()
    completed_trips = db.query(Trip).filter(Trip.status == "completed").count()

    total_revenue = db.query(func.sum(Trip.payment_amount)).scalar() or 0
    avg_revenue_per_trip = total_revenue / completed_trips if completed_trips else 0

    avg_trip_distance = db.query(func.avg(Trip.total_km)).scalar() or 0


    pending_maintenance = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.status == "pending"
    ).count()

    approved_maintenance = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.status == "approved"
    ).count()

    maintenance_cost = db.query(
        func.sum(MaintenanceRequest.estimated_cost)
    ).filter(MaintenanceRequest.status == "completed").scalar() or 0

    profit = total_revenue - maintenance_cost


    top_drivers = (
        db.query(Trip.dispatcher_id, func.count(Trip.id).label("trip_count"))
        .filter(Trip.status == "completed")
        .group_by(Trip.dispatcher_id)
        .order_by(desc("trip_count"))
        .limit(5)
        .all()
    )

    top_vehicles = (
        db.query(Trip.vehicle_id, func.count(Trip.id).label("trip_count"))
        .filter(Trip.status == "completed")
        .group_by(Trip.vehicle_id)
        .order_by(desc("trip_count"))
        .limit(5)
        .all()
    )

    most_common_maintenance = (
        db.query(
            MaintenanceRequest.maintenance_type,
            func.count(MaintenanceRequest.id).label("count")
        )
        .group_by(MaintenanceRequest.maintenance_type)
        .order_by(desc("count"))
        .first()
    )

    return {
        "fleet": {
            "total": total_vehicles,
            "active": active_fleet,
            "available": available_fleet,
            "in_maintenance": in_maintenance,
            "utilization_percent": round(utilization, 2),
        },
        "drivers": {
            "total": total_drivers,
            "available": available_drivers,
            "unavailable": total_drivers - available_drivers,
        },
        "trips": {
            "total": total_trips,
            "in_progress": trips_in_progress,
            "completed": completed_trips,
            "revenue": total_revenue,
            "avg_revenue_per_trip": round(avg_revenue_per_trip, 2),
            "avg_distance_km": round(avg_trip_distance, 2),
        },
        "financial": {
            "maintenance_cost": maintenance_cost,
            "profit": profit,
        },
        "leaderboards": {
            "top_drivers": [
                {"dispatcher_id": d.dispatcher_id, "trips": d.trip_count}
                for d in top_drivers
            ],
            "top_vehicles": [
                {"vehicle_id": v.vehicle_id, "trips": v.trip_count}
                for v in top_vehicles
            ],
        },
        "maintenance_insights": {
            "pending": pending_maintenance,
            "approved": approved_maintenance,
            "most_common_type": most_common_maintenance.maintenance_type
            if most_common_maintenance else None,
        }
    }