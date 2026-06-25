from datetime import datetime

from pydantic import BaseModel, Field


class IngestionJobRead(BaseModel):
    id: str
    document_id: str
    status: str
    stage: str
    progress: int
    retry_count: int
    max_retries: int
    error_message: str | None = None
    metadata: dict = Field(default_factory=dict)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DocumentChunkRead(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    title: str | None = None
    section: str | None = None
    page_number: int | None = None
    content: str
    token_count: int
    language: str | None = None
    metadata: dict = Field(default_factory=dict)


class DocumentProcessingStatus(BaseModel):
    document_id: str
    document_status: str
    ingestion: IngestionJobRead | None = None
    chunk_count: int = 0
    embedding_status: str = "not_started"
    language: str | None = None
    summary: str | None = None
