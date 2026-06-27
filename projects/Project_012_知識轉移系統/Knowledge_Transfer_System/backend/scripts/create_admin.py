"""Create default admin user. Run once after DB setup."""
import sys

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.auth import Role, User, UserRole


def create_admin_user():
    db = SessionLocal()
    try:
        email = "admin@kts.local"
        name = "System Admin"
        password = "Admin123!"

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Admin user already exists: {existing.id}")
            return

        admin_role = db.query(Role).filter(Role.name == "system_admin").first()
        if not admin_role:
            print("ERROR: 'system_admin' role not found. Run seed_v1.sql first.")
            sys.exit(1)

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            job_title="System Administrator",
            status="active",
        )
        db.add(user)
        db.flush()

        db.add(UserRole(user_id=user.id, role_id=admin_role.id))
        db.commit()

        print(f"Admin user created: {email} / {password}")
        print(f"User ID: {user.id}")
    finally:
        db.close()


if __name__ == "__main__":
    create_admin_user()
