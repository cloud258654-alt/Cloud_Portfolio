from sqlalchemy.orm import Session

from app.repositories.chat_repository import ChatRepository
from app.search.search_service import SearchResult, SearchService


class ContextBuilder:
    max_context_tokens = 12000

    def __init__(self, db: Session) -> None:
        self.search = SearchService(db)
        self.chat_repository = ChatRepository(db)

    def build(
        self,
        *,
        question: str,
        conversation_id: str,
        department: str | None = None,
    ) -> tuple[str, list[SearchResult], list[dict]]:
        chunks = self.search.search(question, department=department, limit=5)
        history = self.chat_repository.messages(conversation_id, limit=20)
        history_payload = [
            {"sender": message.sender_type, "message": message.message}
            for message in history
        ]
        context_parts = [
            "Conversation History:",
            *[f"{item['sender']}: {item['message']}" for item in history_payload],
            "",
            "Retrieved Knowledge:",
            *[
                f"[{index + 1}] {result.document_title}: {result.content}"
                for index, result in enumerate(chunks)
            ],
        ]
        return "\n".join(context_parts)[: self.max_context_tokens * 4], chunks, history_payload
