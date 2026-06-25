from datetime import datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.sop import (
    SOP,
    SOPAttachment,
    SOPReview,
    SOPStep,
    SOPTemplate,
    SOPVersion,
)


class SOPRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    # ------------------------------------------------------------------
    # SOPTemplate
    # ------------------------------------------------------------------

    def list_templates(self, *, is_active: bool | None = True) -> list[SOPTemplate]:
        statement = select(SOPTemplate).where(SOPTemplate.deleted_at.is_(None))
        if is_active is not None:
            statement = statement.where(SOPTemplate.is_active == is_active)
        return list(self.db.scalars(statement.order_by(SOPTemplate.name.asc())).all())

    def get_template(self, template_id: str) -> SOPTemplate | None:
        return self.db.get(SOPTemplate, template_id)

    # ------------------------------------------------------------------
    # SOP
    # ------------------------------------------------------------------

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
        created_by: str | None = None,
    ) -> SOP:
        now = datetime.utcnow()
        sop = SOP(
            template_id=template_id,
            department_id=department_id,
            title=title,
            sop_type=sop_type,
            purpose=purpose,
            scope=scope,
            responsible_role=responsible_role,
            required_materials=required_materials or [],
            prerequisites=prerequisites or [],
            content=content or {},
            mermaid_flowchart=mermaid_flowchart,
            version_no="v1.0",
            permission_scope=permission_scope,
            classification=classification,
            status="draft",
            source_metadata=source_metadata or {},
            sop_metadata=metadata or {},
            created_by=created_by,
            created_at=now,
            updated_at=now,
        )
        self.db.add(sop)
        self.db.flush()
        self.db.add(
            SOPVersion(
                sop_id=sop.id,
                version_no="v1.0",
                content=content or {},
                mermaid_flowchart=mermaid_flowchart,
                change_note="Initial version",
                created_by=created_by,
                version_metadata={},
                created_at=now,
            )
        )
        self.db.commit()
        self.db.refresh(sop)
        return sop

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
        statement = select(SOP).where(SOP.deleted_at.is_(None))
        count_statement = select(func.count()).select_from(SOP).where(SOP.deleted_at.is_(None))

        if keyword:
            pattern = f"%{keyword}%"
            statement = statement.where(SOP.title.ilike(pattern))
            count_statement = count_statement.where(SOP.title.ilike(pattern))
        if status:
            statement = statement.where(SOP.status == status)
            count_statement = count_statement.where(SOP.status == status)
        if sop_type:
            statement = statement.where(SOP.sop_type == sop_type)
            count_statement = count_statement.where(SOP.sop_type == sop_type)
        if department_id:
            statement = statement.where(SOP.department_id == department_id)
            count_statement = count_statement.where(SOP.department_id == department_id)
        if template_id:
            statement = statement.where(SOP.template_id == template_id)
            count_statement = count_statement.where(SOP.template_id == template_id)

        total = self.db.scalar(count_statement) or 0
        items = self.db.scalars(
            statement.order_by(SOP.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all()
        return list(items), total

    def get_sop(self, sop_id: str) -> SOP | None:
        return self.db.get(SOP, sop_id)

    def update_sop(self, sop: SOP, values: dict[str, Any]) -> SOP:
        metadata = dict(sop.sop_metadata or {})
        for key in ("category", "tags"):
            if key in values:
                metadata[key] = values.pop(key)
        for key, value in values.items():
            if value is not None and hasattr(sop, key):
                setattr(sop, key, value)
        sop.sop_metadata = metadata
        sop.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(sop)
        return sop

    def soft_delete_sop(self, sop: SOP) -> SOP:
        sop.status = "deleted"
        sop.deleted_at = datetime.utcnow()
        sop.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(sop)
        return sop

    def restore_sop(self, sop: SOP) -> SOP:
        sop.status = "draft"
        sop.deleted_at = None
        sop.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(sop)
        return sop

    # ------------------------------------------------------------------
    # SOPVersion
    # ------------------------------------------------------------------

    def create_version(
        self,
        *,
        sop_id: str,
        version_no: str,
        content: dict | None = None,
        mermaid_flowchart: str | None = None,
        change_note: str | None = None,
        created_by: str | None = None,
        metadata: dict | None = None,
    ) -> SOPVersion:
        now = datetime.utcnow()
        version = SOPVersion(
            sop_id=sop_id,
            version_no=version_no,
            content=content or {},
            mermaid_flowchart=mermaid_flowchart,
            change_note=change_note,
            created_by=created_by,
            version_metadata=metadata or {},
            created_at=now,
        )
        self.db.add(version)
        sop = self.db.get(SOP, sop_id)
        if sop is not None:
            sop.version_no = version_no
            sop.content = content or {}
            sop.mermaid_flowchart = mermaid_flowchart
            sop.updated_at = now
        self.db.commit()
        self.db.refresh(version)
        return version

    def list_versions(self, sop_id: str) -> list[SOPVersion]:
        return list(
            self.db.scalars(
                select(SOPVersion)
                .where(SOPVersion.sop_id == sop_id)
                .order_by(SOPVersion.created_at.desc())
            ).all()
        )

    def get_version(self, version_id: str) -> SOPVersion | None:
        return self.db.get(SOPVersion, version_id)

    # ------------------------------------------------------------------
    # SOPStep
    # ------------------------------------------------------------------

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
        now = datetime.utcnow()
        step = SOPStep(
            sop_id=sop_id,
            sop_version_id=sop_version_id,
            step_no=step_no,
            title=title,
            action=action,
            description=description,
            expected_result=expected_result,
            screenshot_path=screenshot_path,
            warning=warning,
            estimated_minutes=estimated_minutes,
            step_metadata=metadata or {},
            created_at=now,
            updated_at=now,
        )
        self.db.add(step)
        sop = self.db.get(SOP, sop_id)
        if sop is not None:
            sop.updated_at = now
        self.db.commit()
        self.db.refresh(step)
        return step

    def update_step(self, step: SOPStep, values: dict[str, Any]) -> SOPStep:
        metadata = dict(step.step_metadata or {})
        for key in ("notes",):
            if key in values:
                metadata[key] = values.pop(key)
        for key, value in values.items():
            if value is not None and hasattr(step, key):
                setattr(step, key, value)
        step.step_metadata = metadata
        step.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(step)
        return step

    def delete_step(self, step_id: str) -> None:
        step = self.db.get(SOPStep, step_id)
        if step is not None:
            self.db.delete(step)
            self.db.commit()

    def list_steps(self, sop_id: str) -> list[SOPStep]:
        return list(
            self.db.scalars(
                select(SOPStep)
                .where(SOPStep.sop_id == sop_id)
                .order_by(SOPStep.step_no.asc())
            ).all()
        )

    def reorder_steps(self, sop_id: str, step_ids: list[str]) -> None:
        now = datetime.utcnow()
        for index, step_id in enumerate(step_ids, start=1):
            step = self.db.get(SOPStep, step_id)
            if step is not None and step.sop_id == sop_id:
                step.step_no = index
                step.updated_at = now
        self.db.commit()

    # ------------------------------------------------------------------
    # SOPReview
    # ------------------------------------------------------------------

    def create_review(
        self,
        *,
        sop_id: str,
        reviewer_id: str | None = None,
        sop_version_id: str | None = None,
        review_status: str = "pending",
        review_comment: str | None = None,
        metadata: dict | None = None,
    ) -> SOPReview:
        now = datetime.utcnow()
        review = SOPReview(
            sop_id=sop_id,
            sop_version_id=sop_version_id,
            reviewer_id=reviewer_id,
            review_status=review_status,
            review_comment=review_comment,
            review_metadata=metadata or {},
            created_at=now,
        )
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def list_reviews(self, sop_id: str) -> list[SOPReview]:
        return list(
            self.db.scalars(
                select(SOPReview)
                .where(SOPReview.sop_id == sop_id)
                .order_by(SOPReview.created_at.desc())
            ).all()
        )

    def update_review(self, review: SOPReview, values: dict[str, Any]) -> SOPReview:
        for key, value in values.items():
            if value is not None and hasattr(review, key):
                setattr(review, key, value)
        if values.get("review_status") in {"approved", "rejected"}:
            review.reviewed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(review)
        return review

    # ------------------------------------------------------------------
    # SOPAttachment
    # ------------------------------------------------------------------

    def add_attachment(
        self,
        *,
        sop_id: str,
        attachment_type: str,
        storage_path: str,
        title: str | None = None,
        sop_version_id: str | None = None,
        metadata: dict | None = None,
    ) -> SOPAttachment:
        now = datetime.utcnow()
        attachment = SOPAttachment(
            sop_id=sop_id,
            sop_version_id=sop_version_id,
            attachment_type=attachment_type,
            title=title,
            storage_path=storage_path,
            attachment_metadata=metadata or {},
            created_at=now,
        )
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        return attachment

    def list_attachments(self, sop_id: str) -> list[SOPAttachment]:
        return list(
            self.db.scalars(
                select(SOPAttachment)
                .where(SOPAttachment.sop_id == sop_id)
                .order_by(SOPAttachment.created_at.desc())
            ).all()
        )

    def delete_attachment(self, attachment_id: str) -> None:
        attachment = self.db.get(SOPAttachment, attachment_id)
        if attachment is not None:
            self.db.delete(attachment)
            self.db.commit()
