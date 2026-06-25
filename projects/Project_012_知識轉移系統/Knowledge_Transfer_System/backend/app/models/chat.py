from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = {"schema": "ai"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    title: Mapped[str | None] = mapped_column(String(255))
    channel: Mapped[str] = mapped_column(String(50), default="web")
    chat_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    __table_args__ = {"schema": "ai"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    conversation_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("ai.conversations.id"), nullable=False)
    sender_type: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str | None] = mapped_column(String(150))
    token_usage: Mapped[int] = mapped_column(Integer, default=0)
    confidence_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    message_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)


class Citation(Base):
    __tablename__ = "citations"
    __table_args__ = {"schema": "ai"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    message_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("ai.conversation_messages.id"), nullable=False)
    source_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    document_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.documents.id"), nullable=True)
    chunk_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("knowledge.document_chunks.id"), nullable=True)
    page_number: Mapped[int | None] = mapped_column(Integer)
    quote_text: Mapped[str | None] = mapped_column(Text)
    relevance_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    citation_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)


class Feedback(Base):
    __tablename__ = "feedbacks"
    __table_args__ = {"schema": "ai"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    message_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("ai.conversation_messages.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer)
    feedback_type: Mapped[str | None] = mapped_column(String(100))
    comment: Mapped[str | None] = mapped_column(Text)
    feedback_metadata: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime | None] = mapped_column(DateTime)
