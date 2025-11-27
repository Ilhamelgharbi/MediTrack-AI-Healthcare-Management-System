"""
Check database for patients and medications, then populate adherence and reminder test data
"""
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.db import engine, SessionLocal
from app.auth.models import User
from app.patients.models import Patient
from app.medications.models import Medication, PatientMedication, InactiveMedication
from app.adherence.models import MedicationLog, AdherenceStats, MedicationLogStatusEnum
from app.reminders.models import ReminderSchedule, Reminder, ReminderFrequencyEnum

def check_database():
    """Check what data exists in the database"""
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("📊 DATABASE STATUS CHECK")
        print("="*60)
        
        # Check Users
        users = db.query(User).all()
        print(f"\n👥 USERS ({len(users)} total):")
        for user in users:
            print(f"  - ID: {user.id}, Email: {user.email}, Role: {user.role}")
        
        # Check Patients
        patients = db.query(Patient).all()
        print(f"\n🏥 PATIENTS ({len(patients)} total):")
        for patient in patients:
            print(f"  - ID: {patient.id}, User ID: {patient.user_id}")
            print(f"    Blood Type: {patient.blood_type}, Allergies: {patient.allergies}")
        
        # Check Medications (catalog)
        medications = db.query(Medication).all()
        print(f"\n💊 MEDICATIONS CATALOG ({len(medications)} total):")
        for med in medications[:10]:  # Show first 10
            print(f"  - ID: {med.id}, Name: {med.name}, Form: {med.form}")
        if len(medications) > 10:
            print(f"  ... and {len(medications) - 10} more")
        
        # Check Patient Medications
        patient_meds = db.query(PatientMedication).all()
        print(f"\n💉 PATIENT MEDICATIONS ({len(patient_meds)} total):")
        for pm in patient_meds:
            med = db.query(Medication).filter(Medication.id == pm.medication_id).first()
            print(f"  - ID: {pm.id}, Patient: {pm.patient_id}, Med: {med.name if med else 'Unknown'}")
            print(f"    Dosage: {pm.dosage}, Times/day: {pm.times_per_day}, Status: {pm.status}")
        
        # Check Medication Logs
        logs = db.query(MedicationLog).all()
        print(f"\n📝 MEDICATION LOGS ({len(logs)} total):")
        for log in logs[:5]:
            print(f"  - ID: {log.id}, Patient: {log.patient_id}, Status: {log.status}, Time: {log.scheduled_time}")
        if len(logs) > 5:
            print(f"  ... and {len(logs) - 5} more")
        
        # Check Adherence Stats
        stats = db.query(AdherenceStats).all()
        print(f"\n📈 ADHERENCE STATS ({len(stats)} total):")
        for stat in stats:
            print(f"  - Patient: {stat.patient_id}, Period: {stat.period_type}, Score: {stat.adherence_score}%")
        
        # Check Reminder Schedules
        schedules = db.query(ReminderSchedule).all()
        print(f"\n⏰ REMINDER SCHEDULES ({len(schedules)} total):")
        for schedule in schedules[:5]:
            import json
            times = json.loads(schedule.reminder_times) if isinstance(schedule.reminder_times, str) else schedule.reminder_times
            print(f"  - ID: {schedule.id}, Patient Med: {schedule.patient_medication_id}, Times: {times}, Active: {schedule.is_active}")
        if len(schedules) > 5:
            print(f"  ... and {len(schedules) - 5} more")
        
        # Check Reminders
        reminders = db.query(Reminder).all()
        print(f"\n🔔 REMINDERS ({len(reminders)} total):")
        for reminder in reminders[:5]:
            print(f"  - ID: {reminder.id}, Patient: {reminder.patient_id}, Time: {reminder.scheduled_time}, Status: {reminder.status}")
        if len(reminders) > 5:
            print(f"  ... and {len(reminders) - 5} more")
        if len(reminders) > 5:
            print(f"  ... and {len(reminders) - 5} more")
        
        print("\n" + "="*60)
        
        return {
            'users': users,
            'patients': patients,
            'medications': medications,
            'patient_medications': patient_meds,
            'logs': logs,
            'schedules': schedules,
            'reminders': reminders
        }
    
    finally:
        db.close()

