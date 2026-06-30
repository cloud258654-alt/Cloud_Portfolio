import hashlib
import secrets
import datetime
from typing import Optional, Dict
import jwt
from app.models.user import User
from app.config import settings

JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

ROLE_PERMISSIONS: Dict[str, list] = {
    "admin": [
        "manage_users", "manage_keywords", "run_crawler", "import_csv",
        "export_reports", "view_all_data", "manage_settings", "manage_events",
    ],
    "manager": [
        "view_dashboard", "view_high_risk", "update_event_status",
        "generate_reports", "export_reports", "view_all_data",
    ],
    "viewer": [
        "view_dashboard", "view_mentions",
    ],
}


def hash_password(password: str) -> str:
    salt = secrets.token_hex(8)
    return f"{salt}:{hashlib.sha256((salt + password).encode()).hexdigest()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        salt, h = hashed.split(":", 1)
        return hashlib.sha256((salt + password).encode()).hexdigest() == h
    except Exception:
        return False


def create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "username": user.username,
        "role": user.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        return None


def require_role(role: str):
    def checker(payload: dict) -> bool:
        roles_hierarchy = {"admin": 3, "manager": 2, "viewer": 1}
        user_level = roles_hierarchy.get(payload.get("role", ""), 0)
        required_level = roles_hierarchy.get(role, 0)
        return user_level >= required_level
    return checker


def require_permission(permission: str):
    def checker(payload: dict) -> bool:
        user_role = payload.get("role", "viewer")
        allowed = ROLE_PERMISSIONS.get(user_role, [])
        return permission in allowed
    return checker
