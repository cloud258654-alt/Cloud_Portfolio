import logging

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.embedding import Embedding
from app.models.ingestion import DocumentChunk

logger = logging.getLogger(__name__)


class VectorEngine:
    def __init__(self, db: Session) -> None:
        self.db = db

    def search(self, query_embedding: list[float], limit: int = 50) -> list[tuple[DocumentChunk, Document, float]]:
        if not query_embedding:
            return self._keyword_fallback("", limit)

        try:
            vector_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

            sql = text("""
                SELECT dc.id AS chunk_id, e.id AS embedding_id,
                       (1.0 - (e.vector <=> CAST(:vec AS vector))) AS similarity
                FROM knowledge.embeddings e
                JOIN knowledge.document_chunks dc ON e.source_id = dc.id AND e.source_type = 'chunk'
                JOIN knowledge.documents d ON dc.document_id = d.id
                WHERE d.deleted_at IS NULL AND d.status != 'archived'
                ORDER BY e.vector <=> CAST(:vec2 AS vector)
                LIMIT :limit
            """)

            rows = self.db.execute(
                sql,
                {"vec": vector_str, "vec2": vector_str, "limit": limit},
            ).fetchall()

            results = []
            for row in rows:
                chunk = self.db.get(DocumentChunk, row.chunk_id)
                document = self.db.get(Document, chunk.document_id) if chunk else None
                if chunk and document and row.similarity:
                    results.append((chunk, document, float(row.similarity)))

            if results:
                return results

        except Exception as e:
            logger.warning("pgvector search failed, falling back to keyword: %s", e)

        return self._keyword_fallback("", limit)

    def _keyword_fallback(self, _query: str, limit: int) -> list[tuple[DocumentChunk, Document, float]]:
        from sqlalchemy import select

        rows = self.db.execute(
            select(DocumentChunk, Document)
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(Document.deleted_at.is_(None))
            .limit(limit)
        ).all()

        return [(chunk, doc, 0.5) for chunk, doc in rows]

    def store_embedding(self, source_type: str, source_id: str, vector: list[float], model: str, dimension: int) -> str:
        embedding = Embedding(
            source_type=source_type,
            source_id=source_id,
            embedding_model=model,
            dimension=dimension,
        )
        self.db.add(embedding)
        self.db.flush()

        vector_str = "[" + ",".join(str(v) for v in vector) + "]"
        self.db.execute(
            text("UPDATE knowledge.embeddings SET vector = CAST(:vec AS vector) WHERE id = CAST(:eid AS uuid)"),
            {"vec": vector_str, "eid": embedding.id},
        )
        self.db.commit()
        return embedding.id
