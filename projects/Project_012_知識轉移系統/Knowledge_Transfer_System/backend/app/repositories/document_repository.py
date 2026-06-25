from datetime import datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentActivity, DocumentFavorite, DocumentVersion


class DocumentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        title: str,
        storage_path: str,
        file_type: str,
        department_id: str | None,
        description: str | None,
        metadata: dict[str, Any],
        permission_scope: str,
        classification: str,
    ) -> Document:
        now = datetime.utcnow()
        document = Document(
            title=title,
            storage_path=storage_path,
            file_type=file_type,
            department_id=department_id,
            description=description,
            doc_metadata=metadata,
            permission_scope=permission_scope,
            classification=classification,
            status="draft",
            current_version="v1.0.0",
            created_at=now,
            updated_at=now,
        )
        self.db.add(document)
        self.db.flush()
        self.db.add(
            DocumentVersion(
                document_id=document.id,
                version_no="v1.0.0",
                storage_path=storage_path,
                version_metadata=metadata,
                created_at=now,
            )
        )
        self.add_activity(document.id, "upload")
        self.db.commit()
        self.db.refresh(document)
        return document

    def list(
        self,
        *,
        keyword: str | None = None,
        status: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Document], int]:
        statement = select(Document).where(Document.deleted_at.is_(None))
        count_statement = select(func.count()).select_from(Document).where(Document.deleted_at.is_(None))

        if keyword:
            pattern = f"%{keyword}%"
            statement = statement.where(Document.title.ilike(pattern))
            count_statement = count_statement.where(Document.title.ilike(pattern))
        if status:
            statement = statement.where(Document.status == status)
            count_statement = count_statement.where(Document.status == status)

        total = self.db.scalar(count_statement) or 0
        items = self.db.scalars(
            statement.order_by(Document.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
        ).all()
        return list(items), total

    def get(self, document_id: str) -> Document | None:
        return self.db.get(Document, document_id)

    def recent(self, limit: int = 10) -> list[Document]:
        return list(
            self.db.scalars(
                select(Document)
                .where(Document.deleted_at.is_(None))
                .order_by(Document.updated_at.desc())
                .limit(limit)
            ).all()
        )

    def favorites(self, limit: int = 20) -> list[Document]:
        statement = (
            select(Document)
            .join(DocumentFavorite, DocumentFavorite.document_id == Document.id)
            .where(Document.deleted_at.is_(None))
            .order_by(DocumentFavorite.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(statement).all())

    def update(self, document: Document, values: dict[str, Any]) -> Document:
        metadata = dict(document.doc_metadata or {})
        for key in ("category", "tags", "language"):
            if key in values:
                metadata[key] = values.pop(key)
        for key, value in values.items():
            if value is not None and hasattr(document, key):
                setattr(document, key, value)
        document.doc_metadata = metadata
        document.updated_at = datetime.utcnow()
        self.add_activity(document.id, "update")
        self.db.commit()
        self.db.refresh(document)
        return document

    def soft_delete(self, document: Document) -> Document:
        document.status = "deleted"
        document.deleted_at = datetime.utcnow()
        document.updated_at = datetime.utcnow()
        self.add_activity(document.id, "delete")
        self.db.commit()
        self.db.refresh(document)
        return document

    def restore(self, document: Document) -> Document:
        document.status = "draft"
        document.deleted_at = None
        document.updated_at = datetime.utcnow()
        self.add_activity(document.id, "restore")
        self.db.commit()
        self.db.refresh(document)
        return document

    def favorite(self, document_id: str, user_id: str | None = None) -> DocumentFavorite:
        favorite = DocumentFavorite(document_id=document_id, user_id=user_id, created_at=datetime.utcnow())
        self.db.add(favorite)
        self.add_activity(document_id, "favorite", user_id=user_id)
        self.db.commit()
        self.db.refresh(favorite)
        return favorite

    def add_activity(
        self,
        document_id: str,
        action: str,
        user_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.db.add(
            DocumentActivity(
                document_id=document_id,
                user_id=user_id,
                action=action,
                result="success",
                activity_metadata=metadata or {},
                created_at=datetime.utcnow(),
            )
        )
