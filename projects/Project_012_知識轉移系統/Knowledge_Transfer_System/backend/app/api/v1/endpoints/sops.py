from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.response import StandardResponse
from app.services.sop_service import (
    SOPInvalidStatusError,
    SOPNotFoundError,
    SOPPublishValidationError,
    SOPReviewError,
    SOPService,
    SOPVersionError,
)

router = APIRouter()


def get_sop_service(db: Session = Depends(get_db)) -> SOPService:
    return SOPService(db)


# ---------------------------------------------------------------------------
# Minimal request models
# ---------------------------------------------------------------------------


class SOPCreate(BaseModel):
    title: str
    sop_type: str | None = None
    template_id: str | None = None
    department_id: str | None = None
    purpose: str | None = None
    scope: str | None = None
    responsible_role: str | None = None
    required_materials: list | None = None
    prerequisites: list | None = None
    content: dict | None = None
    mermaid_flowchart: str | None = None
    permission_scope: str = "department"
    classification: str = "internal"
    source_metadata: dict | None = None
    metadata: dict | None = None


class SOPUpdate(BaseModel):
    title: str | None = None
    sop_type: str | None = None
    template_id: str | None = None
    department_id: str | None = None
    purpose: str | None = None
    scope: str | None = None
    responsible_role: str | None = None
    required_materials: list | None = None
    prerequisites: list | None = None
    content: dict | None = None
    mermaid_flowchart: str | None = None
    permission_scope: str | None = None
    classification: str | None = None
    source_metadata: dict | None = None
    metadata: dict | None = None


class VersionCreate(BaseModel):
    version_no: str
    content: dict | None = None
    mermaid_flowchart: str | None = None
    change_note: str | None = None
    metadata: dict | None = None


class StepCreate(BaseModel):
    step_no: int
    action: str
    title: str | None = None
    description: str | None = None
    expected_result: str | None = None
    screenshot_path: str | None = None
    warning: str | None = None
    estimated_minutes: int = 0
    metadata: dict | None = None


class StepUpdate(BaseModel):
    step_no: int | None = None
    action: str | None = None
    title: str | None = None
    description: str | None = None
    expected_result: str | None = None
    screenshot_path: str | None = None
    warning: str | None = None
    estimated_minutes: int | None = None
    metadata: dict | None = None


class StepReorder(BaseModel):
    step_ids: list[str]


class TemplateCreate(BaseModel):
    name: str
    description: str | None = None
    template_type: str = "standard"
    structure: dict | None = None
    metadata: dict | None = None


class TemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    template_type: str | None = None
    structure: dict | None = None
    is_active: bool | None = None
    metadata: dict | None = None


# ---------------------------------------------------------------------------
# ORM -> dict helpers (minimal, formal schemas in next task)
# ---------------------------------------------------------------------------


def _sop_to_dict(sop: Any) -> dict:
    return {
        "id": sop.id,
        "template_id": sop.template_id,
        "department_id": sop.department_id,
        "title": sop.title,
        "sop_type": sop.sop_type,
        "purpose": sop.purpose,
        "scope": sop.scope,
        "responsible_role": sop.responsible_role,
        "required_materials": sop.required_materials,
        "prerequisites": sop.prerequisites,
        "content": sop.content,
        "mermaid_flowchart": sop.mermaid_flowchart,
        "version_no": sop.version_no,
        "permission_scope": sop.permission_scope,
        "classification": sop.classification,
        "status": sop.status,
        "source_metadata": sop.source_metadata,
        "metadata": sop.sop_metadata,
        "created_by": sop.created_by,
        "approved_by": sop.approved_by,
        "approved_at": sop.approved_at.isoformat() if sop.approved_at else None,
        "published_at": sop.published_at.isoformat() if sop.published_at else None,
        "created_at": sop.created_at.isoformat() if sop.created_at else None,
        "updated_at": sop.updated_at.isoformat() if sop.updated_at else None,
        "deleted_at": sop.deleted_at.isoformat() if sop.deleted_at else None,
    }


