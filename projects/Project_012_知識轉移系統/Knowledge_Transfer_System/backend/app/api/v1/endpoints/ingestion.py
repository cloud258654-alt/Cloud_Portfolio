from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.response import StandardResponse
from app.services.ingestion_service import IngestionService


router = APIRouter()


def get_ingestion_service(db: Session = Depends(get_db)) -> IngestionService:
    return IngestionService(db)


@router.post("/{document_id}/reprocess", response_model=StandardResponse)
def reprocess_document(
    document_id: str,
    service: IngestionService = Depends(get_ingestion_service),
) -> StandardResponse:
    job = service.reprocess(document_id)
    return StandardResponse(success=True, data=job.model_dump(), message="document queued")


@router.post("/{document_id}/process", response_model=StandardResponse)
def process_document_now(
    document_id: str,
    service: IngestionService = Depends(get_ingestion_service),
) -> StandardResponse:
    status = service.process_document(document_id)
    return StandardResponse(success=True, data=status.model_dump(), message="document processed")


@router.get("/{document_id}/processing", response_model=StandardResponse)
def document_processing_status(
    document_id: str,
    service: IngestionService = Depends(get_ingestion_service),
) -> StandardResponse:
    status = service.processing_status(document_id)
    return StandardResponse(success=True, data=status.model_dump(), message="success")


@router.get("/{document_id}/chunks", response_model=StandardResponse)
def document_chunks(
    document_id: str,
    service: IngestionService = Depends(get_ingestion_service),
) -> StandardResponse:
    chunks = service.chunks(document_id)
    return StandardResponse(
        success=True,
        data=[chunk.model_dump() for chunk in chunks],
        message="success",
    )


@router.get("/{document_id}/metadata", response_model=StandardResponse)
def document_metadata(
    document_id: str,
    service: IngestionService = Depends(get_ingestion_service),
) -> StandardResponse:
    metadata = service.metadata(document_id)
    return StandardResponse(success=True, data=metadata, message="success")
