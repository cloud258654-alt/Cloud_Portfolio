from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.sop import (
    SOP,
    SOPAttachment,
    SOPReview,
    SOPStep,
    SOPTemplate,
    SOPVersion,
)
from app.repositories.sop_repository import SOPRepository


# ---------------------------------------------------------------------------
# SOP-specific exceptions
# ---------------------------------------------------------------------------


class SOPNotFoundError(AppException):
    code = "SOP_NOT_FOUND"

    def __init__(self, message: str = "SOP not found") -> None:
        super().__init__(message, code=self.code)


class SOPInvalidStatusError(AppException):
    code = "SOP_INVALID_STATUS"

    def __init__(self, message: str = "Invalid SOP status transition") -> None:
        super().__init__(message, code=self.code)


class SOPPublishValidationError(AppException):
    code = "SOP_PUBLISH_VALIDATION_ERROR"

    def __init__(self, message: str = "SOP does not meet publish requirements") -> None:
        super().__init__(message, code=self.code)


class SOPVersionError(AppException):
    code = "SOP_VERSION_ERROR"

    def __init__(self, message: str = "SOP version error") -> None:
        super().__init__(message, code=self.code)


class SOPReviewError(AppException):
    code = "SOP_REVIEW_ERROR"

    def __init__(self, message: str = "SOP review error") -> None:
        super().__init__(message, code=self.code)


# ---------------------------------------------------------------------------
# Status transition map
# ---------------------------------------------------------------------------

_ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"review", "deleted"},
    "review": {"approved", "draft"},
    "approved": {"published", "archived"},
    "published": {"archived"},
    "archived": {"draft"},
    "deleted": set(),
}


def _validate_status_transition(current: str, target: str) -> None:
    allowed = _ALLOWED_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise SOPInvalidStatusError(
            f"Cannot transition SOP from '{current}' to '{target}'"
        )


# ---------------------------------------------------------------------------
# SOPService
# ---------------------------------------------------------------------------


