"""
Unit tests for reminder system
Tests for reminder schedules and reminder instances (without Twilio integration)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, date, timedelta, time as dt_time

from main import app
from app.database.db import get_db
from app.auth.models import Base, User, RoleEnum
from app.medications.models import Medication, PatientMedication, MedicationFormEnum, MedicationStatusEnum
from app.reminders.models import Reminder, ReminderSchedule, ReminderStatusEnum
from app.auth.utils import hash_password


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override the database dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# Test data
admin_data = {
    "full_name": "Dr. Reminder Test",
    "email": "reminder.admin@test.com",
    "phone": "+1111111111",
    "password": "admin123",
    "role": "admin"
}

patient_data = {
    "full_name": "Patient Reminder Test",
    "email": "reminder.patient@test.com",
    "phone": "+2222222222",
    "password": "patient123",
    "role": "patient"
}

patient2_data = {
    "full_name": "Patient Two",
    "email": "patient2@test.com",
    "phone": "+3333333333",
    "password": "patient123",
    "role": "patient"
}


def get_admin_token():
    """Register and login as admin"""
    client.post("/auth/register", json=admin_data)
    response = client.post("/auth/login", data={
        "username": admin_data["email"],
        "password": admin_data["password"]
    })
    return response.json()["access_token"]


def get_patient_token():
    """Register and login as patient"""
    register_response = client.post("/auth/register", json=patient_data)
    patient_id = register_response.json()["id"]
    
    login_response = client.post("/auth/login", data={
        "username": patient_data["email"],
        "password": patient_data["password"]
    })
    access_token = login_response.json()["access_token"]
    return access_token, patient_id


def get_patient2_token():
    """Register and login as second patient"""
    client.post("/auth/register", json=patient2_data)
    response = client.post("/auth/login", data={
        "username": patient2_data["email"],
        "password": patient2_data["password"]
    })
    return response.json()["access_token"]


def create_test_medication(admin_token):
    """Create a test medication"""
    medication_data = {
        "name": "Aspirin",
        "form": "tablet",
        "default_dosage": "100mg",
        "side_effects": "May cause stomach upset",
        "warnings": "Do not take on empty stomach"
    }
    response = client.post(
        "/medications",
        json=medication_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return response.json()


def assign_medication_to_patient(admin_token, patient_id, medication_id):
    """Assign medication to patient"""
    assignment_data = {
        "medication_id": medication_id,
        "dosage": "100mg",
        "instructions": "Take with breakfast",
        "times_per_day": 2,
        "start_date": date.today().isoformat(),
        "end_date": (date.today() + timedelta(days=30)).isoformat()
    }
    response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json=assignment_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201, f"Assignment failed: {response.json()}"
    return response.json()


# ==================== REMINDER SCHEDULE TESTS ====================

def test_create_reminder_schedule():
    """Test creating a reminder schedule"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create reminder schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "twice_daily",
        "reminder_times": ["08:00", "20:00"],
        "advance_minutes": 15,
        "channel_whatsapp": True,
        "channel_sms": False,
        "channel_push": True,
        "channel_email": False,
        "auto_skip_if_taken": True,
        "escalate_if_missed": True,
        "escalate_delay_minutes": 30,
        "quiet_hours_enabled": False,
        "start_date": datetime.now().isoformat(),
        "end_date": None
    }
    
    response = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["patient_medication_id"] == assignment["id"]
    assert data["frequency"] == "twice_daily"
    assert data["reminder_times"] == ["08:00", "20:00"]
    assert data["advance_minutes"] == 15
    assert data["is_active"] == True


