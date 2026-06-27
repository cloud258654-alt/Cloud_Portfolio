from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.search.citation_builder import CitationBuilder, SearchCitation
from app.search.hybrid_engine import HybridSearchEngine
from app.services.embedding_service import EmbeddingService


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    content: str
    score: float
    citation: SearchCitation


class SearchService:
    def __init__(self, db: Session) -> None:
        self.engine = HybridSearchEngine(db)
        self.citations = CitationBuilder()
        self.embedder = EmbeddingService()

    def search(self, query: str, *, department: str | None = None, limit: int = 10) -> list[SearchResult]:
        query_embedding: list[float] | None = None
        try:
            query_embedding = self.embedder.embed(query)
        except Exception:
            pass

        results = []
        for chunk, document, score in self.engine.search(
            query, query_embedding=query_embedding, department=department, limit=limit
        ):
            citation = self.citations.build(
                document_id=document.id,
                document_title=document.title,
                version=document.current_version,
                page=chunk.page_number,
                chunk_id=chunk.id,
                section=chunk.section,
                score=score,
            )
            results.append(
                SearchResult(
                    chunk_id=chunk.id,
                    document_id=document.id,
                    document_title=document.title,
                    content=chunk.content,
                    score=score,
                    citation=citation,
                )
            )
        return results
