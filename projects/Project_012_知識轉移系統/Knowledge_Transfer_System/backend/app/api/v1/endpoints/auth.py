from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.schemas.auth import LoginRequest, TokenResponse, UserWithRoles
from app.schemas.response import StandardResponse
from app.services.auth_service import login

router = APIRouter()


@router.post("/login", response_model=StandardResponse[TokenResponse])
def login_endpoint(body: LoginRequest, db: Session = Depends(get_db)):
    result = login(db, body.email, body.password)
    return StandardResponse(success=True, data=result, message="Login successful")


@router.get("/me", response_model=StandardResponse[UserWithRoles])
def get_me(current_user: User = Depends(get_current_user)):
    role_names = [ur.role.name for ur in current_user.roles]
    user_data = UserWithRoles.model_validate(current_user)
    user_data.roles = role_names
    return StandardResponse(success=True, data=user_data, message="ok")
