from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.services.dashboard import get_dashboard_kpis
from app.utils.dependencies import manager_required

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def dashboard_kpis(
    db: Session = Depends(get_db),
    _: str = Depends(manager_required)
):
    return get_dashboard_kpis(db)