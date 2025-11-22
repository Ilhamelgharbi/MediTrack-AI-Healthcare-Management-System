#!/usr/bin/env python3
"""
MediTrack AI - Database Setup Script
Creates admin user and sample patient data
"""

import os
import sys
from datetime import date, datetime
from sqlalchemy.orm import Session
from app.database.db import engine, get_db, Base
from app.auth.models import User, RoleEnum
from app.patients.models import Patient, GenderEnum, StatusEnum
from app.auth.utils import hash_password

def delete_database():
    """Delete the existing database file"""
    db_path = "meditrack.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"✅ Deleted existing database: {db_path}")
    else:
        print("ℹ️  No existing database found")

def create_admin_user(db: Session):
    """Create the admin user: John Doe"""
    admin_email = "johndoe@gmail.com"
    admin_password = "xiSdbKciYAG9k2M"

    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"⚠️  Admin user {admin_email} already exists")
        return existing_admin

    # Create admin user
    admin = User(
        full_name="John Doe",
        email=admin_email,
        phone="+1-555-0123",
        password_hash=hash_password(admin_password),
        role=RoleEnum.admin
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    print("✅ Created admin user:")
    print(f"   Name: {admin.full_name}")
    print(f"   Email: {admin.email}")
    print(f"   Password: {admin_password}")
    print(f"   Role: {admin.role.value}")

    return admin

def create_sample_patients(db: Session, admin_id: int):
    """Create 10 sample patient users with realistic data"""

    patient_data = [
        {
            "full_name": "Sarah Johnson",
            "email": "sarah.johnson@gmail.com",
            "phone": "+1-555-1001",
            "date_of_birth": date(1985, 3, 15),
            "gender": GenderEnum.female,
            "blood_type": "A+",
            "height": 165.0,
            "weight": 65.0,
            "status": StatusEnum.stable,
            "medical_history": "Hypertension diagnosed in 2020. Regular checkups.",
            "allergies": "Penicillin, Shellfish",
            "current_medications": "Lisinopril 10mg daily, Aspirin 81mg daily"
        },
        {
            "full_name": "Michael Chen",
            "email": "michael.chen@gmail.com",
            "phone": "+1-555-1002",
            "date_of_birth": date(1992, 7, 22),
            "gender": GenderEnum.male,
            "blood_type": "O-",
            "height": 178.0,
            "weight": 75.0,
            "status": StatusEnum.stable,
            "medical_history": "Asthma since childhood. Well controlled with medication.",
            "allergies": "None known",
            "current_medications": "Albuterol inhaler as needed, Fluticasone 100mcg daily"
        },
        {
            "full_name": "Emily Rodriguez",
            "email": "emily.rodriguez@gmail.com",
            "phone": "+1-555-1003",
            "date_of_birth": date(1978, 11, 8),
            "gender": GenderEnum.female,
            "blood_type": "B+",
            "height": 162.0,
            "weight": 58.0,
            "status": StatusEnum.under_observation,
            "medical_history": "Type 2 Diabetes diagnosed in 2019. Managing with diet and medication.",
            "allergies": "Sulfa drugs",
            "current_medications": "Metformin 500mg twice daily, Vitamin D3 2000 IU daily"
        },
        {
            "full_name": "David Thompson",
            "email": "david.thompson@gmail.com",
            "phone": "+1-555-1004",
            "date_of_birth": date(1965, 5, 30),
            "gender": GenderEnum.male,
            "blood_type": "AB+",
            "height": 175.0,
            "weight": 82.0,
            "status": StatusEnum.critical,
            "medical_history": "Heart disease. Recent bypass surgery in 2024.",
            "allergies": "Iodine contrast, Latex",
            "current_medications": "Warfarin 5mg daily, Atorvastatin 40mg daily, Clopidogrel 75mg daily, Lisinopril 20mg daily"
        },
        {
            "full_name": "Lisa Park",
            "email": "lisa.park@gmail.com",
            "phone": "+1-555-1005",
            "date_of_birth": date(1990, 1, 12),
            "gender": GenderEnum.female,
            "blood_type": "A-",
            "height": 168.0,
            "weight": 62.0,
            "status": StatusEnum.stable,
            "medical_history": "Migraine headaches. Occasional episodes.",
            "allergies": "Codeine, NSAIDs",
            "current_medications": "Topiramate 50mg daily, Sumatriptan as needed"
        },
        {
            "full_name": "Robert Wilson",
            "email": "robert.wilson@gmail.com",
            "phone": "+1-555-1006",
            "date_of_birth": date(1982, 9, 18),
            "gender": GenderEnum.male,
            "blood_type": "O+",
            "height": 183.0,
            "weight": 88.0,
            "status": StatusEnum.stable,
            "medical_history": "High cholesterol. Family history of heart disease.",
            "allergies": "None",
            "current_medications": "Rosuvastatin 20mg daily, Omega-3 fish oil 1000mg daily"
        },
        {
            "full_name": "Maria Garcia",
            "email": "maria.garcia@gmail.com",
            "phone": "+1-555-1007",
            "date_of_birth": date(1975, 12, 3),
            "gender": GenderEnum.female,
            "blood_type": "B-",
            "height": 158.0,
            "weight": 55.0,
            "status": StatusEnum.under_observation,
            "medical_history": "Thyroid issues. Hypothyroidism diagnosed in 2018.",
            "allergies": "Amoxicillin",
            "current_medications": "Levothyroxine 75mcg daily, Calcium 500mg + Vitamin D 400 IU daily"
        },
        {
            "full_name": "James Brown",
            "email": "james.brown@gmail.com",
            "phone": "+1-555-1008",
            "date_of_birth": date(1995, 4, 25),
            "gender": GenderEnum.male,
            "blood_type": "A+",
            "height": 172.0,
            "weight": 70.0,
            "status": StatusEnum.stable,
            "medical_history": "Seasonal allergies. No major health issues.",
            "allergies": "Pollen, Dust mites",
            "current_medications": "Loratadine 10mg daily (seasonal), Multivitamin daily"
        },
        {
            "full_name": "Jennifer Lee",
            "email": "jennifer.lee@gmail.com",
            "phone": "+1-555-1009",
            "date_of_birth": date(1988, 6, 14),
            "gender": GenderEnum.female,
            "blood_type": "O+",
            "height": 170.0,
            "weight": 68.0,
            "status": StatusEnum.stable,
            "medical_history": "Pregnancy in 2023. Delivered healthy baby. Postpartum checkup normal.",
            "allergies": "None",
            "current_medications": "Prenatal vitamins, Iron supplement 65mg daily"
        },
        {
            "full_name": "Christopher Davis",
            "email": "christopher.davis@gmail.com",
            "phone": "+1-555-1010",
            "date_of_birth": date(1970, 8, 9),
            "gender": GenderEnum.male,
            "blood_type": "AB-",
            "height": 180.0,
            "weight": 85.0,
            "status": StatusEnum.critical,
            "medical_history": "Chronic kidney disease. On dialysis 3x weekly. Kidney transplant candidate.",
            "allergies": "Morphine, Contrast dye",
            "current_medications": "Epoetin alfa 4000 units 3x weekly, Phosphate binders, Vitamin D analogs, Blood pressure medications"
        }
    ]

    created_patients = []

    for i, data in enumerate(patient_data, 1):
        # Check if patient user already exists
        existing_user = db.query(User).filter(User.email == data["email"]).first()
        if existing_user:
            print(f"⚠️  Patient user {data['email']} already exists")
            continue

        # Create patient user
        patient_user = User(
            full_name=data["full_name"],
            email=data["email"],
            phone=data["phone"],
            password_hash=hash_password("patient123"),  # Default password for all patients
            role=RoleEnum.patient
        )

        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)

        # Create patient profile
        patient_profile = Patient(
            user_id=patient_user.id,
            date_of_birth=data["date_of_birth"],
            gender=data["gender"],
            blood_type=data["blood_type"],
            height=data["height"],
            weight=data["weight"],
            status=data["status"],
            medical_history=data["medical_history"],
            allergies=data["allergies"],
            current_medications=data["current_medications"],
            assigned_admin_id=admin_id
        )

        db.add(patient_profile)
        db.commit()

        created_patients.append({
            "user": patient_user,
            "profile": patient_profile
        })

        print(f"✅ Created patient {i}/10: {data['full_name']}")
        print(f"   Email: {data['email']}")
        print(f"   Password: patient123")
        print(f"   Status: {data['status'].value}")
        print()

    return created_patients

def main():
    """Main function to set up the database"""
    print("🏥 MediTrack AI - Database Setup")
    print("=" * 40)

    # Delete existing database
    delete_database()

    # Create tables
    print("📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    # Get database session
    db = next(get_db())

    try:
        # Create admin user
        print("\n👨‍⚕️ Creating admin user...")
        admin = create_admin_user(db)

        # Create sample patients
        print("\n👥 Creating sample patients...")
        patients = create_sample_patients(db, admin.id)

        print("\n🎉 Database setup complete!")
        print(f"   Admin user: {admin.full_name} ({admin.email})")
        print(f"   Patient users created: {len(patients)}")
        print("\n🔐 Default passwords:")
        print("   Admin: xiSdbKciYAG9k2M")
        print("   Patients: patient123")
        print("\n🚀 Ready to start the server!")

    except Exception as e:
        print(f"❌ Error during setup: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()