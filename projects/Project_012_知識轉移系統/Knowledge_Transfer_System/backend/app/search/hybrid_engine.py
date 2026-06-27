from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.ingestion import DocumentChunk
from app.search.bm25_engine import BM25Engine
from app.search.permission_filter import PermissionFilter
from app.search.query_parser import QueryParser
from app.search.reranker import Reranker
from app.search.vector_engine import VectorEngine


class HybridSearchEngine:
    def __init__(self, db: Session) -> None:
        self.parser = QueryParser()
        self.bm25 = BM25Engine(db)
        self.vector = VectorEngine(db)
        self.permission_filter = PermissionFilter()
        self.reranker = Reranker()

    def search(
        self,
        query: str,
        *,
        query_embedding: list[float] | None = None,
        department: str | None = None,
        limit: int = 10,
    ) -> list[tuple[DocumentChunk, Document, float]]:
        parsed = self.parser.parse(query, department=department)
        merged: dict[str, tuple[DocumentChunk, Document, float]] = {}
        scores = defaultdict(float)

        for chunk, document, score in self.bm25.search(parsed.keywords, limit=50):
            scores[chunk.id] += score * 0.4
            merged[chunk.id] = (chunk, document, scores[chunk.id])

        if query_embedding:
            for chunk, document, score in self.vector.search(query_embedding, limit=50):
                scores[chunk.id] += score * 0.6
                merged[chunk.id] = (chunk, document, scores[chunk.id])

        filtered = self.permission_filter.filter(list(merged.values()), department=department)
        return self.reranker.rerank(filtered, limit=limit)
