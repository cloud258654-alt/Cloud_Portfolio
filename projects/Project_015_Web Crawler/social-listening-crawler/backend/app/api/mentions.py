from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import Optional
import json
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
        "risk_score": m.risk_score,
        "risk_reason": m.risk_reason,
        "crisis_keywords_matched": m.crisis_keywords_matched,
        "recommended_priority": m.recommended_priority,
        "resolved_at": m.resolved_at.isoformat() if m.resolved_at else None,
        "root_cause_category": m.root_cause_category,
        "root_cause_tags": m.root_cause_tags,
        "suggested_action": m.suggested_action,
        "brand_health_impact": m.brand_health_impact,
    }


@router.get("/")
def list_mentions(
    keyword_id: Optional[int] = None,
    platform: Optional[str] = None,
    sentiment: Optional[str] = None,
    risk_level: Optional[str] = None,
    recommended_priority: Optional[str] = None,
    root_cause_category: Optional[str] = None,
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
        if recommended_priority:
            query = query.filter(MentionModel.recommended_priority == recommended_priority)
        if root_cause_category:
            query = query.filter(MentionModel.root_cause_category == root_cause_category)
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
        from app.services.llm_service import analyze_with_llm
        mention = db.query(MentionModel).options(joinedload(MentionModel.keyword)).filter(MentionModel.id == mention_id).first()
        if not mention:
            raise HTTPException(status_code=404, detail="Mention not found")

        try:
            raw_info = json.loads(mention.raw_data) if mention.raw_data else {}
        except Exception:
            raw_info = {}
        likes = raw_info.get("likes", 0)
        comments = raw_info.get("comments", 0)
        shares = raw_info.get("shares", 0)

        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        recent_count = db.query(MentionModel).filter(MentionModel.keyword_id == mention.keyword_id, MentionModel.created_at >= twenty_four_hours_ago).count()

        result = analyze_with_llm(
            mention.content, mention.keyword.name if mention.keyword else "",
            likes=likes, comments=comments, shares=shares,
            is_resolved=(mention.status in ("resolved", "ignored")),
            recent_count=recent_count, platform=mention.platform
        )
        
        mention.sentiment = result["sentiment"]
        mention.sentiment_score = result["sentiment_score"]
        mention.risk_level = result["risk_level"]
        mention.risk_score = result.get("risk_score", 0)
        mention.risk_reason = result.get("risk_reason")
        mention.crisis_keywords_matched = result.get("crisis_keywords_matched")
        mention.recommended_priority = result.get("recommended_priority", "P3")
        mention.purchase_intent = result["purchase_intent"]
        mention.ai_summary = result["ai_summary"]
        mention.ai_suggestion = result["ai_suggestion"]
        mention.status = result.get("status", "new")
        mention.model_name = result.get("model_name")
        mention.analyzed_at = datetime.utcnow()
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
            elif req.status == "resolved":
                m.handled_at = now
                m.resolved_at = now
            elif req.status == "ignored":
                m.handled_at = now

        db.commit()
        return _serialize(m)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
