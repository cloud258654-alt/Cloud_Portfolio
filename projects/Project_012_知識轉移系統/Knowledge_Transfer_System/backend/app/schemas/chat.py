from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str
    conversation_id: str | None = None
    stream: bool = False


class CitationRead(BaseModel):
    document_id: str
    document_title: str
    version: str | None = None
    page: int | None = None
    chunk_id: str | None = None
    section: str | None = None
    score: float


class ChatAnswer(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    citations: list[CitationRead] = Field(default_factory=list)
    confidence: float = 0.0
    confidence_tier: str = "uncertain"
    grounding_ratio: float = 0.0
    suggested_questions: list[str] = Field(default_factory=list)


class ConversationSummary(BaseModel):
    id: str
    title: str | None = None
    channel: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ConversationDetail(BaseModel):
    id: str
    title: str | None = None
    messages: list[dict[str, Any]] = Field(default_factory=list)


class ConversationUpdate(BaseModel):
    title: str


class FeedbackCreate(BaseModel):
    message_id: str
    rating: int | None = None
    feedback_type: str | None = None
    comment: str | None = None