def test_create_duplicate_schedule_fails():
    """Test that creating duplicate schedule for same medication fails"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create first schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    response1 = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    assert response1.status_code == 201
    
    # Try to create duplicate
    response2 = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"].lower()


def test_get_reminder_schedules():
    """Test getting all reminder schedules for a patient"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign two medications
    medication1 = create_test_medication(admin_token)
    assignment1 = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication1["id"]
    )
    
    medication2_data = {
        "name": "Lisinopril",
        "form": "tablet",
        "default_dosage": "10mg",
        "side_effects": "Dizziness",
        "warnings": "Monitor blood pressure"
    }
    response = client.post(
        "/medications",
        json=medication2_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication2 = response.json()
    
    assignment2 = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication2["id"]
    )
    
    # Confirm both medications
    client.put(
        f"/medications/patient/{assignment1['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    client.put(
        f"/medications/patient/{assignment2['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create schedules for both
    schedule1_data = {
        "patient_medication_id": assignment1["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    schedule2_data = {
        "patient_medication_id": assignment2["id"],
        "frequency": "twice_daily",
        "reminder_times": ["08:00", "20:00"],
        "advance_minutes": 30,
        "start_date": datetime.now().isoformat()
    }
    
    client.post(
        "/reminders/schedules",
        json=schedule1_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    client.post(
        "/reminders/schedules",
        json=schedule2_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Get all schedules
    response = client.get(
        "/reminders/schedules",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    schedules = response.json()
    assert len(schedules) == 2
    assert schedules[0]["patient_medication_id"] in [assignment1["id"], assignment2["id"]]
    assert schedules[1]["patient_medication_id"] in [assignment1["id"], assignment2["id"]]


def test_get_reminder_schedule_by_medication():
    """Test getting reminder schedule for specific medication"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Get schedule by medication
    response = client.get(
        f"/reminders/schedules/medication/{assignment['id']}",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["patient_medication_id"] == assignment["id"]
    assert data["reminder_times"] == ["08:00"]


def test_update_reminder_schedule():
    """Test updating reminder schedule"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Update schedule
    update_data = {
        "reminder_times": ["09:00", "21:00"],
        "advance_minutes": 30,
        "channel_sms": True
    }
    
    response = client.put(
        f"/reminders/schedules/{schedule_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["reminder_times"] == ["09:00", "21:00"]
    assert data["advance_minutes"] == 30
    assert data["channel_sms"] == True


def test_toggle_reminder_schedule():
    """Test enabling/disabling reminder schedule"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Disable schedule
    response = client.post(
        f"/reminders/schedules/{schedule_id}/toggle?is_active=false",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["is_active"] == False
    
    # Enable schedule
    response = client.post(
        f"/reminders/schedules/{schedule_id}/toggle?is_active=true",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["is_active"] == True


def test_delete_reminder_schedule():
    """Test deleting reminder schedule"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Delete schedule
    response = client.delete(
        f"/reminders/schedules/{schedule_id}",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 204
    
    # Verify deletion
    response = client.get(
        f"/reminders/schedules/medication/{assignment['id']}",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 404


def test_patient_cannot_access_other_patient_schedule():
    """Test that patient cannot access another patient's reminder schedule"""
    admin_token = get_admin_token()
    patient1_token, patient1_id = get_patient_token()
    patient2_token = get_patient2_token()
    
    # Create and assign medication to patient 1
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient1_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient1_token}"}
    )
    
    # Create schedule as patient 1
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient1_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Try to update as patient 2
    response = client.put(
        f"/reminders/schedules/{schedule_id}",
        json={"advance_minutes": 30},
        headers={"Authorization": f"Bearer {patient2_token}"}
    )
    
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower() or "access denied" in response.json()["detail"].lower()


# ==================== REMINDER INSTANCE TESTS ====================

def test_generate_reminders():
    """Test generating reminder instances from schedule"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create and assign medication
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    # Confirm medication
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Create schedule
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "twice_daily",
        "reminder_times": ["08:00", "20:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Generate reminders for next 7 days
    response = client.post(
        f"/reminders/schedules/{schedule_id}/generate?days_ahead=7",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should generate 2 reminders per day for 7 days (but may skip past times)
    assert data["count"] > 0
    assert "reminders" in data


def test_get_reminders():
    """Test getting reminder instances"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create medication and schedule
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["08:00"],
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Generate reminders
    client.post(
        f"/reminders/schedules/{schedule_id}/generate?days_ahead=7",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Get reminders
    response = client.get(
        "/reminders/",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    reminders = response.json()
    assert len(reminders) > 0


def test_cancel_reminder():
    """Test cancelling a pending reminder"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Create medication and schedule
    medication = create_test_medication(admin_token)
    assignment = assign_medication_to_patient(
        admin_token, 
        patient_id, 
        medication["id"]
    )
    
    client.put(
        f"/medications/patient/{assignment['id']}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    schedule_data = {
        "patient_medication_id": assignment["id"],
        "frequency": "daily",
        "reminder_times": ["23:59"],  # Future time
        "advance_minutes": 15,
        "start_date": datetime.now().isoformat()
    }
    
    created = client.post(
        "/reminders/schedules",
        json=schedule_data,
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    schedule_id = created.json()["id"]
    
    # Generate reminders
    generate_response = client.post(
        f"/reminders/schedules/{schedule_id}/generate?days_ahead=7",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    if generate_response.json()["count"] > 0:
        # Get first reminder
        reminders = client.get(
            "/reminders/",
            headers={"Authorization": f"Bearer {patient_token}"}
        ).json()
        
        if len(reminders) > 0:
            reminder_id = reminders[0]["id"]
            
            # Cancel reminder
            response = client.post(
                f"/reminders/{reminder_id}/cancel",
                json={"reason": "Changed my mind"},
                headers={"Authorization": f"Bearer {patient_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "cancelled"


def test_get_reminder_stats():
    """Test getting reminder statistics"""
    admin_token = get_admin_token()
    patient_token, patient_id = get_patient_token()
    
    # Get stats (should work even with no reminders)
    response = client.get(
        "/reminders/stats/summary?days=30",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    stats = response.json()
    assert "total_scheduled" in stats
    assert "sent" in stats
    assert "delivered" in stats
    assert "delivery_rate" in stats