def create_test_data():
    """Create test data for adherence and reminders based on existing patients and medications"""
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("🔧 CREATING TEST DATA")
        print("="*60)
        
        # Get existing data
        patient_meds = db.query(PatientMedication).filter(
            PatientMedication.status.in_(['active', 'confirmed'])
        ).all()
        
        if not patient_meds:
            print("\n⚠️  No active patient medications found. Please assign medications to patients first.")
            return
        
        print(f"\n✅ Found {len(patient_meds)} active patient medications")
        
        # Create medication logs for the past 14 days
        print("\n📝 Creating medication logs...")
        logs_created = 0
        
        for pm in patient_meds:
            # Use times_per_day from the database
            doses_per_day = pm.times_per_day if pm.times_per_day else 1
            
            # Create logs for past 14 days
            for days_ago in range(14):
                date = datetime.now() - timedelta(days=days_ago)
                
                for dose_num in range(doses_per_day):
                    # Schedule times throughout the day
                    hour = 8 + (dose_num * (12 // doses_per_day))
                    scheduled_time = date.replace(hour=hour, minute=0, second=0, microsecond=0)
                    
                    # 85% chance of taking medication, 10% skipped, 5% missed
                    import random
                    rand = random.random()
                    if rand < 0.85:
                        status = MedicationLogStatusEnum.taken
                        actual_time = scheduled_time + timedelta(minutes=random.randint(-15, 30))
                    elif rand < 0.95:
                        status = MedicationLogStatusEnum.skipped
                        actual_time = None
                    else:
                        status = MedicationLogStatusEnum.missed
                        actual_time = None
                    
                    # Check if log already exists
                    existing_log = db.query(MedicationLog).filter(
                        MedicationLog.patient_id == pm.patient_id,
                        MedicationLog.patient_medication_id == pm.id,
                        MedicationLog.scheduled_time == scheduled_time
                    ).first()
                    
                    if not existing_log:
                        log = MedicationLog(
                            patient_id=pm.patient_id,
                            patient_medication_id=pm.id,
                            scheduled_time=scheduled_time,
                            scheduled_date=date.date(),
                            actual_time=actual_time,
                            status=status,
                            on_time=True if status == MedicationLogStatusEnum.taken else None,
                            notes=f"Auto-generated test data" if status == MedicationLogStatusEnum.taken else None,
                            logged_via="auto_test_data"
                        )
                        db.add(log)
                        logs_created += 1
        
        db.commit()
        print(f"✅ Created {logs_created} medication logs")
        
        # Create reminder schedules
        print("\n⏰ Creating reminder schedules...")
        schedules_created = 0
        
        for pm in patient_meds:
            # Check if schedule already exists
            existing_schedule = db.query(ReminderSchedule).filter(
                ReminderSchedule.patient_medication_id == pm.id
            ).first()
            
            if not existing_schedule:
                # Determine reminder times based on times_per_day
                doses_per_day = pm.times_per_day if pm.times_per_day else 1
                
                if doses_per_day == 2:
                    times = ['08:00:00', '20:00:00']
                elif doses_per_day == 3:
                    times = ['08:00:00', '14:00:00', '20:00:00']
                elif doses_per_day >= 4:
                    times = ['08:00:00', '12:00:00', '16:00:00', '20:00:00']
                else:
                    times = ['09:00:00']
                
                # Create one schedule with all times
                schedule = ReminderSchedule(
                    patient_medication_id=pm.id,
                    patient_id=pm.patient_id,
                    reminder_times=times,  # JSON list of times
                    frequency=ReminderFrequencyEnum.daily,
                    is_active=True,
                    channel_push=True,
                    channel_email=True,
                    channel_whatsapp=False,
                    channel_sms=False,
                    start_date=pm.start_date
                )
                db.add(schedule)
                schedules_created += 1
        
        db.commit()
        print(f"✅ Created {schedules_created} reminder schedules")
        
        # Create upcoming reminders for today and tomorrow
        print("\n🔔 Creating upcoming reminders...")
        reminders_created = 0
        
        schedules = db.query(ReminderSchedule).filter(ReminderSchedule.is_active == True).all()
        
        for schedule in schedules:
            # Get reminder times from JSON list
            reminder_times = schedule.reminder_times if schedule.reminder_times else ['09:00:00']
            
            for days_ahead in range(2):  # Today and tomorrow
                date = datetime.now() + timedelta(days=days_ahead)
                
                for time_str in reminder_times:
                    time_parts = time_str.split(':')
                    actual_dose_time = date.replace(
                        hour=int(time_parts[0]),
                        minute=int(time_parts[1]),
                        second=0,
                        microsecond=0
                    )
                    
                    # Reminder is sent 15 minutes before dose time
                    scheduled_time = actual_dose_time - timedelta(minutes=schedule.advance_minutes if schedule.advance_minutes else 15)
                    
                    # Only create if time is in the future
                    if actual_dose_time > datetime.now():
                        # Check if reminder already exists
                        existing_reminder = db.query(Reminder).filter(
                            Reminder.patient_medication_id == schedule.patient_medication_id,
                            Reminder.actual_dose_time == actual_dose_time
                        ).first()
                        
                        if not existing_reminder:
                            # Determine channel
                            channel = 'push'
                            if schedule.channel_whatsapp:
                                channel = 'whatsapp'
                            elif schedule.channel_sms:
                                channel = 'sms'
                            elif schedule.channel_email:
                                channel = 'email'
                            
                            reminder = Reminder(
                                patient_medication_id=schedule.patient_medication_id,
                                patient_id=schedule.patient_id,
                                scheduled_time=scheduled_time,
                                actual_dose_time=actual_dose_time,
                                channel=channel,
                                status='pending',
                                message_text=f"Reminder: Time to take your medication"
                            )
                            db.add(reminder)
                            reminders_created += 1
        
        db.commit()
        print(f"✅ Created {reminders_created} upcoming reminders")
        
        print("\n" + "="*60)
        print("✅ TEST DATA CREATION COMPLETE!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🚀 MediTrack Database Check & Population Script")
    
    # Check current database state
    data = check_database()
    
    # Ask user if they want to create test data
    print("\n" + "="*60)
    if data['patient_medications']:
        print("Would you like to create test data for adherence and reminders?")
        print("This will create:")
        print("  - Medication logs for the past 14 days")
        print("  - Reminder schedules for active medications")
        print("  - Upcoming reminders for today and tomorrow")
        print("\nType 'yes' to continue, or anything else to exit: ", end='')
        
        response = input().strip().lower()
        if response == 'yes':
            create_test_data()
            print("\n📊 Final database state:")
            check_database()
        else:
            print("\n👋 Exiting without creating test data.")
    else:
        print("⚠️  No patient medications found. Please add medications first.")
        print("\nTo add medications:")
        print("  1. Use the API at http://localhost:8000/docs")
        print("  2. Create medications in the catalog (POST /medications)")
        print("  3. Assign medications to patients (POST /patients/{id}/medications)")
