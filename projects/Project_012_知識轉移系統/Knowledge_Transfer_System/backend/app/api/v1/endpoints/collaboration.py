from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.collaboration import DocumentComment, KnowledgeRequest
from app.schemas.response import StandardResponse

router = APIRouter()


class CommentCreate(BaseModel):
    document_id: str
    content: str
    author_name: str = "Anonymous"
    parent_id: str | None = None


class CommentRead(BaseModel):
    id: str
    document_id: str
    author_name: str
    content: str
    parent_id: str | None = None
    created_at: str | None = None


class KnowledgeRequestCreate(BaseModel):
    title: str
    description: str | None = None
    requestor_name: str = "Anonymous"


class KnowledgeRequestRead(BaseModel):
    id: str
    title: str
    description: str | None = None
    requestor_name: str
    status: str
    assigned_to: str | None = None
    created_at: str | None = None


@router.post("/comments", response_model=StandardResponse)
def create_comment(body: CommentCreate, db: Session = Depends(get_db)):
    comment = DocumentComment(
        id=str(uuid4()),
        document_id=body.document_id,
        author_name=body.author_name,
        content=body.content,
        parent_id=body.parent_id,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(comment)
    db.commit()
    return StandardResponse(success=True, data={"id": comment.id}, message="Comment created")


@router.get("/documents/{document_id}/comments", response_model=StandardResponse)
def list_comments(document_id: str, db: Session = Depends(get_db)):
    comments = (
        db.query(DocumentComment)
        .filter(
            DocumentComment.document_id == document_id,
            DocumentComment.deleted_at.is_(None),
        )
        .order_by(DocumentComment.created_at.asc())
        .all()
    )
    result = [
        CommentRead(
            id=c.id,
            document_id=c.document_id,
            author_name=c.author_name,
            content=c.content,
            parent_id=c.parent_id,
            created_at=str(c.created_at) if c.created_at else None,
        )
        for c in comments
    ]
    return StandardResponse(success=True, data=result, message="ok")


@router.delete("/comments/{comment_id}", response_model=StandardResponse)
def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    comment = db.query(DocumentComment).filter(DocumentComment.id == comment_id).first()
    if comment:
        comment.deleted_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
    return StandardResponse(success=True, data=None, message="Comment deleted")


@router.post("/requests", response_model=StandardResponse)
def create_knowledge_request(body: KnowledgeRequestCreate, db: Session = Depends(get_db)):
    req = KnowledgeRequest(
        id=str(uuid4()),
        title=body.title,
        description=body.description,
        requestor_name=body.requestor_name,
        status="open",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(req)
    db.commit()
    return StandardResponse(success=True, data={"id": req.id}, message="Request created")


@router.get("/requests", response_model=StandardResponse)
def list_knowledge_requests(
    status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeRequest).filter(KnowledgeRequest.deleted_at.is_(None))
    if status:
        query = query.filter(KnowledgeRequest.status == status)
    requests = query.order_by(KnowledgeRequest.created_at.desc()).all()
    result = [
        KnowledgeRequestRead(
            id=r.id,
            title=r.title,
            description=r.description,
            requestor_name=r.requestor_name,
            status=r.status,
            assigned_to=r.assigned_to,
            created_at=str(r.created_at) if r.created_at else None,
        )
        for r in requests
    ]
    return StandardResponse(success=True, data=result, message="ok")


@router.post("/requests/{request_id}/claim", response_model=StandardResponse)
def claim_knowledge_request(request_id: str, db: Session = Depends(get_db)):
    req = db.query(KnowledgeRequest).filter(KnowledgeRequest.id == request_id).first()
    if req and req.status == "open":
        req.status = "in_progress"
        req.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
    return StandardResponse(success=True, data={"status": req.status if req else "not_found"}, message="ok")


@router.post("/documents/{document_id}/endorse", response_model=StandardResponse)
def endorse_document(document_id: str, db: Session = Depends(get_db)):
    from app.models.document import Document

    doc = db.query(Document).filter(Document.id == document_id, Document.deleted_at.is_(None)).first()
    if not doc:
        return StandardResponse(success=False, message="Document not found")

    endorsements = doc.doc_metadata.get("endorsements", [])
    endorsements.append({
        "timestamp": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
    })
    doc.doc_metadata = {**doc.doc_metadata, "endorsements": endorsements, "endorsed": True}
    db.commit()
    return StandardResponse(
        success=True,
        data={"endorsement_count": len(endorsements)},
        message="Document endorsed",
    )
