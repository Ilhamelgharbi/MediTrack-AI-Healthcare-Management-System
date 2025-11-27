"""
Populate medications catalog and assign to patients with test data
"""
from datetime import datetime, timedelta, time
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.medications.models import Medication, PatientMedication, MedicationStatusEnum
from app.adherence.models import MedicationLog  # Import to resolve circular dependencies
from app.reminders.models import Reminder  # Import to resolve relationship
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Common medications database
MEDICATIONS_CATALOG = [
    {
        "name": "Lisinopril",
        "form": "tablet",
        "default_dosage": "10mg",
        "side_effects": "Dizziness, dry cough, headache",
        "warnings": "Monitor blood pressure regularly. Avoid potassium supplements."
    },
    {
        "name": "Metformin",
        "form": "tablet",
        "default_dosage": "500mg",
        "side_effects": "Nausea, diarrhea, stomach upset",
        "warnings": "Take with food. Monitor kidney function."
    },
    {
        "name": "Atorvastatin",
        "form": "tablet",
        "default_dosage": "20mg",
        "side_effects": "Muscle pain, headache, nausea",
        "warnings": "Avoid grapefruit juice. Take at bedtime."
    },
    {
        "name": "Amlodipine",
        "form": "tablet",
        "default_dosage": "5mg",
        "side_effects": "Swelling of ankles, dizziness, flushing",
        "warnings": "May cause drowsiness. Rise slowly from sitting position."
    },
    {
        "name": "Levothyroxine",
        "form": "tablet",
        "default_dosage": "100mcg",
        "side_effects": "Weight changes, anxiety, tremors",
        "warnings": "Take on empty stomach, 30 minutes before breakfast."
    },
    {
        "name": "Omeprazole",
        "form": "capsule",
        "default_dosage": "20mg",
        "side_effects": "Headache, nausea, diarrhea",
        "warnings": "Take before meals. Long-term use may affect vitamin B12 absorption."
    },
    {
        "name": "Sertraline",
        "form": "tablet",
        "default_dosage": "50mg",
        "side_effects": "Nausea, drowsiness, dry mouth",
        "warnings": "May take 2-4 weeks for full effect. Do not stop abruptly."
    },
    {
        "name": "Gabapentin",
        "form": "capsule",
        "default_dosage": "300mg",
        "side_effects": "Drowsiness, dizziness, fatigue",
        "warnings": "May cause drowsiness. Do not drive until you know how it affects you."
    },
    {
        "name": "Losartan",
        "form": "tablet",
        "default_dosage": "50mg",
        "side_effects": "Dizziness, fatigue, cold-like symptoms",
        "warnings": "Monitor blood pressure. Avoid potassium supplements."
    },
    {
        "name": "Pantoprazole",
        "form": "tablet",
        "default_dosage": "40mg",
        "side_effects": "Headache, nausea, stomach pain",
        "warnings": "Take 30 minutes before a meal."
    },
    {
        "name": "Albuterol",
        "form": "inhaler",
        "default_dosage": "90mcg",
        "side_effects": "Nervousness, shakiness, rapid heartbeat",
        "warnings": "Use as needed for breathing problems. Rinse mouth after use."
    },
    {
        "name": "Aspirin",
        "form": "tablet",
        "default_dosage": "81mg",
        "side_effects": "Stomach upset, heartburn",
        "warnings": "Take with food. May increase bleeding risk."
    },
]

