"""
Adherence analytics routes
Provides analytics for medication adherence tracking
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta

from app.database.db import get_db
from app.analytics.schemas.adherence import (
    AdherenceOverview,
    AdherenceTrend,
    PatientAdherenceSummary,
    MedicationAdherenceDetail,
    AdherenceStats
)
from app.analytics.services.adherence import AdherenceAnalyticsService
from app.auth.services import require_admin
from app.auth.models import User

router = APIRouter()


@router.get("/overview", response_model=AdherenceOverview)
async def get_adherence_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis")
):
    """Get overall adherence statistics"""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    return AdherenceAnalyticsService.get_adherence_overview(db, start_date, end_date)


@router.get("/trends", response_model=List[AdherenceTrend])
async def get_adherence_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    patient_id: Optional[int] = Query(None, description="Filter by specific patient")
):
    """Get adherence trends over time"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    return AdherenceAnalyticsService.get_adherence_trends(db, start_date, end_date, patient_id)


@router.get("/patients", response_model=List[PatientAdherenceSummary])
async def get_patient_adherence_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    limit: int = Query(50, description="Number of patients to return", ge=1, le=1000),
    min_adherence: Optional[float] = Query(None, description="Minimum adherence threshold (0-100)", ge=0, le=100)
):
    """Get adherence summary for all patients"""
    return AdherenceAnalyticsService.get_patient_adherence_summary(db, limit, min_adherence)


@router.get("/medications", response_model=List[MedicationAdherenceDetail])
async def get_medication_adherence_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    medication_id: Optional[int] = Query(None, description="Filter by specific medication"),
    limit: int = Query(50, description="Number of medications to return", ge=1, le=1000)
):
    """Get adherence details for medications"""
    return AdherenceAnalyticsService.get_medication_adherence_details(db, medication_id, limit)


@router.get("/stats", response_model=AdherenceStats)
async def get_adherence_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    patient_id: Optional[int] = Query(None, description="Filter by specific patient"),
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365)
):
    """Get detailed adherence statistics"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    return AdherenceAnalyticsService.get_adherence_stats(db, start_date, end_date, patient_id)