class SOPService:
    def __init__(self, db: Session) -> None:
        self.repository = SOPRepository(db)

    # ==================================================================
    # SOP CRUD
    # ==================================================================

    def create_sop(
        self,
        *,
        title: str,
        sop_type: str | None = None,
        template_id: str | None = None,
        department_id: str | None = None,
        purpose: str | None = None,
        scope: str | None = None,
        responsible_role: str | None = None,
        required_materials: list | None = None,
        prerequisites: list | None = None,
        content: dict | None = None,
        mermaid_flowchart: str | None = None,
        permission_scope: str = "department",
        classification: str = "internal",
        source_metadata: dict | None = None,
        metadata: dict | None = None,
        current_user_id: str | None = None,
    ) -> SOP:
        # TODO: audit log - sop created
        # TODO: permission check - current_user_id, department_id
        return self.repository.create_sop(
            title=title,
            sop_type=sop_type,
            template_id=template_id,
            department_id=department_id,
            purpose=purpose,
            scope=scope,
            responsible_role=responsible_role,
            required_materials=required_materials,
            prerequisites=prerequisites,
            content=content,
            mermaid_flowchart=mermaid_flowchart,
            permission_scope=permission_scope,
            classification=classification,
            source_metadata=source_metadata,
            metadata=metadata,
            created_by=current_user_id,
        )

    def update_sop(
        self,
        sop_id: str,
        values: dict[str, Any],
        *,
        current_user_id: str | None = None,
    ) -> SOP:
        sop = self._require_sop(sop_id)
        # TODO: audit log - sop updated
        # TODO: permission check - current_user_id, sop.department_id
        return self.repository.update_sop(sop, values)

    def get_sop(self, sop_id: str) -> SOP:
        return self._require_sop(sop_id)

    def list_sops(
        self,
        *,
        keyword: str | None = None,
        status: str | None = None,
        sop_type: str | None = None,
        department_id: str | None = None,
        template_id: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[SOP], int]:
        return self.repository.list_sops(
            keyword=keyword,
            status=status,
            sop_type=sop_type,
            department_id=department_id,
            template_id=template_id,
            page=page,
            page_size=page_size,
        )

    def list_sops_by_department(self, department_id: str) -> list[SOP]:
        items, _ = self.repository.list_sops(department_id=department_id, page_size=1000)
        return items

    def soft_delete_sop(
        self,
        sop_id: str,
        *,
        current_user_id: str | None = None,
    ) -> SOP:
        sop = self._require_sop(sop_id)
        _validate_status_transition(sop.status, "deleted")
        # TODO: audit log - sop deleted
        # TODO: permission check - current_user_id, sop.department_id
        return self.repository.soft_delete_sop(sop)

    def restore_sop(
        self,
        sop_id: str,
        *,
        current_user_id: str | None = None,
    ) -> SOP:
        sop = self._require_sop(sop_id)
        if sop.status != "deleted":
            raise SOPInvalidStatusError(
                f"Only deleted SOPs can be restored, current status: '{sop.status}'"
            )
        # TODO: audit log - sop restored
        return self.repository.restore_sop(sop)

    def publish_sop(
        self,
        sop_id: str,
        *,
        current_user_id: str | None = None,
    ) -> SOP:
        sop = self._require_sop(sop_id)
        _validate_status_transition(sop.status, "published")

        if not sop.title:
            raise SOPPublishValidationError("SOP must have a title before publishing")
        if not sop.version_no:
            raise SOPPublishValidationError("SOP must have a current version before publishing")
        steps = self.repository.list_steps(sop_id)
        if not steps:
            raise SOPPublishValidationError("SOP must have at least one step before publishing")

        # TODO: audit log - sop published
        # TODO: permission check - current_user_id, sop.department_id
        now = datetime.utcnow()
        sop.status = "published"
        sop.published_at = now
        sop.approved_at = now
        sop.updated_at = now
        self.repository.db.commit()
        self.repository.db.refresh(sop)
        return sop

    def archive_sop(
        self,
        sop_id: str,
        *,
        current_user_id: str | None = None,
    ) -> SOP:
        sop = self._require_sop(sop_id)
        if sop.status not in {"published", "approved"}:
            raise SOPInvalidStatusError(
                f"Only published or approved SOPs can be archived, current status: '{sop.status}'"
            )
        _validate_status_transition(sop.status, "archived")
        # TODO: audit log - sop archived
        return self.repository.update_sop(sop, {"status": "archived"})

    # ==================================================================
    # SOPTemplate
    # ==================================================================

    def create_template(
        self,
        *,
        name: str,
        description: str | None = None,
        template_type: str = "standard",
        structure: dict | None = None,
        metadata: dict | None = None,
    ) -> SOPTemplate:
        now = datetime.utcnow()
        template = SOPTemplate(
            name=name,
            description=description,
            template_type=template_type,
            structure=structure or {},
            is_active=True,
            template_metadata=metadata or {},
            created_at=now,
            updated_at=now,
        )
        self.repository.db.add(template)
        self.repository.db.commit()
        self.repository.db.refresh(template)
        return template

    def update_template(
        self,
        template_id: str,
        values: dict[str, Any],
    ) -> SOPTemplate:
        template = self._require_template(template_id)
        for key, value in values.items():
            if value is not None and hasattr(template, key):
                setattr(template, key, value)
        template.updated_at = datetime.utcnow()
        self.repository.db.commit()
        self.repository.db.refresh(template)
        return template

    def get_template(self, template_id: str) -> SOPTemplate:
        return self._require_template(template_id)

    def list_templates(self, *, is_active: bool | None = True) -> list[SOPTemplate]:
        return self.repository.list_templates(is_active=is_active)

    def deactivate_template(self, template_id: str) -> SOPTemplate:
        template = self._require_template(template_id)
        template.is_active = False
        template.updated_at = datetime.utcnow()
        self.repository.db.commit()
        self.repository.db.refresh(template)
        return template

    # ==================================================================
    # SOPVersion
    # ==================================================================

    def create_version(
        self,
        sop_id: str,
        *,
        version_no: str,
        content: dict | None = None,
        mermaid_flowchart: str | None = None,
        change_note: str | None = None,
        current_user_id: str | None = None,
        metadata: dict | None = None,
    ) -> SOPVersion:
        self._require_sop(sop_id)
        # TODO: audit log - version created
        return self.repository.create_version(
            sop_id=sop_id,
            version_no=version_no,
            content=content,
            mermaid_flowchart=mermaid_flowchart,
            change_note=change_note,
            created_by=current_user_id,
            metadata=metadata,
        )

    def get_current_version(self, sop_id: str) -> SOPVersion:
        sop = self._require_sop(sop_id)
        versions = self.repository.list_versions(sop_id)
        current = next((v for v in versions if v.version_no == sop.version_no), None)
        if current is None:
            raise SOPVersionError(f"No version matching current version_no '{sop.version_no}'")
        return current

    def list_versions(self, sop_id: str) -> list[SOPVersion]:
        self._require_sop(sop_id)
        return self.repository.list_versions(sop_id)

    def rollback_to_version(
        self,
        sop_id: str,
        version_id: str,
        *,
        current_user_id: str | None = None,
    ) -> SOPVersion:
        sop = self._require_sop(sop_id)
        source = self.repository.get_version(version_id)
        if source is None or source.sop_id != sop_id:
            raise SOPVersionError("Target version not found or does not belong to this SOP")

        parts = sop.version_no.lstrip("v").split(".")
        major = int(parts[0]) if len(parts) > 0 else 1
        minor = int(parts[1]) if len(parts) > 1 else 0
        patch = int(parts[2]) if len(parts) > 2 else 0
        new_version_no = f"v{major}.{minor}.{patch + 1}"

        # TODO: audit log - version rollback
        return self.repository.create_version(
            sop_id=sop_id,
            version_no=new_version_no,
            content=source.content,
            mermaid_flowchart=source.mermaid_flowchart,
            change_note=f"Rollback to version {source.version_no}",
            created_by=current_user_id,
            metadata={"rolled_back_from": source.id, "rolled_back_from_version": source.version_no},
        )

    # ==================================================================
    # SOPStep
    # ==================================================================

    def add_step(
        self,
        *,
        sop_id: str,
        step_no: int,
        action: str,
        title: str | None = None,
        description: str | None = None,
        expected_result: str | None = None,
        screenshot_path: str | None = None,
        warning: str | None = None,
        estimated_minutes: int = 0,
        sop_version_id: str | None = None,
        metadata: dict | None = None,
    ) -> SOPStep:
        self._require_sop(sop_id)
        # TODO: audit log - step added
        return self.repository.add_step(
            sop_id=sop_id,
            step_no=step_no,
            action=action,
            title=title,
            description=description,
            expected_result=expected_result,
            screenshot_path=screenshot_path,
            warning=warning,
            estimated_minutes=estimated_minutes,
            sop_version_id=sop_version_id,
            metadata=metadata,
        )

    def update_step(self, step_id: str, values: dict[str, Any]) -> SOPStep:
        step = self._require_step(step_id)
        # TODO: audit log - step updated
        return self.repository.update_step(step, values)

    def delete_step(self, step_id: str) -> None:
        self._require_step(step_id)
        self.repository.delete_step(step_id)

    def reorder_steps(self, sop_id: str, step_ids: list[str]) -> None:
        self._require_sop(sop_id)
        self.repository.reorder_steps(sop_id, step_ids)

    def list_steps(self, sop_id: str) -> list[SOPStep]:
        self._require_sop(sop_id)
        return self.repository.list_steps(sop_id)

    # ==================================================================
    # SOPReview
    # ==================================================================

    def submit_for_review(
        self,
        sop_id: str,
        *,
        reviewer_id: str | None = None,
        sop_version_id: str | None = None,
        current_user_id: str | None = None,
    ) -> SOPReview:
        sop = self._require_sop(sop_id)
        _validate_status_transition(sop.status, "review")
        sop.status = "review"
        sop.updated_at = datetime.utcnow()
        # TODO: audit log - sop submitted for review
        review = self.repository.create_review(
            sop_id=sop_id,
            reviewer_id=reviewer_id,
            sop_version_id=sop_version_id,
            review_status="pending",
            metadata={"submitted_by": current_user_id},
        )
        self.repository.db.commit()
        self.repository.db.refresh(sop)
        return review

    def approve_review(
        self,
        review_id: str,
        *,
        comment: str | None = None,
        current_user_id: str | None = None,
    ) -> SOPReview:
        review = self._require_review(review_id)
        if review.review_status not in {"pending", "need_revision"}:
            raise SOPReviewError(
                f"Cannot approve review with status '{review.review_status}'"
            )
        sop = self._require_sop(review.sop_id)
        _validate_status_transition(sop.status, "approved")
        sop.status = "approved"
        sop.approved_by = current_user_id
        sop.approved_at = datetime.utcnow()
        sop.updated_at = sop.approved_at
        # TODO: audit log - review approved
        updated = self.repository.update_review(
            review,
            {"review_status": "approved", "review_comment": comment},
        )
        self.repository.db.commit()
        self.repository.db.refresh(sop)
        return updated

    def reject_review(
        self,
        review_id: str,
        *,
        comment: str | None = None,
        current_user_id: str | None = None,
    ) -> SOPReview:
        review = self._require_review(review_id)
        if review.review_status not in {"pending", "need_revision"}:
            raise SOPReviewError(
                f"Cannot reject review with status '{review.review_status}'"
            )
        sop = self._require_sop(review.sop_id)
        sop.status = "draft"
        sop.updated_at = datetime.utcnow()
        # TODO: audit log - review rejected
        updated = self.repository.update_review(
            review,
            {"review_status": "rejected", "review_comment": comment},
        )
        self.repository.db.commit()
        self.repository.db.refresh(sop)
        return updated

    def request_revision(
        self,
        review_id: str,
        *,
        comment: str | None = None,
        current_user_id: str | None = None,
    ) -> SOPReview:
        review = self._require_review(review_id)
        if review.review_status not in {"pending", "need_revision"}:
            raise SOPReviewError(
                f"Cannot request revision for review with status '{review.review_status}'"
            )
        sop = self._require_sop(review.sop_id)
        sop.status = "draft"
        sop.updated_at = datetime.utcnow()
        # TODO: audit log - review revision requested
        updated = self.repository.update_review(
            review,
            {"review_status": "need_revision", "review_comment": comment},
        )
        self.repository.db.commit()
        self.repository.db.refresh(sop)
        return updated

    def list_reviews(self, sop_id: str) -> list[SOPReview]:
        self._require_sop(sop_id)
        return self.repository.list_reviews(sop_id)

    # ==================================================================
    # SOPAttachment
    # ==================================================================

    def add_attachment(
        self,
        *,
        sop_id: str,
        attachment_type: str,
        storage_path: str,
        title: str | None = None,
        sop_version_id: str | None = None,
        metadata: dict | None = None,
        current_user_id: str | None = None,
    ) -> SOPAttachment:
        self._require_sop(sop_id)
        # TODO: audit log - attachment added
        return self.repository.add_attachment(
            sop_id=sop_id,
            attachment_type=attachment_type,
            storage_path=storage_path,
            title=title,
            sop_version_id=sop_version_id,
            metadata=metadata,
        )

    def list_attachments(self, sop_id: str) -> list[SOPAttachment]:
        self._require_sop(sop_id)
        return self.repository.list_attachments(sop_id)

    def remove_attachment(self, attachment_id: str) -> None:
        attachment = self._require_attachment(attachment_id)
        self.repository.delete_attachment(attachment_id)

    # ==================================================================
    # Internal helpers
    # ==================================================================

    def _require_sop(self, sop_id: str) -> SOP:
        sop = self.repository.get_sop(sop_id)
        if sop is None:
            raise SOPNotFoundError(f"SOP '{sop_id}' not found")
        return sop

    def _require_template(self, template_id: str) -> SOPTemplate:
        template = self.repository.get_template(template_id)
        if template is None:
            raise SOPNotFoundError(f"SOP template '{template_id}' not found")
        return template

    def _require_step(self, step_id: str) -> SOPStep:
        step = self.repository.db.get(SOPStep, step_id)
        if step is None:
            raise SOPNotFoundError(f"SOPStep '{step_id}' not found")
        return step

    def _require_review(self, review_id: str) -> SOPReview:
        review = self.repository.db.get(SOPReview, review_id)
        if review is None:
            raise SOPNotFoundError(f"SOPReview '{review_id}' not found")
        return review

    def _require_attachment(self, attachment_id: str) -> SOPAttachment:
        attachment = self.repository.db.get(SOPAttachment, attachment_id)
        if attachment is None:
            raise SOPNotFoundError(f"SOPAttachment '{attachment_id}' not found")
        return attachment
