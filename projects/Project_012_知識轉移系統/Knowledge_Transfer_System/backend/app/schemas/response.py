from typing import Any

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str


class StandardResponse(BaseModel):
    success: bool
    data: Any | None = None
    message: str = "success"


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
