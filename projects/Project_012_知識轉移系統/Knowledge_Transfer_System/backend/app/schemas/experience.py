from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


ALLOWED_EXPERIENCE_TYPES = {"mp3", "wav", "mp4", "mov", "m4a"}


class ExperienceCreate(BaseModel):
    title: str
    source_type: str = "interview"
    category: str | None = None
    expert_name: str | None = None
    department_id: str | None = None


class ExperienceRead(BaseModel):
    id: str
    title: str
    source_type: str | None = None
    category: str | None = None
    expert_name: str | None = None
    raw_storage_path: str | None = None
    transcript: str | None = None
    summary: str | None = None
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ExperienceSegmentRead(BaseModel):
    id: str
    segment_index: int
    speaker: str | None = None
    start_time: float | None = None
    end_time: float | None = None
    text: str
    confidence: float | None = None


class ExperiencePackage(BaseModel):
    transcript: str
    summary: dict[str, Any]
    faq: list[dict[str, Any]]
    best_practices: list[dict[str, Any]]
    keywords: list[str]
    tags: list[str]
    related_documents: list[str] = Field(default_factory=list)