def _version_to_dict(version: Any) -> dict:
    return {
        "id": version.id,
        "sop_id": version.sop_id,
        "version_no": version.version_no,
        "content": version.content,
        "mermaid_flowchart": version.mermaid_flowchart,
        "change_note": version.change_note,
        "created_by": version.created_by,
        "metadata": version.version_metadata,
        "created_at": version.created_at.isoformat() if version.created_at else None,
    }


def _step_to_dict(step: Any) -> dict:
    return {
        "id": step.id,
        "sop_id": step.sop_id,
        "sop_version_id": step.sop_version_id,
        "step_no": step.step_no,
        "title": step.title,
        "action": step.action,
        "description": step.description,
        "expected_result": step.expected_result,
        "screenshot_path": step.screenshot_path,
        "warning": step.warning,
        "estimated_minutes": step.estimated_minutes,
        "metadata": step.step_metadata,
        "created_at": step.created_at.isoformat() if step.created_at else None,
        "updated_at": step.updated_at.isoformat() if step.updated_at else None,
    }


def _review_to_dict(review: Any) -> dict:
    return {
        "id": review.id,
        "sop_id": review.sop_id,
        "sop_version_id": review.sop_version_id,
        "reviewer_id": review.reviewer_id,
        "review_status": review.review_status,
        "review_comment": review.review_comment,
        "reviewed_at": review.reviewed_at.isoformat() if review.reviewed_at else None,
        "metadata": review.review_metadata,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }


def _attachment_to_dict(attachment: Any) -> dict:
    return {
        "id": attachment.id,
        "sop_id": attachment.sop_id,
        "sop_version_id": attachment.sop_version_id,
        "attachment_type": attachment.attachment_type,
        "title": attachment.title,
        "storage_path": attachment.storage_path,
        "metadata": attachment.attachment_metadata,
        "created_at": attachment.created_at.isoformat() if attachment.created_at else None,
    }


def _template_to_dict(template: Any) -> dict:
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "template_type": template.template_type,
        "structure": template.structure,
        "is_active": template.is_active,
        "metadata": template.template_metadata,
        "created_at": template.created_at.isoformat() if template.created_at else None,
        "updated_at": template.updated_at.isoformat() if template.updated_at else None,
    }


# ---------------------------------------------------------------------------
# Error mapping
# ---------------------------------------------------------------------------


_SOP_ERROR_STATUS: dict[type, int] = {
    SOPNotFoundError: 404,
    SOPInvalidStatusError: 400,
    SOPPublishValidationError: 400,
    SOPVersionError: 400,
    SOPReviewError: 400,
}


def _map_sop_exception(exc: Exception) -> HTTPException:
    status_code = _SOP_ERROR_STATUS.get(type(exc), 500)
    return HTTPException(
        status_code=status_code,
        detail={"code": getattr(exc, "code", "UNKNOWN"), "message": str(exc)},
    )


# ---------------------------------------------------------------------------
# SOP CRUD
# ---------------------------------------------------------------------------


@router.post("", response_model=StandardResponse)
def create_sop(
    payload: SOPCreate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.create_sop(**payload.model_dump())
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="sop created")
    except (
        SOPNotFoundError,
        SOPInvalidStatusError,
        SOPPublishValidationError,
        SOPVersionError,
        SOPReviewError,
    ) as exc:
        raise _map_sop_exception(exc) from exc


