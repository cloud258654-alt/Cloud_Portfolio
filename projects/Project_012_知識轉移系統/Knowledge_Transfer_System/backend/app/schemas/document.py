from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


ALLOWED_FILE_TYPES = {
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "md",
    "csv",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "mp4",
    "mov",
    "mp3",
    "wav",
    "zip",
}


class DocumentCreate(BaseModel):
    title: str
    department_id: str | None = None
    category: str | None = None
    tags: list[str] = Field(default_factory=list)
    description: str | None = None
    permission_scope: str = "department"
    classification: str = "internal"
    language: str | None = None


class DocumentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    department_id: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    permission_scope: str | None = None
    classification: str | None = None
    status: str | None = None
    expire_at: datetime | None = None


class DocumentRead(BaseModel):
    id: str
    title: str
    description: str | None = None
    department_id: str | None = None
    file_type: str | None = None
    storage_path: str
    permission_scope: str
    classification: str
    status: str
    current_version: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DocumentList(BaseModel):
    items: list[DocumentRead]
    total: int
    page: int
    page_size: int


class DocumentDownload(BaseModel):
    filename: str
    url: str
    preview: bool = False
