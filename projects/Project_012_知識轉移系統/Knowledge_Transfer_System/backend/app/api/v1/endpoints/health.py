from fastapi import APIRouter

from app.schemas.response import StandardResponse
from app.services.health_service import HealthService


router = APIRouter()


@router.get("/health", response_model=StandardResponse)
def health_check() -> StandardResponse:
    health = HealthService.check_all()
    return StandardResponse(
        success=True,
        data=health,
        message="system healthy",
    )
