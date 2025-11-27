#!/usr/bin/env python3
"""
Script to clean up duplicate patient medication assignments.
This removes duplicate assignments for the same medication per patient,
keeping only the most recent one.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.database.db import engine
from app.medications.models import PatientMedication, MedicationStatusEnum, InactiveMedication
from collections import defaultdict

def cleanup_duplicate_medications():
    """Clean up duplicate medication assignments for each patient-medication pair."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Group medications by patient_id and medication_id
        medications = db.query(PatientMedication).all()

        duplicates_found = defaultdict(list)

        for med in medications:
            key = (med.patient_id, med.medication_id)
            duplicates_found[key].append(med)

        total_deleted = 0

        for key, meds in duplicates_found.items():
            if len(meds) > 1:
                patient_id, medication_id = key
                print(f"Patient {patient_id}, Medication {medication_id}: {len(meds)} assignments")
                
                # Separate by status
                active_meds = [m for m in meds if m.status.value == 'active']
                pending_meds = [m for m in meds if m.status.value == 'pending']
                stopped_meds = [m for m in meds if m.status.value == 'stopped']
                
                # Priority: active > pending > stopped
                if active_meds:
                    active_meds.sort(key=lambda x: x.updated_at or x.created_at, reverse=True)
                    to_keep = active_meds[0]
                    to_delete = active_meds[1:] + pending_meds + stopped_meds
                elif pending_meds:
                    pending_meds.sort(key=lambda x: x.updated_at or x.created_at, reverse=True)
                    to_keep = pending_meds[0]
                    to_delete = pending_meds[1:] + stopped_meds
                else:
                    # No active/pending meds, keep the most recent stopped
                    stopped_meds.sort(key=lambda x: x.updated_at or x.created_at, reverse=True)
                    to_keep = stopped_meds[0]
                    to_delete = stopped_meds[1:]
                
                print(f"  Keeping: ID {to_keep.id} (status: {to_keep.status}, updated: {to_keep.updated_at})")
                for med in to_delete:
                    print(f"  Deleting: ID {med.id} (status: {med.status}, updated: {med.updated_at})")
                    
                    # Delete associated inactive medication record if it exists
                    inactive_record = db.query(InactiveMedication).filter(
                        InactiveMedication.patient_medication_id == med.id
                    ).first()
                    if inactive_record:
                        db.delete(inactive_record)
                        print(f"    Also deleting inactive record ID {inactive_record.id}")
                    
                    db.delete(med)
                    total_deleted += 1
        
        if total_deleted > 0:
            db.commit()
            print(f"\nCleanup completed! Deleted {total_deleted} duplicate assignments.")
        else:
            print("No duplicates found.")

    except Exception as e:
        db.rollback()
        print(f"Error during cleanup: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting medication duplicates cleanup...")
    cleanup_duplicate_medications()
    print("Cleanup finished.")