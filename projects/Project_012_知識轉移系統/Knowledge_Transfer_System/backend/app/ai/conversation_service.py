from datetime import datetime

from app.core.exceptions import AppException
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import ConversationDetail, ConversationSummary


class ConversationService:
    def __init__(self, repository: ChatRepository) -> None:
        self.repository = repository

    def list(self) -> list[ConversationSummary]:
        return [
            ConversationSummary(
                id=item.id,
                title=item.title,
                channel=item.channel,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
            for item in self.repository.list_conversations()
        ]

    def detail(self, conversation_id: str) -> ConversationDetail:
        conversation = self.repository.get_conversation(conversation_id)
        if conversation is None:
            raise AppException("Conversation not found", code="CONVERSATION_NOT_FOUND")
        messages = [
            {
                "id": item.id,
                "sender_type": item.sender_type,
                "message": item.message,
                "created_at": item.created_at.isoformat() if isinstance(item.created_at, datetime) else None,
            }
            for item in self.repository.messages(conversation_id)
        ]
        return ConversationDetail(id=conversation.id, title=conversation.title, messages=messages)
