#!/usr/bin/env python3
"""
Check patients in the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db import get_db
from app.patients.models import Patient

def check_patients():
    db = next(get_db())
    try:
        patients = db.query(Patient).all()
        print(f"Found {len(patients)} patients in database:")
        for patient in patients:
            print(f"- ID: {patient.id}, User ID: {patient.user_id}, Status: {patient.status}")
    finally:
        db.close()

if __name__ == "__main__":
    check_patients()