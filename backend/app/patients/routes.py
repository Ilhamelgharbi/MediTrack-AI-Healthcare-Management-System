from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.auth.services import get_current_user
from app.auth.models import User, RoleEnum
from app.patients.schemas import PatientResponse, PatientUpdate, PatientAdminUpdate, PatientCreate
from app.patients.services import PatientService

router = APIRouter(prefix="/patients", tags=["Patients"])


# Get all patients (Admin only)
@router.get("/", response_model=list[PatientResponse])
def get_all_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all patients (Admin only)"""
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all patients"
        )
    
    patients = PatientService.get_all_patients(db, admin_id=current_user.id)
    return patients


# Get patient profile by ID (Admin only)
@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get patient by ID (Admin only)"""
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view patient details"
        )
    
    patient = PatientService.get_patient_by_id(db, patient_id)
    return patient


# Get own patient profile
@router.get("/me/profile", response_model=PatientResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's patient profile"""
    if current_user.role != RoleEnum.patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access this endpoint"
        )
    
    patient = PatientService.get_patient_by_user_id(db, current_user.id)
    return patient


# Update own patient profile
@router.put("/me/profile", response_model=PatientResponse)
def update_my_profile(
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's patient profile"""
    if current_user.role != RoleEnum.patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can update their profile"
        )
    
    patient = PatientService.get_patient_by_user_id(db, current_user.id)
    updated_patient = PatientService.update_patient(db, patient.id, patient_data)
    return updated_patient


# Admin updates patient
@router.put("/{patient_id}/admin-update", response_model=PatientResponse)
def admin_update_patient(
    patient_id: int,
    admin_data: PatientAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin updates patient medical information"""
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update patient medical information"
        )
    
    updated_patient = PatientService.update_patient_by_admin(db, patient_id, admin_data)
    return updated_patient

