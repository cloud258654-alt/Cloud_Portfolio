from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.ingestion import DocumentChunk


class VectorEngine:
    def __init__(self, db: Session) -> None:
        self.db = db

    def search(self, query: str, limit: int = 50) -> list[tuple[DocumentChunk, Document, float]]:
        query_terms = {term.lower() for term in query.split() if term.strip()}
        rows = self.db.execute(
            select(DocumentChunk, Document)
            .join(Document, Document.id == DocumentChunk.document_id)
            .limit(limit)
        ).all()

        results = []
        for chunk, document in rows:
            terms = {term.lower() for term in chunk.content.split() if term.strip()}
            overlap = len(query_terms.intersection(terms))
            score = overlap / max(1, len(query_terms))
            if score > 0:
                results.append((chunk, document, float(score)))
        return results
