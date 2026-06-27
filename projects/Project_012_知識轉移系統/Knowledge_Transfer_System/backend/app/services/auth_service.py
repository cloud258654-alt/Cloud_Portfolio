from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import create_access_token, verify_password
from app.repositories.auth_repository import get_user_by_email, update_last_login


class InvalidCredentialsError(AppException):
    status_code = 401
    code = "INVALID_CREDENTIALS"


def login(db: Session, email: str, password: str) -> dict:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise InvalidCredentialsError(message="Invalid email or password")

    update_last_login(db, user)
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}
