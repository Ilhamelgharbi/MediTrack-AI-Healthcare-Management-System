#!/usr/bin/env python3
"""
Query Sara's medications from the database
"""
from app.database.db import SessionLocal
from sqlalchemy import text

def get_sara_medications():
    # Query to get Sara's active medications
    active_query = '''
    SELECT
        pm.id as patient_medication_id,
        m.name as medication_name,
        m.form as medication_form,
        pm.dosage,
        pm.times_per_day,
        pm.instructions,
        pm.start_date,
        pm.end_date,
        pm.status,
        pm.confirmed_by_patient,
        pm.created_at as assigned_date,
        u_doctor.full_name as assigned_by_doctor
    FROM patient_medications pm
    JOIN medications m ON pm.medication_id = m.id
    JOIN users u_patient ON pm.patient_id = u_patient.id
    LEFT JOIN users u_doctor ON pm.assigned_by_doctor = u_doctor.id
    WHERE u_patient.full_name = 'Sarah Johnson'
    AND pm.status = 'active'
    ORDER BY pm.created_at DESC;
    '''

    # Query to get all medications (including stopped)
    all_query = '''
    SELECT
        pm.id as patient_medication_id,
        m.name as medication_name,
        m.form as medication_form,
        pm.dosage,
        pm.times_per_day,
        pm.instructions,
        pm.start_date,
        pm.end_date,
        pm.status,
        pm.confirmed_by_patient,
        pm.created_at as assigned_date,
        u_doctor.full_name as assigned_by_doctor,
        CASE
            WHEN pm.status = 'stopped' THEN im.stopped_at
            ELSE NULL
        END as stopped_date,
        CASE
            WHEN pm.status = 'stopped' THEN im.reason
            ELSE NULL
        END as stop_reason
    FROM patient_medications pm
    JOIN medications m ON pm.medication_id = m.id
    JOIN users u_patient ON pm.patient_id = u_patient.id
    LEFT JOIN users u_doctor ON pm.assigned_by_doctor = u_doctor.id
    LEFT JOIN inactive_medications im ON pm.id = im.patient_medication_id
    WHERE u_patient.full_name = 'Sarah Johnson'
    ORDER BY pm.created_at DESC;
    '''

    db = SessionLocal()
    try:
        print("=== SARA'S ACTIVE MEDICATIONS ===")
        result = db.execute(text(active_query))
        active_rows = result.fetchall()

        if not active_rows:
            print("No active medications found for Sara.")
        else:
            for row in active_rows:
                print(f"\nID: {row.patient_medication_id}")
                print(f"Medication: {row.medication_name} ({row.medication_form})")
                print(f"Dosage: {row.dosage}")
                print(f"Frequency: {row.times_per_day} times per day")
                print(f"Instructions: {row.instructions}")
                print(f"Start Date: {row.start_date}")
                print(f"End Date: {row.end_date or 'Ongoing'}")
                print(f"Status: {row.status}")
                print(f"Confirmed by patient: {row.confirmed_by_patient}")
                print(f"Assigned by: {row.assigned_by_doctor}")
                print(f"Assigned date: {row.assigned_date}")

        print("\n" + "="*50)
        print("=== ALL SARA'S MEDICATIONS (ACTIVE + STOPPED) ===")

        result = db.execute(text(all_query))
        all_rows = result.fetchall()

        if not all_rows:
            print("No medications found for Sara.")
        else:
            for row in all_rows:
                print(f"\nID: {row.patient_medication_id}")
                print(f"Medication: {row.medication_name} ({row.medication_form})")
                print(f"Dosage: {row.dosage}")
                print(f"Frequency: {row.times_per_day} times per day")
                print(f"Instructions: {row.instructions}")
                print(f"Start Date: {row.start_date}")
                print(f"End Date: {row.end_date or 'Ongoing'}")
                print(f"Status: {row.status}")
                print(f"Confirmed by patient: {row.confirmed_by_patient}")
                print(f"Assigned by: {row.assigned_by_doctor}")
                print(f"Assigned date: {row.assigned_date}")
                if row.stopped_date:
                    print(f"Stopped date: {row.stopped_date}")
                    print(f"Stop reason: {row.stop_reason}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    get_sara_medications()