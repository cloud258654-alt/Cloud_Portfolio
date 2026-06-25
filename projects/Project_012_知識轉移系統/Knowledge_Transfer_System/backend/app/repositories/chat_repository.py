from datetime import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chat import Citation, Conversation, ConversationMessage, Feedback


class ChatRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_conversation(self, title: str | None = None) -> Conversation:
        now = datetime.utcnow()
        conversation = Conversation(title=title, channel="web", chat_metadata={}, created_at=now, updated_at=now)
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def list_conversations(self) -> list[Conversation]:
        return list(
            self.db.scalars(
                select(Conversation)
                .where(Conversation.deleted_at.is_(None))
                .order_by(Conversation.updated_at.desc())
            ).all()
        )

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self.db.get(Conversation, conversation_id)

    def update_conversation(self, conversation_id: str, title: str) -> Conversation | None:
        conversation = self.get_conversation(conversation_id)
        if conversation is None:
            return None
        conversation.title = title
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def delete_conversation(self, conversation_id: str) -> None:
        conversation = self.get_conversation(conversation_id)
        if conversation is None:
            return
        conversation.deleted_at = datetime.utcnow()
        self.db.commit()

    def add_message(
        self,
        conversation_id: str,
        *,
        sender_type: str,
        message: str,
        model_name: str | None = None,
        token_usage: int = 0,
        confidence_score: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ConversationMessage:
        item = ConversationMessage(
            conversation_id=conversation_id,
            sender_type=sender_type,
            message=message,
            model_name=model_name,
            token_usage=token_usage,
            confidence_score=confidence_score,
            message_metadata=metadata or {},
            created_at=datetime.utcnow(),
        )
        self.db.add(item)
        conversation = self.get_conversation(conversation_id)
        if conversation is not None:
            conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(item)
        return item

    def messages(self, conversation_id: str, limit: int = 20) -> list[ConversationMessage]:
        return list(
            self.db.scalars(
                select(ConversationMessage)
                .where(ConversationMessage.conversation_id == conversation_id)
                .order_by(ConversationMessage.created_at.desc())
                .limit(limit)
            ).all()
        )[::-1]

    def add_citation(
        self,
        message_id: str,
        *,
        document_id: str,
        chunk_id: str | None,
        quote_text: str,
        score: float,
        metadata: dict[str, Any],
    ) -> Citation:
        citation = Citation(
            message_id=message_id,
            source_type="document_chunk",
            source_id=chunk_id or document_id,
            document_id=document_id,
            chunk_id=chunk_id,
            quote_text=quote_text,
            relevance_score=score,
            citation_metadata=metadata,
            created_at=datetime.utcnow(),
        )
        self.db.add(citation)
        self.db.commit()
        self.db.refresh(citation)
        return citation

    def add_feedback(self, payload: Feedback) -> Feedback:
        self.db.add(payload)
        self.db.commit()
        self.db.refresh(payload)
        return payload