def populate_database():
    """Create medications and assign them to patients"""
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("🔧 POPULATING DATABASE")
        print("="*60)
        
        # 1. Create medications catalog
        print("\n💊 Creating medications catalog...")
        medications_created = []
        
        for med_data in MEDICATIONS_CATALOG:
            # Check if medication already exists
            existing_med = db.query(Medication).filter(Medication.name == med_data["name"]).first()
            
            if existing_med:
                print(f"  ✓ {med_data['name']} already exists")
                medications_created.append(existing_med)
            else:
                med = Medication(
                    name=med_data["name"],
                    form=med_data["form"],
                    default_dosage=med_data["default_dosage"],
                    side_effects=med_data["side_effects"],
                    warnings=med_data["warnings"],
                    created_by=1  # Admin user ID
                )
                db.add(med)
                db.flush()  # Get ID without committing
                medications_created.append(med)
                print(f"  + Created {med_data['name']}")
        
        db.commit()
        print(f"\n✅ Medications catalog: {len(medications_created)} items")
        
        # 2. Assign medications to patients
        print("\n💉 Assigning medications to patients...")
        
        # Assignment plan: Give each patient 2-4 medications
        patient_assignments = [
            # Patient ID 1 (Sarah Johnson) - Hypertension & Diabetes
            {'patient_id': 1, 'meds': [
                {'name': 'Lisinopril', 'dosage': '10mg', 'times_per_day': 1, 'instructions': 'Take once daily in the morning'},
                {'name': 'Metformin', 'dosage': '500mg', 'times_per_day': 2, 'instructions': 'Take with breakfast and dinner'},
                {'name': 'Aspirin', 'dosage': '81mg', 'times_per_day': 1, 'instructions': 'Take once daily with food'},
            ]},
            # Patient ID 2 (Michael Chen) - High Cholesterol
            {'patient_id': 2, 'meds': [
                {'name': 'Atorvastatin', 'dosage': '20mg', 'times_per_day': 1, 'instructions': 'Take once daily at bedtime'},
                {'name': 'Omeprazole', 'dosage': '20mg', 'times_per_day': 1, 'instructions': 'Take once daily before breakfast'},
            ]},
            # Patient ID 3 (Emily Rodriguez) - Thyroid
            {'patient_id': 3, 'meds': [
                {'name': 'Levothyroxine', 'dosage': '100mcg', 'times_per_day': 1, 'instructions': 'Take once daily on empty stomach, 30 minutes before breakfast'},
            ]},
            # Patient ID 4 (David Thompson) - Hypertension
            {'patient_id': 4, 'meds': [
                {'name': 'Amlodipine', 'dosage': '5mg', 'times_per_day': 1, 'instructions': 'Take once daily in the morning'},
                {'name': 'Losartan', 'dosage': '50mg', 'times_per_day': 1, 'instructions': 'Take once daily with or without food'},
            ]},
            # Patient ID 5 (Lisa Park) - Depression
            {'patient_id': 5, 'meds': [
                {'name': 'Sertraline', 'dosage': '50mg', 'times_per_day': 1, 'instructions': 'Take once daily in the morning'},
                {'name': 'Gabapentin', 'dosage': '300mg', 'times_per_day': 3, 'instructions': 'Take three times daily'},
            ]},
            # Patient ID 6 (Robert Wilson) - GERD
            {'patient_id': 6, 'meds': [
                {'name': 'Pantoprazole', 'dosage': '40mg', 'times_per_day': 1, 'instructions': 'Take once daily, 30 minutes before breakfast'},
            ]},
            # Patient ID 7 (Maria Garcia) - Asthma
            {'patient_id': 7, 'meds': [
                {'name': 'Albuterol', 'dosage': '2 puffs', 'times_per_day': 4, 'instructions': 'Use as needed for breathing problems, up to 4 times daily'},
            ]},
        ]
        
        assignments_created = 0
        
        for assignment in patient_assignments:
            patient_id = assignment['patient_id']
            
            for med_info in assignment['meds']:
                # Find medication
                med = next((m for m in medications_created if m.name == med_info['name']), None)
                if not med:
                    print(f"  ⚠️  Medication {med_info['name']} not found")
                    continue
                
                # Check if already assigned
                existing = db.query(PatientMedication).filter(
                    PatientMedication.patient_id == patient_id,
                    PatientMedication.medication_id == med.id
                ).first()
                
                if existing:
                    print(f"  ✓ Patient {patient_id} already has {med_info['name']}")
                    continue
                
                # Create patient medication
                start_date = datetime.now() - timedelta(days=14)  # Started 2 weeks ago
                
                patient_med = PatientMedication(
                    patient_id=patient_id,
                    medication_id=med.id,
                    dosage=med_info['dosage'],
                    instructions=med_info['instructions'],
                    times_per_day=med_info['times_per_day'],
                    start_date=start_date,
                    status=MedicationStatusEnum.active,  # Active status
                    confirmed_by_patient=True,
                    assigned_by_doctor=1  # Admin user ID
                )
                db.add(patient_med)
                assignments_created += 1
                print(f"  + Assigned {med_info['name']} to Patient {patient_id}")
        
        db.commit()
        print(f"\n✅ Created {assignments_created} patient medication assignments")
        
        print("\n" + "="*60)
        print("✅ DATABASE POPULATION COMPLETE!")
        print("="*60)
        print("\n📊 Summary:")
        print(f"  • Medications in catalog: {len(medications_created)}")
        print(f"  • Patient assignments: {assignments_created}")
        print("\nNext steps:")
        print("  • Run check_and_populate_db.py to create adherence and reminder data")
        print("  • Or use the frontend to view medications at http://localhost:3000")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 MediTrack Database Population Script")
    print("This will create:")
    print("  • Medications catalog (12 common medications)")
    print("  • Patient medication assignments (7 patients)")
    print("\nType 'yes' to continue: ", end='')
    
    response = input().strip().lower()
    if response == 'yes':
        populate_database()
    else:
        print("\n👋 Exiting without making changes.")