@router.get("", response_model=StandardResponse)
def list_sops(
    keyword: str | None = None,
    status: str | None = None,
    sop_type: str | None = None,
    department_id: str | None = None,
    template_id: str | None = None,
    created_by: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    items, total = service.list_sops(
        keyword=keyword,
        status=status,
        sop_type=sop_type,
        department_id=department_id,
        template_id=template_id,
        page=page,
        page_size=page_size,
    )
    return StandardResponse(
        success=True,
        data={
            "items": [_sop_to_dict(item) for item in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        },
        message="success",
    )


@router.get("/{sop_id}", response_model=StandardResponse)
def get_sop(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.get_sop(sop_id)
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="success")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.put("/{sop_id}", response_model=StandardResponse)
def update_sop(
    sop_id: str,
    payload: SOPUpdate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.update_sop(sop_id, payload.model_dump(exclude_unset=True))
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="sop updated")
    except (SOPNotFoundError, SOPInvalidStatusError) as exc:
        raise _map_sop_exception(exc) from exc


@router.delete("/{sop_id}", response_model=StandardResponse)
def delete_sop(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.soft_delete_sop(sop_id)
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="sop deleted")
    except (SOPNotFoundError, SOPInvalidStatusError) as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/restore", response_model=StandardResponse)
def restore_sop(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.restore_sop(sop_id)
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="sop restored")
    except (SOPNotFoundError, SOPInvalidStatusError) as exc:
        raise _map_sop_exception(exc) from exc


# ---------------------------------------------------------------------------
# SOP Status actions
# ---------------------------------------------------------------------------


@router.post("/{sop_id}/submit", response_model=StandardResponse)
def submit_for_review(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        review = service.submit_for_review(sop_id)
        return StandardResponse(success=True, data=_review_to_dict(review), message="sop submitted for review")
    except (SOPNotFoundError, SOPInvalidStatusError) as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/publish", response_model=StandardResponse)
def publish_sop(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.publish_sop(sop_id)
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="sop published")
    except (SOPNotFoundError, SOPInvalidStatusError, SOPPublishValidationError) as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/archive", response_model=StandardResponse)
def archive_sop(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        sop = service.archive_sop(sop_id)
        return StandardResponse(success=True, data=_sop_to_dict(sop), message="sop archived")
    except (SOPNotFoundError, SOPInvalidStatusError) as exc:
        raise _map_sop_exception(exc) from exc


# ---------------------------------------------------------------------------
# SOP Version
# ---------------------------------------------------------------------------


@router.post("/{sop_id}/versions", response_model=StandardResponse)
def create_version(
    sop_id: str,
    payload: VersionCreate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        version = service.create_version(sop_id, **payload.model_dump())
        return StandardResponse(success=True, data=_version_to_dict(version), message="version created")
    except (SOPNotFoundError, SOPVersionError) as exc:
        raise _map_sop_exception(exc) from exc


@router.get("/{sop_id}/versions", response_model=StandardResponse)
def list_versions(
    sop_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        versions = service.list_versions(sop_id)
        return StandardResponse(
            success=True,
            data=[_version_to_dict(v) for v in versions],
            message="success",
        )
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/versions/{version_id}/rollback", response_model=StandardResponse)
def rollback_version(
    sop_id: str,
    version_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        version = service.rollback_to_version(sop_id, version_id)
        return StandardResponse(success=True, data=_version_to_dict(version), message="version rolled back")
    except (SOPNotFoundError, SOPVersionError) as exc:
        raise _map_sop_exception(exc) from exc


# ---------------------------------------------------------------------------
# SOP Step
# ---------------------------------------------------------------------------


@router.get("/{sop_id}/versions/{version_id}/steps", response_model=StandardResponse)
def list_steps(
    sop_id: str,
    version_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        steps = service.list_steps(sop_id)
        return StandardResponse(
            success=True,
            data=[_step_to_dict(s) for s in steps],
            message="success",
        )
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/versions/{version_id}/steps", response_model=StandardResponse)
def add_step(
    sop_id: str,
    version_id: str,
    payload: StepCreate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        step = service.add_step(sop_id=sop_id, sop_version_id=version_id, **payload.model_dump())
        return StandardResponse(success=True, data=_step_to_dict(step), message="step added")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.put("/{sop_id}/versions/{version_id}/steps/{step_id}", response_model=StandardResponse)
def update_step(
    sop_id: str,
    version_id: str,
    step_id: str,
    payload: StepUpdate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        step = service.update_step(step_id, payload.model_dump(exclude_unset=True))
        return StandardResponse(success=True, data=_step_to_dict(step), message="step updated")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.delete("/{sop_id}/versions/{version_id}/steps/{step_id}", response_model=StandardResponse)
def delete_step(
    sop_id: str,
    version_id: str,
    step_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        service.delete_step(step_id)
        return StandardResponse(success=True, data={}, message="step deleted")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/versions/{version_id}/steps/reorder", response_model=StandardResponse)
def reorder_steps(
    sop_id: str,
    version_id: str,
    payload: StepReorder,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        service.reorder_steps(sop_id, payload.step_ids)
        return StandardResponse(success=True, data={"step_ids": payload.step_ids}, message="steps reordered")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


# ---------------------------------------------------------------------------
# SOP Review
# ---------------------------------------------------------------------------


@router.get("/{sop_id}/versions/{version_id}/reviews", response_model=StandardResponse)
def list_reviews(
    sop_id: str,
    version_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        reviews = service.list_reviews(sop_id)
        return StandardResponse(
            success=True,
            data=[_review_to_dict(r) for r in reviews],
            message="success",
        )
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


def _find_latest_review(service: SOPService, sop_id: str) -> Any:
    reviews = service.list_reviews(sop_id)
    for review in reviews:
        if review.review_status in {"pending", "need_revision"}:
            return review
    raise SOPReviewError("No pending or need-revision review found for this SOP")


@router.post("/{sop_id}/versions/{version_id}/approve", response_model=StandardResponse)
def approve_review(
    sop_id: str,
    version_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        review = _find_latest_review(service, sop_id)
        result = service.approve_review(review.id)
        return StandardResponse(success=True, data=_review_to_dict(result), message="review approved")
    except (SOPNotFoundError, SOPInvalidStatusError, SOPReviewError) as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/versions/{version_id}/reject", response_model=StandardResponse)
def reject_review(
    sop_id: str,
    version_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        review = _find_latest_review(service, sop_id)
        result = service.reject_review(review.id)
        return StandardResponse(success=True, data=_review_to_dict(result), message="review rejected")
    except (SOPNotFoundError, SOPInvalidStatusError, SOPReviewError) as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/{sop_id}/versions/{version_id}/request-revision", response_model=StandardResponse)
def request_revision(
    sop_id: str,
    version_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        review = _find_latest_review(service, sop_id)
        result = service.request_revision(review.id)
        return StandardResponse(success=True, data=_review_to_dict(result), message="revision requested")
    except (SOPNotFoundError, SOPInvalidStatusError, SOPReviewError) as exc:
        raise _map_sop_exception(exc) from exc


# ---------------------------------------------------------------------------
# SOP Template
# ---------------------------------------------------------------------------


@router.get("/templates", response_model=StandardResponse)
def list_templates(
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    templates = service.list_templates()
    return StandardResponse(
        success=True,
        data=[_template_to_dict(t) for t in templates],
        message="success",
    )


@router.get("/templates/{template_id}", response_model=StandardResponse)
def get_template(
    template_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        template = service.get_template(template_id)
        return StandardResponse(success=True, data=_template_to_dict(template), message="success")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/templates", response_model=StandardResponse)
def create_template(
    payload: TemplateCreate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    template = service.create_template(**payload.model_dump())
    return StandardResponse(success=True, data=_template_to_dict(template), message="template created")


@router.put("/templates/{template_id}", response_model=StandardResponse)
def update_template(
    template_id: str,
    payload: TemplateUpdate,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        template = service.update_template(template_id, payload.model_dump(exclude_unset=True))
        return StandardResponse(success=True, data=_template_to_dict(template), message="template updated")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc


@router.post("/templates/{template_id}/deactivate", response_model=StandardResponse)
def deactivate_template(
    template_id: str,
    service: SOPService = Depends(get_sop_service),
) -> StandardResponse:
    try:
        template = service.deactivate_template(template_id)
        return StandardResponse(success=True, data=_template_to_dict(template), message="template deactivated")
    except SOPNotFoundError as exc:
        raise _map_sop_exception(exc) from exc
