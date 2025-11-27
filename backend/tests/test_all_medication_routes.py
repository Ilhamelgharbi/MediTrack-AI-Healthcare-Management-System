"""
Comprehensive test suite for all medication API routes
Tests every endpoint to ensure they work correctly
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import date

from main import app
from app.database.db import get_db
from app.auth.models import Base, User, RoleEnum
from app.medications.models import Medication, PatientMedication, MedicationFormEnum, MedicationStatusEnum


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
    "full_name": "Dr. Test Admin",
    "email": "admin@test.com",
    "phone": "+1111111111",
    "password": "admin123",
    "role": "admin"
}

patient_data = {
    "full_name": "Test Patient",
    "email": "patient@test.com",
    "phone": "+2222222222",
    "password": "patient123",
    "role": "patient"
}

patient2_data = {
    "full_name": "Test Patient Two",
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
    client.post("/auth/register", json=patient_data)
    response = client.post("/auth/login", data={
        "username": patient_data["email"],
        "password": patient_data["password"]
    })
    return response.json()["access_token"]


def get_patient2_token():
    """Register and login as second patient"""
    client.post("/auth/register", json=patient2_data)
    response = client.post("/auth/login", data={
        "username": patient2_data["email"],
        "password": patient2_data["password"]
    })
    return response.json()["access_token"]


# ==================== MEDICATION CATALOG ROUTES TESTS ====================

def test_create_medication_as_admin():
    """Test POST /medications/ - Admin creates medication"""
    token = get_admin_token()
    
    medication_data = {
        "name": "Aspirin",
        "form": "tablet",
        "default_dosage": "81mg",
        "side_effects": "Stomach irritation",
        "warnings": "Avoid with bleeding disorders"
    }
    
    response = client.post(
        "/medications/",
        json=medication_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Aspirin"
    assert data["form"] == "tablet"
    assert data["default_dosage"] == "81mg"
    assert "id" in data


def test_create_medication_as_patient_fails():
    """Test POST /medications/ - Patient cannot create medication"""
    token = get_patient_token()
    
    medication_data = {
        "name": "Aspirin",
        "form": "tablet",
        "default_dosage": "81mg"
    }
    
    response = client.post(
        "/medications/",
        json=medication_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 403


def test_get_all_medications():
    """Test GET /medications/ - Get all medications"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Create medications
    medications = [
        {"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        {"name": "Ibuprofen", "form": "tablet", "default_dosage": "200mg"},
        {"name": "Amoxicillin", "form": "capsule", "default_dosage": "500mg"}
    ]
    
    for med in medications:
        client.post(
            "/medications/",
            json=med,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    # Patient can view medications
    response = client.get(
        "/medications/",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


def test_get_all_medications_with_search():
    """Test GET /medications/?search=term - Search medications"""
    admin_token = get_admin_token()
    
    # Create medications
    medications = [
        {"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        {"name": "Aspirin Cardio", "form": "tablet", "default_dosage": "100mg"},
        {"name": "Ibuprofen", "form": "tablet", "default_dosage": "200mg"}
    ]
    
    for med in medications:
        client.post(
            "/medications/",
            json=med,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    # Search for "Aspirin"
    response = client.get(
        "/medications/?search=Aspirin",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all("Aspirin" in med["name"] for med in data)


def test_get_medication_by_id():
    """Test GET /medications/{id} - Get specific medication"""
    admin_token = get_admin_token()
    
    # Create medication
    create_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = create_response.json()["id"]
    
    # Get medication by ID
    response = client.get(
        f"/medications/{medication_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == medication_id
    assert data["name"] == "Aspirin"


def test_get_medication_by_id_not_found():
    """Test GET /medications/{id} - Non-existent medication"""
    admin_token = get_admin_token()
    
    response = client.get(
        "/medications/9999",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 404


def test_update_medication_as_admin():
    """Test PUT /medications/{id} - Admin updates medication"""
    admin_token = get_admin_token()
    
    # Create medication
    create_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = create_response.json()["id"]
    
    # Update medication
    update_response = client.put(
        f"/medications/{medication_id}",
        json={
            "name": "Aspirin Cardio",
            "default_dosage": "100mg",
            "side_effects": "Updated side effects"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["name"] == "Aspirin Cardio"
    assert data["default_dosage"] == "100mg"


def test_update_medication_as_patient_fails():
    """Test PUT /medications/{id} - Patient cannot update"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Create medication
    create_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = create_response.json()["id"]
    
    # Patient tries to update
    response = client.put(
        f"/medications/{medication_id}",
        json={"name": "Updated Name"},
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 403


def test_delete_medication_as_admin():
    """Test DELETE /medications/{id} - Admin deletes medication"""
    admin_token = get_admin_token()
    
    # Create medication
    create_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = create_response.json()["id"]
    
    # Delete medication
    delete_response = client.delete(
        f"/medications/{medication_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert delete_response.status_code == 204
    
    # Verify deleted
    get_response = client.get(
        f"/medications/{medication_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert get_response.status_code == 404


# ==================== PATIENT MEDICATION ROUTES TESTS ====================

def test_assign_medication_to_patient():
    """Test POST /medications/patients/{id}/medications - Assign medication"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create medication
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "81mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    # Assign to patient
    assign_response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Take once daily",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert assign_response.status_code == 201
    data = assign_response.json()
    assert data["patient_id"] == patient_id
    assert data["medication"]["id"] == medication_id
    assert data["status"] == "pending"
    assert data["dosage"] == "100mg"


def test_assign_medication_as_patient_fails():
    """Test POST /medications/patients/{id}/medications - Patient cannot assign"""
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": 1,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 403


def test_get_patient_medications():
    """Test GET /medications/patients/{id}/medications - Get patient's medications"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create and assign medications
    for name in ["Aspirin", "Ibuprofen"]:
        med_response = client.post(
            "/medications/",
            json={"name": name, "form": "tablet", "default_dosage": "100mg"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        medication_id = med_response.json()["id"]
        
        client.post(
            f"/medications/patients/{patient_id}/medications",
            json={
                "medication_id": medication_id,
                "dosage": "100mg",
                "instructions": "Test",
                "times_per_day": 1,
                "start_date": str(date.today())
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    # Patient gets their medications
    response = client.get(
        f"/medications/patients/{patient_id}/medications",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_patient_medications_with_status_filter():
    """Test GET /medications/patients/{id}/medications?status_filter=active"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create and assign medication
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "100mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    assign_response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assignment_id = assign_response.json()["id"]
    
    # Confirm medication
    client.patch(
        f"/medications/patients/{patient_id}/medications/{assignment_id}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    # Get active medications
    response = client.get(
        f"/medications/patients/{patient_id}/medications?status_filter=active",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "active"


def test_patient_cannot_view_other_patient_medications():
    """Test GET /medications/patients/{id}/medications - Authorization check"""
    admin_token = get_admin_token()
    patient1_token = get_patient_token()
    patient2_token = get_patient2_token()
    
    # Get patient1 ID
    patient1_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient1_token}"}
    )
    patient1_id = patient1_response.json()["id"]
    
    # Patient2 tries to view patient1's medications
    response = client.get(
        f"/medications/patients/{patient1_id}/medications",
        headers={"Authorization": f"Bearer {patient2_token}"}
    )
    
    assert response.status_code == 403


def test_confirm_medication():
    """Test PATCH /medications/patients/{id}/medications/{assignment_id}/confirm"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create and assign medication
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "100mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    assign_response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assignment_id = assign_response.json()["id"]
    
    # Confirm medication
    confirm_response = client.patch(
        f"/medications/patients/{patient_id}/medications/{assignment_id}/confirm",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert confirm_response.status_code == 200
    data = confirm_response.json()
    assert data["status"] == "active"
    assert data["confirmed_by_patient"] == True


def test_patient_cannot_confirm_other_patient_medication():
    """Test PATCH /medications/patients/{id}/medications/{assignment_id}/confirm - Auth check"""
    admin_token = get_admin_token()
    patient1_token = get_patient_token()
    patient2_token = get_patient2_token()
    
    # Get patient1 ID
    patient1_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient1_token}"}
    )
    patient1_id = patient1_response.json()["id"]
    
    # Create and assign medication to patient1
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "100mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    assign_response = client.post(
        f"/medications/patients/{patient1_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assignment_id = assign_response.json()["id"]
    
    # Patient2 tries to confirm patient1's medication
    response = client.patch(
        f"/medications/patients/{patient1_id}/medications/{assignment_id}/confirm",
        headers={"Authorization": f"Bearer {patient2_token}"}
    )
    
    assert response.status_code == 403


def test_update_patient_medication():
    """Test PUT /medications/patients/{id}/medications/{assignment_id}"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create and assign medication
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "100mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    assign_response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assignment_id = assign_response.json()["id"]
    
    # Update medication
    update_response = client.put(
        f"/medications/patients/{patient_id}/medications/{assignment_id}",
        json={
            "dosage": "200mg",
            "instructions": "Updated instructions",
            "times_per_day": 2
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["dosage"] == "200mg"
    assert data["instructions"] == "Updated instructions"
    assert data["times_per_day"] == 2


def test_stop_medication():
    """Test PATCH /medications/patients/{id}/medications/{assignment_id}/stop"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create and assign medication
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "100mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    assign_response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assignment_id = assign_response.json()["id"]
    
    # Stop medication
    stop_response = client.patch(
        f"/medications/patients/{patient_id}/medications/{assignment_id}/stop",
        json={"reason": "Treatment completed"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert stop_response.status_code == 200
    data = stop_response.json()
    assert data["reason"] == "Treatment completed"
    assert "stopped_at" in data


def test_get_inactive_medications():
    """Test GET /medications/patients/{id}/medications/inactive"""
    admin_token = get_admin_token()
    patient_token = get_patient_token()
    
    # Get patient ID
    patient_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    patient_id = patient_response.json()["id"]
    
    # Create and assign medication
    med_response = client.post(
        "/medications/",
        json={"name": "Aspirin", "form": "tablet", "default_dosage": "100mg"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    medication_id = med_response.json()["id"]
    
    assign_response = client.post(
        f"/medications/patients/{patient_id}/medications",
        json={
            "medication_id": medication_id,
            "dosage": "100mg",
            "instructions": "Test",
            "times_per_day": 1,
            "start_date": str(date.today())
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assignment_id = assign_response.json()["id"]
    
    # Stop medication
    client.patch(
        f"/medications/patients/{patient_id}/medications/{assignment_id}/stop",
        json={"reason": "Treatment completed"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # Get inactive medications
    response = client.get(
        f"/medications/patients/{patient_id}/medications/inactive",
        headers={"Authorization": f"Bearer {patient_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["reason"] == "Treatment completed"


def test_pagination_on_get_all_medications():
    """Test GET /medications/?skip=1&limit=2 - Pagination"""
    admin_token = get_admin_token()
    
    # Create 5 medications
    for i in range(5):
        client.post(
            "/medications/",
            json={"name": f"Med{i}", "form": "tablet", "default_dosage": "100mg"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    # Get page 2 with 2 items
    response = client.get(
        "/medications/?skip=1&limit=2",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
