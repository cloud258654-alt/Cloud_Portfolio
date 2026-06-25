from typing import Any

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.document import Document
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentCreate, DocumentDownload, DocumentList, DocumentRead, DocumentUpdate
from app.services.ingestion_service import IngestionService
from app.services.storage_service import StorageService


class DocumentService:
    def __init__(self, db: Session, storage: StorageService | None = None) -> None:
        self.repository = DocumentRepository(db)
        self.storage = storage or StorageService()

    def upload(self, file: UploadFile, payload: DocumentCreate) -> DocumentRead:
        try:
            storage_path, file_type = self.storage.upload(
                file,
                department=payload.department_id or "general",
            )
        except ValueError as exc:
            raise AppException(str(exc), code="UNSUPPORTED_FILE_TYPE") from exc

        metadata: dict[str, Any] = {
            "category": payload.category,
            "tags": payload.tags,
            "language": payload.language,
            "original_filename": file.filename,
        }
        document = self.repository.create(
            title=payload.title,
            storage_path=storage_path,
            file_type=file_type,
            department_id=payload.department_id,
            description=payload.description,
            metadata=metadata,
            permission_scope=payload.permission_scope,
            classification=payload.classification,
        )
        IngestionService(self.repository.db).enqueue(document.id)
        return self.to_read(document)

    def list(self, keyword: str | None, status: str | None, page: int, page_size: int) -> DocumentList:
        items, total = self.repository.list(keyword=keyword, status=status, page=page, page_size=page_size)
        return DocumentList(
            items=[self.to_read(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def get(self, document_id: str) -> DocumentRead:
        return self.to_read(self.require_document(document_id))

    def recent(self) -> list[DocumentRead]:
        return [self.to_read(document) for document in self.repository.recent()]

    def favorites(self) -> list[DocumentRead]:
        return [self.to_read(document) for document in self.repository.favorites()]

    def update(self, document_id: str, payload: DocumentUpdate) -> DocumentRead:
        document = self.repository.update(
            self.require_document(document_id),
            payload.model_dump(exclude_unset=True),
        )
        return self.to_read(document)

    def delete(self, document_id: str) -> DocumentRead:
        return self.to_read(self.repository.soft_delete(self.require_document(document_id)))

    def restore(self, document_id: str) -> DocumentRead:
        return self.to_read(self.repository.restore(self.require_document(document_id)))

    def download(self, document_id: str, preview: bool = False) -> DocumentDownload:
        document = self.require_document(document_id)
        self.repository.add_activity(document.id, "preview" if preview else "download")
        self.repository.db.commit()
        return DocumentDownload(
            filename=document.doc_metadata.get("original_filename", document.title),
            url=self.storage.presigned_get_url(document.storage_path),
            preview=preview,
        )

    def favorite(self, document_id: str) -> dict[str, str]:
        self.require_document(document_id)
        self.repository.favorite(document_id)
        return {"status": "favorited"}

    def require_document(self, document_id: str) -> Document:
        document = self.repository.get(document_id)
        if document is None:
            raise AppException("Document not found", code="DOCUMENT_NOT_FOUND")
        return document

    @staticmethod
    def to_read(document: Document) -> DocumentRead:
        return DocumentRead(
            id=document.id,
            title=document.title,
            description=document.description,
            department_id=document.department_id,
            file_type=document.file_type,
            storage_path=document.storage_path,
            permission_scope=document.permission_scope,
            classification=document.classification,
            status=document.status,
            current_version=document.current_version,
            metadata=document.doc_metadata or {},
            created_at=document.created_at,
            updated_at=document.updated_at,
        )
