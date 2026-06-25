import json

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentCreate, DocumentUpdate
from app.schemas.response import StandardResponse
from app.services.document_service import DocumentService


router = APIRouter()


def get_document_service(db: Session = Depends(get_db)) -> DocumentService:
    return DocumentService(db)


@router.post("", response_model=StandardResponse)
def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    department_id: str | None = Form(None),
    category: str | None = Form(None),
    tags: str = Form("[]"),
    description: str | None = Form(None),
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    parsed_tags = json.loads(tags) if tags.strip().startswith("[") else [tag.strip() for tag in tags.split(",") if tag.strip()]
    document = service.upload(
        file,
        DocumentCreate(
            title=title,
            department_id=department_id,
            category=category,
            tags=parsed_tags,
            description=description,
        ),
    )
    return StandardResponse(success=True, data=document.model_dump(), message="document uploaded")


@router.get("", response_model=StandardResponse)
def list_documents(
    keyword: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    documents = service.list(keyword=keyword, status=status, page=page, page_size=page_size)
    return StandardResponse(success=True, data=documents.model_dump(), message="success")


@router.get("/favorites", response_model=StandardResponse)
def list_favorite_documents(
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    return StandardResponse(
        success=True,
        data=[item.model_dump() for item in service.favorites()],
        message="success",
    )


@router.get("/recent", response_model=StandardResponse)
def list_recent_documents(
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    return StandardResponse(
        success=True,
        data=[item.model_dump() for item in service.recent()],
        message="success",
    )


@router.get("/{document_id}", response_model=StandardResponse)
def get_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.get(document_id).model_dump(), message="success")


@router.put("/{document_id}", response_model=StandardResponse)
def update_document(
    document_id: str,
    payload: DocumentUpdate,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    document = service.update(document_id, payload)
    return StandardResponse(success=True, data=document.model_dump(), message="document updated")


@router.delete("/{document_id}", response_model=StandardResponse)
def delete_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    document = service.delete(document_id)
    return StandardResponse(success=True, data=document.model_dump(), message="document deleted")


@router.post("/{document_id}/restore", response_model=StandardResponse)
def restore_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    document = service.restore(document_id)
    return StandardResponse(success=True, data=document.model_dump(), message="document restored")


@router.get("/{document_id}/download", response_model=StandardResponse)
def download_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    download = service.download(document_id)
    return StandardResponse(success=True, data=download.model_dump(), message="download ready")


@router.get("/{document_id}/preview", response_model=StandardResponse)
def preview_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    preview = service.download(document_id, preview=True)
    return StandardResponse(success=True, data=preview.model_dump(), message="preview ready")


@router.post("/{document_id}/favorite", response_model=StandardResponse)
def favorite_document(
    document_id: str,
    service: DocumentService = Depends(get_document_service),
) -> StandardResponse:
    return StandardResponse(success=True, data=service.favorite(document_id), message="favorite saved")
