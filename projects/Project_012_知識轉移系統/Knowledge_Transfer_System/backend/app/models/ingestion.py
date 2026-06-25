from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="queued")
    stage: Mapped[str] = mapped_column(String(100), default="queue")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    max_retries: Mapped[int] = mapped_column(Integer, default=3)
    error_message: Mapped[str | None] = mapped_column(Text)
    job_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    document_version_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.document_versions.id"), nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    section: Mapped[str | None] = mapped_column(String(255))
    page_number: Mapped[int | None] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    permission_scope: Mapped[str] = mapped_column(String(50), default="department")
    classification: Mapped[str] = mapped_column(String(50), default="internal")
    chunk_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)


class ChunkMetadata(Base):
    __tablename__ = "chunk_metadata"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    chunk_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.document_chunks.id"), nullable=False)
    language: Mapped[str | None] = mapped_column(String(50))
    keywords: Mapped[list] = mapped_column(JSONB, default=list)
    entities: Mapped[list] = mapped_column(JSONB, default=list)
    summary: Mapped[str | None] = mapped_column(Text)
    detail_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)


class EmbeddingJob(Base):
    __tablename__ = "embedding_jobs"
    __table_args__ = {"schema": "knowledge"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=False)
    chunk_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.document_chunks.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="queued")
    provider: Mapped[str | None] = mapped_column(String(100))
    model: Mapped[str | None] = mapped_column(String(150))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
