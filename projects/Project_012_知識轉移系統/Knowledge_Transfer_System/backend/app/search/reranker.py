from app.models.document import Document
from app.models.ingestion import DocumentChunk


class Reranker:
    def rerank(
        self,
        results: list[tuple[DocumentChunk, Document, float]],
        limit: int = 10,
    ) -> list[tuple[DocumentChunk, Document, float]]:
        return sorted(results, key=lambda item: item[2], reverse=True)[:limit]
