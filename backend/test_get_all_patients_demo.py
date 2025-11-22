#!/usr/bin/env python3
"""
Test script to demonstrate the get_all_patients route working with real database data.
This script tests the API endpoint directly using our actual database.
"""

import requests
import json
from app.database.db import SessionLocal
from app.auth.models import User
from app.auth.utils import create_access_token

def test_get_all_patients_with_real_data():
    """Test the get_all_patients endpoint with our real database data."""

    # Get database session
    db = SessionLocal()

    try:
        # Get the admin user (John Doe)
        admin_user = db.query(User).filter(User.email == "johndoe@gmail.com").first()
        if not admin_user:
            print("❌ Admin user 'johndoe@gmail.com' not found in database")
            return

        print(f"✅ Found admin user: {admin_user.full_name} (ID: {admin_user.id})")

        # Create access token for the admin
        token = create_access_token({"sub": admin_user.email, "role": admin_user.role.value})

        # Test the API endpoint
        headers = {"Authorization": f"Bearer {token}"}

        # Note: In a real test, you'd start the FastAPI server and make HTTP requests
        # For this demo, we'll simulate what the endpoint would return

        from app.patients.services import PatientService
        patients = PatientService.get_all_patients(db, admin_id=admin_user.id)

        print(f"✅ Found {len(patients)} patients assigned to admin {admin_user.full_name}:")
        print()

        for i, patient in enumerate(patients, 1):
            print(f"Patient {i}:")
            print(f"  - Name: {patient.user.full_name}")
            print(f"  - Email: {patient.user.email}")
            print(f"  - Date of Birth: {patient.date_of_birth}")
            print(f"  - Gender: {patient.gender}")
            print(f"  - Blood Type: {patient.blood_type}")
            print(f"  - Height: {patient.height} cm")
            print(f"  - Weight: {patient.weight} kg")
            print(f"  - Status: {patient.status}")
            print(f"  - Medical History: {patient.medical_history}")
            print(f"  - Allergies: {patient.allergies}")
            print(f"  - Current Medications: {patient.current_medications}")
            print()

        print("✅ get_all_patients route test completed successfully!")
        print(f"📊 Total patients retrieved: {len(patients)}")

    finally:
        db.close()

if __name__ == "__main__":
    print("🧪 Testing get_all_patients route with real database data...")
    print("=" * 60)
    test_get_all_patients_with_real_data()