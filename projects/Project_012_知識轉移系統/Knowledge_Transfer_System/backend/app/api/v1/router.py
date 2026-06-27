from fastapi import APIRouter

from app.api.v1.endpoints import analytics, auth, chat, collaboration, documents, experience, health, ingestion, line_webhook, quiz, sops


api_router = APIRouter()
api_router.include_router(line_webhook.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(health.router, prefix="/admin", tags=["admin"])
api_router.include_router(analytics.router, prefix="/admin", tags=["admin"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(ingestion.router, prefix="/documents", tags=["document-ingestion"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(experience.router, prefix="/experience", tags=["experience"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
api_router.include_router(sops.router, prefix="/sops", tags=["SOP"])
