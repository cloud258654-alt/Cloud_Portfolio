from datetime import datetime
from typing import Any

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.ingestion import ChunkMetadata, DocumentChunk, EmbeddingJob, IngestionJob


class IngestionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_job(self, document_id: str, metadata: dict[str, Any] | None = None) -> IngestionJob:
        now = datetime.utcnow()
        job = IngestionJob(
            document_id=document_id,
            status="queued",
            stage="queue",
            progress=0,
            retry_count=0,
            max_retries=3,
            job_metadata=metadata or {},
            created_at=now,
            updated_at=now,
        )
        self.db.add(job)
        document = self.db.get(Document, document_id)
        if document is not None:
            document.status = "uploaded"
            document.updated_at = now
        self.db.commit()
        self.db.refresh(job)
        return job

    def latest_job(self, document_id: str) -> IngestionJob | None:
        return self.db.scalars(
            select(IngestionJob)
            .where(IngestionJob.document_id == document_id)
            .order_by(IngestionJob.created_at.desc())
            .limit(1)
        ).first()

    def update_job(
        self,
        job: IngestionJob,
        *,
        status: str | None = None,
        stage: str | None = None,
        progress: int | None = None,
        error_message: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> IngestionJob:
        now = datetime.utcnow()
        if status is not None:
            job.status = status
        if stage is not None:
            job.stage = stage
        if progress is not None:
            job.progress = progress
        if error_message is not None:
            job.error_message = error_message
        if metadata is not None:
            current = dict(job.job_metadata or {})
            current.update(metadata)
            job.job_metadata = current
        if status == "processing" and job.started_at is None:
            job.started_at = now
        if status in {"completed", "failed"}:
            job.completed_at = now
        job.updated_at = now
        self.db.commit()
        self.db.refresh(job)
        return job

    def set_document_status(self, document_id: str, status: str, metadata: dict[str, Any] | None = None) -> None:
        document = self.db.get(Document, document_id)
        if document is None:
            return
        document.status = status
        document.updated_at = datetime.utcnow()
        if metadata:
            current = dict(document.doc_metadata or {})
            current.update(metadata)
            document.doc_metadata = current
        self.db.commit()

    def replace_chunks(self, document_id: str, chunks: list[dict[str, Any]]) -> list[DocumentChunk]:
        existing = self.db.scalars(select(DocumentChunk).where(DocumentChunk.document_id == document_id)).all()
        for chunk in existing:
            self.db.delete(chunk)
        self.db.flush()

        created: list[DocumentChunk] = []
        now = datetime.utcnow()
        for item in chunks:
            metadata = item.get("metadata", {})
            chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=item["chunk_index"],
                title=item.get("title"),
                section=item.get("section"),
                page_number=item.get("page_number"),
                content=item["content"],
                token_count=item["token_count"],
                permission_scope=item.get("permission_scope", "department"),
                classification=item.get("classification", "internal"),
                chunk_metadata=metadata,
                created_at=now,
            )
            self.db.add(chunk)
            created.append(chunk)
        self.db.flush()
        for chunk in created:
            metadata = chunk.chunk_metadata or {}
            self.db.add(
                ChunkMetadata(
                    chunk_id=chunk.id,
                    language=metadata.get("language"),
                    keywords=metadata.get("keywords", []),
                    entities=metadata.get("entities", []),
                    summary=metadata.get("summary"),
                    detail_metadata=metadata,
                    created_at=now,
                )
            )
        self.db.commit()
        for chunk in created:
            self.db.refresh(chunk)
        return created

    def list_chunks(self, document_id: str) -> list[DocumentChunk]:
        return list(
            self.db.scalars(
                select(DocumentChunk)
                .where(DocumentChunk.document_id == document_id)
                .order_by(DocumentChunk.chunk_index.asc())
            ).all()
        )

    def chunk_count(self, document_id: str) -> int:
        return self.db.scalar(
            select(func.count()).select_from(DocumentChunk).where(DocumentChunk.document_id == document_id)
        ) or 0

    def create_embedding_jobs(
        self,
        document_id: str,
        chunks: list[DocumentChunk],
        provider: str,
        model: str,
        vectors: dict[str, list[float]] | None = None,
    ) -> None:
        now = datetime.utcnow()
        for chunk in chunks:
            vector = (vectors or {}).get(chunk.id)
            self.db.add(
                EmbeddingJob(
                    document_id=document_id,
                    chunk_id=chunk.id,
                    status="completed",
                    provider=provider,
                    model=model,
                    created_at=now,
                    updated_at=now,
                )
            )
            if vector is not None:
                vector_literal = "[" + ",".join(str(value) for value in vector) + "]"
                self.db.execute(
                    text(
                        """
                        INSERT INTO knowledge.embeddings (
                            source_type,
                            source_id,
                            embedding_model,
                            vector,
                            dimension,
                            metadata,
                            created_at
                        )
                        VALUES (
                            'document_chunk',
                            :source_id,
                            :embedding_model,
                            CAST(:vector AS vector),
                            :dimension,
                            '{}'::jsonb,
                            NOW()
                        )
                        """
                    ),
                    {
                        "source_id": chunk.id,
                        "embedding_model": model,
                        "vector": vector_literal,
                        "dimension": len(vector),
                    },
                )
        self.db.commit()
