import logging
import time

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.models.document import Document
from app.models.ingestion import DocumentChunk, IngestionJob
from app.repositories.ingestion_repository import IngestionRepository
from app.schemas.ingestion import DocumentChunkRead, DocumentProcessingStatus, IngestionJobRead
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.language_service import LanguageService
from app.services.metadata_service import MetadataExtractionService
from app.services.ocr_service import OCRService
from app.services.parser_service import DocumentParser


class IngestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = IngestionRepository(db)
        self.parser = DocumentParser()
        self.ocr = OCRService()
        self.chunker = ChunkService()
        self.metadata_extractor = MetadataExtractionService()
        self.embedding = EmbeddingService()

    def enqueue(self, document_id: str) -> IngestionJobRead:
        job = self.repository.create_job(document_id)
        return self.to_job_read(job)

    def reprocess(self, document_id: str) -> IngestionJobRead:
        self.require_document(document_id)
        return self.enqueue(document_id)

    def process_document(self, document_id: str) -> DocumentProcessingStatus:
        started = time.perf_counter()
        logger = logging.getLogger(__name__)
        document = self.require_document(document_id)
        job = self.repository.latest_job(document_id) or self.repository.create_job(document_id)

        try:
            logger.info("parser start document_id=%s", document_id)
            self.repository.update_job(job, status="processing", stage="parser", progress=15)
            parsed = self.parser.parse(
                storage_path=document.storage_path,
                file_type=document.file_type,
                fallback_title=document.title,
            )

            logger.info("ocr start document_id=%s", document_id)
            self.repository.update_job(job, status="processing", stage="ocr", progress=30)
            if (document.file_type or "").lower() in {"png", "jpg", "jpeg", "webp"}:
                ocr_pages = self.ocr.extract_image_text(document.storage_path)
                parsed["text"] = "\n".join(page["text"] for page in ocr_pages if page["text"]) or parsed["text"]

            logger.info("language detection start document_id=%s", document_id)
            self.repository.update_job(job, status="processing", stage="language", progress=45)
            language = LanguageService.detect(parsed["text"])

            logger.info("chunk start document_id=%s", document_id)
            self.repository.update_job(job, status="processing", stage="chunk", progress=60)
            chunk_payloads = self.chunker.build_chunks(parsed["text"], title=document.title, language=language)
            chunks = self.repository.replace_chunks(document_id, chunk_payloads)

            logger.info("metadata extraction start document_id=%s", document_id)
            self.repository.update_job(job, status="processing", stage="metadata", progress=75)
            metadata = self.metadata_extractor.extract(parsed["text"], title=document.title, language=language)

            logger.info("embedding start document_id=%s", document_id)
            self.repository.update_job(job, status="processing", stage="embedding", progress=90)
            vectors = {}
            for chunk in chunks:
                vectors[chunk.id] = self.embedding.embed(chunk.content)
            self.repository.create_embedding_jobs(
                document_id,
                chunks,
                provider=settings.embedding_provider,
                model=settings.embedding_model,
                vectors=vectors,
            )

            self.repository.set_document_status(
                document_id,
                "completed",
                {
                    "ingestion": metadata,
                    "language": language,
                    "chunk_count": len(chunks),
                    "embedding_status": "completed",
                },
            )
            self.repository.update_job(job, status="completed", stage="completed", progress=100, metadata=metadata)
            logger.info(
                "document ingestion completed document_id=%s processing_time=%.3fs",
                document_id,
                time.perf_counter() - started,
            )
        except Exception as exc:
            logger.exception("document ingestion failed document_id=%s", document_id)
            self.repository.set_document_status(document_id, "failed")
            self.repository.update_job(job, status="failed", stage="failed", progress=0, error_message=str(exc))
            raise

        return self.processing_status(document_id)

    def processing_status(self, document_id: str) -> DocumentProcessingStatus:
        document = self.require_document(document_id)
        job = self.repository.latest_job(document_id)
        metadata = document.doc_metadata or {}
        ingestion_metadata = metadata.get("ingestion") or {}
        return DocumentProcessingStatus(
            document_id=document_id,
            document_status=document.status,
            ingestion=self.to_job_read(job) if job else None,
            chunk_count=self.repository.chunk_count(document_id),
            embedding_status=metadata.get("embedding_status", "not_started"),
            language=metadata.get("language") or ingestion_metadata.get("language"),
            summary=ingestion_metadata.get("summary"),
        )

    def chunks(self, document_id: str) -> list[DocumentChunkRead]:
        self.require_document(document_id)
        return [self.to_chunk_read(chunk) for chunk in self.repository.list_chunks(document_id)]

    def metadata(self, document_id: str) -> dict:
        document = self.require_document(document_id)
        return (document.doc_metadata or {}).get("ingestion", {})

    def require_document(self, document_id: str) -> Document:
        document = self.db.get(Document, document_id)
        if document is None:
            raise AppException("Document not found", code="DOCUMENT_NOT_FOUND")
        return document

    @staticmethod
    def to_job_read(job: IngestionJob) -> IngestionJobRead:
        return IngestionJobRead(
            id=job.id,
            document_id=job.document_id,
            status=job.status,
            stage=job.stage,
            progress=job.progress,
            retry_count=job.retry_count,
            max_retries=job.max_retries,
            error_message=job.error_message,
            metadata=job.job_metadata or {},
            started_at=job.started_at,
            completed_at=job.completed_at,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )

    @staticmethod
    def to_chunk_read(chunk: DocumentChunk) -> DocumentChunkRead:
        metadata = chunk.chunk_metadata or {}
        return DocumentChunkRead(
            id=chunk.id,
            document_id=chunk.document_id,
            chunk_index=chunk.chunk_index,
            title=chunk.title,
            section=chunk.section,
            page_number=chunk.page_number,
            content=chunk.content,
            token_count=chunk.token_count,
            language=metadata.get("language"),
            metadata=metadata,
        )
