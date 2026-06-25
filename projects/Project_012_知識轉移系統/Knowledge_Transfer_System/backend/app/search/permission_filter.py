from app.models.document import Document
from app.models.ingestion import DocumentChunk


class PermissionFilter:
    def filter(
        self,
        results: list[tuple[DocumentChunk, Document, float]],
        *,
        department: str | None = None,
    ) -> list[tuple[DocumentChunk, Document, float]]:
        filtered = []
        for chunk, document, score in results:
            if document.classification == "confidential":
                continue
            if department and document.department_id and document.department_id != department:
                continue
            filtered.append((chunk, document, score))
        return filtered
