# app/database/init_db.py

from app.database.db import Base, engine
from app.auth.models import User  # import all models so Base.metadata can see them
from app.patients.models import Patient  # import patient model
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.auth.utils import hash_password
from app.auth.models import RoleEnum


def init_db():
    """Initialize the database by creating all tables."""
    print("📦 Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully.")
    
    # Create default admin user
    db: Session = next(get_db())
    try:
        # Check if admin exists
        admin_exists = db.query(User).filter(User.role == RoleEnum.admin).first()
        if not admin_exists:
            admin_user = User(
                full_name="Admin Doctor",
                email="admin@gmail.com",
                phone="+1234567890",
                password_hash=hash_password("admin123"),
                role=RoleEnum.admin
            )
            db.add(admin_user)
            db.commit()
            print("✅ Default admin user created:")
            print("   Email: admin@gmail.com")
            print("   Password: admin123")
    except Exception as e:
        print(f"⚠️  Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

