from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.ingestion import DocumentChunk


class BM25Engine:
    def __init__(self, db: Session) -> None:
        self.db = db

    def search(self, keywords: list[str], limit: int = 50) -> list[tuple[DocumentChunk, Document, float]]:
        if not keywords:
            return []

        filters = []
        for keyword in keywords:
            pattern = f"%{keyword}%"
            filters.append(DocumentChunk.content.ilike(pattern))
            filters.append(Document.title.ilike(pattern))

        rows = self.db.execute(
            select(DocumentChunk, Document)
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(or_(*filters))
            .limit(limit)
        ).all()

        results = []
        for chunk, document in rows:
            content = chunk.content.lower()
            score = sum(content.count(keyword) for keyword in keywords) + 0.5
            results.append((chunk, document, float(score)))
        return results
