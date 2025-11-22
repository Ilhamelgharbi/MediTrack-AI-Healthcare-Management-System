import sys
sys.path.insert(0, '.')

from app.database.db import get_db
from app.auth.models import User
from app.auth.utils import verify_password

db = next(get_db())

# Check admin user
admin = db.query(User).filter(User.email == 'admin@meditrack.com').first()
print(f'Admin exists: {admin is not None}')

if admin:
    print(f'Email: {admin.email}')
    print(f'Role: {admin.role}')
    print(f'Hash (first 50 chars): {admin.password_hash[:50]}...')
    
    # Test password
    test_password = 'admin123'
    is_valid = verify_password(test_password, admin.password_hash)
    print(f'Password "{test_password}" is valid: {is_valid}')

# Check patient user
patient = db.query(User).filter(User.email == 'ilham@patient.com').first()
if patient:
    print(f'\nPatient exists: {patient.email}')
    print(f'Testing password...')
    is_valid = verify_password('123456', patient.password_hash)
    print(f'Password "123456" is valid: {is_valid}')

db.close()
