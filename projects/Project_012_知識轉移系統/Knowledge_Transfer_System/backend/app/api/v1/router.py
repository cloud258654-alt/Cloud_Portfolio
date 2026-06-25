from fastapi import APIRouter

from app.api.v1.endpoints import chat, documents, experience, health, ingestion, sops


api_router = APIRouter()
api_router.include_router(health.router, prefix="/admin", tags=["admin"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(ingestion.router, prefix="/documents", tags=["document-ingestion"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(experience.router, prefix="/experience", tags=["experience"])
api_router.include_router(sops.router, prefix="/sops", tags=["SOP"])
