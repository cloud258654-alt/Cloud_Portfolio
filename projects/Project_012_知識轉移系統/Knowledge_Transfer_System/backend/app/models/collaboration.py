from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DocumentComment(Base):
    __tablename__ = "document_comments"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    author_name: Mapped[str] = mapped_column(String(100), default="Anonymous")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    parent_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)


class KnowledgeRequest(Base):
    __tablename__ = "knowledge_requests"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    requested_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    requestor_name: Mapped[str] = mapped_column(String(100), default="Anonymous")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="open")
    assigned_to: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("auth.users.id"), nullable=True)
    resulting_document_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    request_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)
