from sqlalchemy.orm import Session

from app.search.search_service import SearchResult, SearchService


class SearchGateway:
    def __init__(self, db: Session) -> None:
        self.service = SearchService(db)

    def top_chunks(self, question: str, limit: int = 5) -> list[SearchResult]:
        return self.service.search(question, limit=limit)
