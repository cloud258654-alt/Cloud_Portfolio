from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    department_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("org.departments.id"), nullable=True)
    uploaded_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    file_type: Mapped[str | None] = mapped_column(String(50))
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    permission_scope: Mapped[str] = mapped_column(String(50), default="department")
    classification: Mapped[str] = mapped_column(String(50), default="internal")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    current_version: Mapped[str] = mapped_column(String(50), default="v1.0.0")
    expire_at: Mapped[datetime | None] = mapped_column(DateTime)
    doc_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)

    versions: Mapped[list["DocumentVersion"]] = relationship(back_populates="document")


class DocumentVersion(Base):
    __tablename__ = "document_versions"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    version_no: Mapped[str] = mapped_column(String(50), nullable=False)
    file_hash: Mapped[str | None] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    change_note: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    version_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)

    document: Mapped[Document] = relationship(back_populates="versions")


class DocumentFavorite(Base):
    __tablename__ = "document_favorites"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)


class DocumentActivity(Base):
    __tablename__ = "document_activities"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    result: Mapped[str] = mapped_column(String(50), default="success")
    activity_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
