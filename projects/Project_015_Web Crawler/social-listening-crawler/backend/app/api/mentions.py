from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models.mention import Mention as MentionModel

router = APIRouter()


class UpdateMentionRequest(BaseModel):
    assigned_to: Optional[str] = None
    handled_note: Optional[str] = None
    status: Optional[str] = None


def _serialize(m) -> dict:
    return {
        "id": m.id,
        "keyword_id": m.keyword_id,
        "platform": m.platform,
        "title": m.title,
        "content": m.content,
        "url": m.url,
        "author": m.author,
        "published_at": m.published_at.isoformat() if m.published_at else None,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "sentiment": m.sentiment,
        "sentiment_score": m.sentiment_score,
        "risk_level": m.risk_level,
        "purchase_intent": m.purchase_intent,
        "ai_summary": m.ai_summary,
        "ai_suggestion": m.ai_suggestion,
        "status": m.status,
        "assigned_to": m.assigned_to,
        "handled_note": m.handled_note,
        "handled_at": m.handled_at.isoformat() if m.handled_at else None,
        "replied_at": m.replied_at.isoformat() if m.replied_at else None,
        "raw_data": m.raw_data,
        "keyword_name": m.keyword.name if m.keyword else None,
    }


@router.get("/")
def list_mentions(
    keyword_id: Optional[int] = None,
    platform: Optional[str] = None,
    sentiment: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        query = db.query(MentionModel).options(joinedload(MentionModel.keyword))

        if keyword_id is not None:
            query = query.filter(MentionModel.keyword_id == keyword_id)
        if platform:
            query = query.filter(MentionModel.platform == platform)
        if sentiment:
            query = query.filter(MentionModel.sentiment == sentiment)
        if risk_level:
            query = query.filter(MentionModel.risk_level == risk_level)
        if status:
            query = query.filter(MentionModel.status == status)
        if search:
            query = query.filter(
                (MentionModel.title.contains(search)) | (MentionModel.content.contains(search))
            )

        total = query.count()
        query = query.order_by(MentionModel.created_at.desc())
        results = query.offset(skip).limit(limit).all()

        return [_serialize(m) for m in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mentions: {str(e)}")


@router.post("/{mention_id}/reanalyze")
def reanalyze_mention(mention_id: int, db: Session = Depends(get_db)):
    try:
        from app.services.ai_service import AIService
        mention = db.query(MentionModel).options(joinedload(MentionModel.keyword)).filter(MentionModel.id == mention_id).first()
        if not mention:
            raise HTTPException(status_code=404, detail="Mention not found")

        result = AIService.analyze_content(mention.content, mention.keyword.name if mention.keyword else "")
        mention.sentiment = result["sentiment"]
        mention.sentiment_score = result["sentiment_score"]
        mention.risk_level = result["risk_level"]
        mention.purchase_intent = result["purchase_intent"]
        mention.ai_summary = result["ai_summary"]
        mention.ai_suggestion = result["ai_suggestion"]
        mention.status = "Processed"
        db.commit()

        return _serialize(mention)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reanalysis failed: {str(e)}")


@router.put("/{mention_id}")
def update_mention(mention_id: int, req: UpdateMentionRequest, db: Session = Depends(get_db)):
    try:
        m = db.query(MentionModel).options(joinedload(MentionModel.keyword)).filter(MentionModel.id == mention_id).first()
        if not m:
            raise HTTPException(status_code=404, detail="Mention not found")

        if req.assigned_to is not None:
            m.assigned_to = req.assigned_to
        if req.handled_note is not None:
            m.handled_note = req.handled_note

        if req.status is not None:
            m.status = req.status
            now = datetime.utcnow()
            if req.status == "replied":
                m.replied_at = now
            elif req.status in ("resolved", "ignored"):
                m.handled_at = now

        db.commit()
        return _serialize(m)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
