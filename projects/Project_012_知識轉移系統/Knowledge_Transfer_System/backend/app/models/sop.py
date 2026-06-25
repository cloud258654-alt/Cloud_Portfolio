from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SOPTemplate(Base):
    __tablename__ = "sop_templates"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    template_type: Mapped[str] = mapped_column(String(100), default="standard")
    structure: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(default=True)
    template_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)

    sops: Mapped[list["SOP"]] = relationship(back_populates="template")


class SOP(Base):
    __tablename__ = "sops"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    template_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sop_templates.id"), nullable=True)
    department_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("org.departments.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    sop_type: Mapped[str | None] = mapped_column(String(100))
    purpose: Mapped[str | None] = mapped_column(Text)
    scope: Mapped[str | None] = mapped_column(Text)
    responsible_role: Mapped[str | None] = mapped_column(String(150))
    required_materials: Mapped[list] = mapped_column(JSONB, default=list)
    prerequisites: Mapped[list] = mapped_column(JSONB, default=list)
    content: Mapped[dict] = mapped_column(JSONB, default=dict)
    mermaid_flowchart: Mapped[str | None] = mapped_column(Text)
    version_no: Mapped[str] = mapped_column(String(50), default="v1.0")
    permission_scope: Mapped[str] = mapped_column(String(50), default="department")
    classification: Mapped[str] = mapped_column(String(50), default="internal")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    source_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    sop_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime)
    published_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)

    template: Mapped[SOPTemplate | None] = relationship(back_populates="sops")
    versions: Mapped[list["SOPVersion"]] = relationship(back_populates="sop")
    steps: Mapped[list["SOPStep"]] = relationship(back_populates="sop")
    reviews: Mapped[list["SOPReview"]] = relationship(back_populates="sop")
    attachments: Mapped[list["SOPAttachment"]] = relationship(back_populates="sop")


class SOPVersion(Base):
    __tablename__ = "sop_versions"
    __table_args__ = (
        UniqueConstraint("sop_id", "version_no"),
        {"schema": "knowledge"},
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    sop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sops.id"), nullable=False)
    version_no: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[dict] = mapped_column(JSONB, default=dict)
    mermaid_flowchart: Mapped[str | None] = mapped_column(Text)
    change_note: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    version_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)

    sop: Mapped[SOP] = relationship(back_populates="versions")
    steps: Mapped[list["SOPStep"]] = relationship(back_populates="sop_version")
    reviews: Mapped[list["SOPReview"]] = relationship(back_populates="sop_version")
    attachments: Mapped[list["SOPAttachment"]] = relationship(back_populates="sop_version")


class SOPStep(Base):
    __tablename__ = "sop_steps"
    __table_args__ = (
        UniqueConstraint("sop_id", "step_no"),
        {"schema": "knowledge"},
    )

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    sop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sops.id"), nullable=False)
    sop_version_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sop_versions.id"), nullable=True)
    step_no: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    expected_result: Mapped[str | None] = mapped_column(Text)
    screenshot_path: Mapped[str | None] = mapped_column(Text)
    warning: Mapped[str | None] = mapped_column(Text)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=0)
    step_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)

    sop: Mapped[SOP] = relationship(back_populates="steps")
    sop_version: Mapped[SOPVersion | None] = relationship(back_populates="steps")


class SOPReview(Base):
    __tablename__ = "sop_reviews"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    sop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sops.id"), nullable=False)
    sop_version_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sop_versions.id"), nullable=True)
    reviewer_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    review_status: Mapped[str] = mapped_column(String(50), default="pending")
    review_comment: Mapped[str | None] = mapped_column(Text)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime)
    review_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)

    sop: Mapped[SOP] = relationship(back_populates="reviews")
    sop_version: Mapped[SOPVersion | None] = relationship(back_populates="reviews")


class SOPAttachment(Base):
    __tablename__ = "sop_attachments"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    sop_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sops.id"), nullable=False)
    sop_version_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.sop_versions.id"), nullable=True)
    attachment_type: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)

    sop: Mapped[SOP] = relationship(back_populates="attachments")
    sop_version: Mapped[SOPVersion | None] = relationship(back_populates="attachments")
