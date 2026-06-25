from app.repositories.chat_repository import ChatRepository
from app.search.search_service import SearchResult


class CitationService:
    def __init__(self, repository: ChatRepository) -> None:
        self.repository = repository

    def persist(self, message_id: str, results: list[SearchResult]) -> None:
        for result in results:
            self.repository.add_citation(
                message_id,
                document_id=result.document_id,
                chunk_id=result.chunk_id,
                quote_text=result.content[:500],
                score=result.score,
                metadata=result.citation.model_dump(),
            )
