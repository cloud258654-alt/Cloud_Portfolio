from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.response import StandardResponse
from app.services.document_health_service import DocumentHealthService
from app.services.knowledge_gap_service import KnowledgeGapService

router = APIRouter()


@router.post("/health/run", response_model=StandardResponse)
def run_health_check(db: Session = Depends(get_db)):
    service = DocumentHealthService(db)
    result = service.run_health_check()
    return StandardResponse(success=True, data=result, message="Health check completed")


@router.get("/health/documents", response_model=StandardResponse)
def list_document_health(
    status: str | None = Query(None, description="Filter: stale, needs_review, archived"),
    db: Session = Depends(get_db),
):
    service = DocumentHealthService(db)
    stale = service.find_stale_documents()
    result = []
    for doc in stale:
        health = service.calculate_health(doc)
        result.append({
            "id": doc.id,
            "title": doc.title,
            "status": doc.status,
            "health_score": health["score"],
            "health_details": health["details"],
            "updated_at": str(doc.updated_at or ""),
        })
    return StandardResponse(success=True, data=result, message="ok")


@router.post("/health/documents/{document_id}/refresh", response_model=StandardResponse)
def refresh_document_health(document_id: str, db: Session = Depends(get_db)):
    from app.models.document import Document

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return StandardResponse(success=False, message="Document not found")
    service = DocumentHealthService(db)
    service.update_health(doc)
    return StandardResponse(
        success=True,
        data={"id": doc.id, "health": doc.doc_metadata.get("health")},
        message="Health refreshed",
    )


@router.get("/gaps", response_model=StandardResponse)
def get_knowledge_gaps(db: Session = Depends(get_db)):
    service = KnowledgeGapService(db)
    result = service.analyze()
    return StandardResponse(success=True, data=result, message="ok")


@router.get("/analytics/summary", response_model=StandardResponse)
def get_analytics_summary(db: Session = Depends(get_db)):
    from app.models.document import Document
    from app.models.chat import Citation, Conversation, Feedback

    total_docs = db.query(Document).filter(Document.deleted_at.is_(None)).count()
    total_conversations = db.query(Conversation).filter(Conversation.deleted_at.is_(None)).count()
    total_citations = db.query(Citation).count()
    feedbacks = db.query(Feedback).all()
    avg_rating = sum(f.rating for f in feedbacks) / max(len(feedbacks), 1)

    gap_service = KnowledgeGapService(db)
    gaps = gap_service._gap_summary()

    return StandardResponse(
        success=True,
        data={
            "documents": {"total": total_docs},
            "conversations": {"total": total_conversations},
            "citations": {"total": total_citations},
            "feedback": {"average_rating": round(avg_rating, 2), "total": len(feedbacks)},
            "gaps": gaps,
        },
        message="ok",
    )


@router.get("/analytics/departments", response_model=StandardResponse)
def get_department_analytics(db: Session = Depends(get_db)):
    from app.models.document import Document

    docs = db.query(Document).filter(Document.deleted_at.is_(None)).all()
    dept_stats: dict[str, dict] = {}
    for doc in docs:
        dept = doc.department_id or "unassigned"
        if dept not in dept_stats:
            dept_stats[dept] = {"department_id": dept, "document_count": 0}
        dept_stats[dept]["document_count"] += 1

    return StandardResponse(
        success=True,
        data=sorted(dept_stats.values(), key=lambda x: -x["document_count"]),
        message="ok",
    )
