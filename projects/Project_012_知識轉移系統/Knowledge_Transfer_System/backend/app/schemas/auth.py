from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: str
    email: str
    name: str
    job_title: str | None = None
    department_id: str | None = None
    status: str
    employment_status: str

    model_config = {"from_attributes": True}


class UserWithRoles(UserRead):
    roles: list[str] = []
