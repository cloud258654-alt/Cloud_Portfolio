from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.experience.experience_service import ExperienceService
from app.schemas.experience import ExperienceCreate
from app.schemas.response import StandardResponse


router = APIRouter()


def get_experience_service(db: Session = Depends(get_db)) -> ExperienceService:
    return ExperienceService(db)


@router.post("", response_model=StandardResponse)
def upload_experience(
    file: UploadFile = File(...),
    title: str = Form(...),
    source_type: str = Form("interview"),
    category: str | None = Form(None),
    expert_name: str | None = Form(None),
    department_id: str | None = Form(None),
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    experience = service.upload(
        file,
        ExperienceCreate(
            title=title,
            source_type=source_type,
            category=category,
            expert_name=expert_name,
            department_id=department_id,
        ),
    )
    return StandardResponse(success=True, data=experience.model_dump(), message="experience uploaded")


@router.get("", response_model=StandardResponse)
def list_experiences(
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(
        success=True,
        data=[item.model_dump() for item in service.list()],
        message="success",
    )


@router.get("/{experience_id}", response_model=StandardResponse)
def get_experience(
    experience_id: str,
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.detail(experience_id).model_dump(), message="success")


@router.post("/{experience_id}/process", response_model=StandardResponse)
def process_experience(
    experience_id: str,
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.process(experience_id).model_dump(), message="experience processed")


@router.get("/{experience_id}/segments", response_model=StandardResponse)
def get_segments(
    experience_id: str,
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(
        success=True,
        data=[item.model_dump() for item in service.segments(experience_id)],
        message="success",
    )


@router.get("/{experience_id}/package", response_model=StandardResponse)
def get_package(
    experience_id: str,
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.package(experience_id).model_dump(), message="success")


@router.post("/{experience_id}/approve", response_model=StandardResponse)
def approve_experience(
    experience_id: str,
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.approve(experience_id).model_dump(), message="experience approved")


@router.post("/{experience_id}/reject", response_model=StandardResponse)
def reject_experience(
    experience_id: str,
    service: ExperienceService = Depends(get_experience_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.reject(experience_id).model_dump(), message="experience rejected")
