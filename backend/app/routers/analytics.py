from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, List, Any
from ..services.analytics_engine import AnalyticsEngine
from ..dependencies import ROLES_DB
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/analytics",
    tags=["Career Analytics"],
    responses={404: {"description": "Not found"}},
)

# Global engine instance
analytics_engine = AnalyticsEngine([r.__dict__ for r in ROLES_DB])

@router.get("/overview")
async def get_analytics_overview():
    """Provides a summarized view of market trends and demand distribution."""
    return analytics_engine.get_overview()

@router.get("/districts")
async def get_district_analytics(state: Optional[str] = Query(None)):
    """Provides state-level geographic demand analytics."""
    return analytics_engine.get_district_stats(state)
