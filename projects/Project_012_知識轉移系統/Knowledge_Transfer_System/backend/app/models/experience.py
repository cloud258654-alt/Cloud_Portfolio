from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ExperienceRecord(Base):
    __tablename__ = "experience_records"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    created_by: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    department_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str | None] = mapped_column(String(100))
    category: Mapped[str | None] = mapped_column(String(100))
    expert_name: Mapped[str | None] = mapped_column(String(150))
    raw_storage_path: Mapped[str | None] = mapped_column(Text)
    transcript: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
    permission_scope: Mapped[str] = mapped_column(String(50), default="department")
    classification: Mapped[str] = mapped_column(String(50), default="internal")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    experience_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)


class ExperienceSegment(Base):
    __tablename__ = "experience_segments"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    experience_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.experience_records.id"), nullable=False)
    segment_index: Mapped[int] = mapped_column(Integer, nullable=False)
    speaker: Mapped[str | None] = mapped_column(String(100))
    start_time: Mapped[float | None] = mapped_column(Float)
    end_time: Mapped[float | None] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float)
    segment_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
