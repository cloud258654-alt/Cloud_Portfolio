from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.database import get_db
from app.models.keyword import Keyword
from app.models.mention import Mention

router = APIRouter()


def _serialize_mention(m) -> dict:
    return {
        "id": m.id, "keyword_id": m.keyword_id, "platform": m.platform,
        "title": m.title, "content": m.content, "url": m.url, "author": m.author,
        "published_at": m.published_at.isoformat() if m.published_at else None,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "sentiment": m.sentiment, "sentiment_score": m.sentiment_score,
        "risk_level": m.risk_level, "purchase_intent": m.purchase_intent,
        "ai_summary": m.ai_summary, "ai_suggestion": m.ai_suggestion,
        "status": m.status, "raw_data": m.raw_data,
        "assigned_to": m.assigned_to, "handled_note": m.handled_note,
        "handled_at": m.handled_at.isoformat() if m.handled_at else None,
        "replied_at": m.replied_at.isoformat() if m.replied_at else None,
        "keyword_name": m.keyword.name if m.keyword else None,
    }


def _date_filter(query, start: Optional[str] = None, end: Optional[str] = None):
    if start:
        try:
            d = datetime.fromisoformat(start)
            query = query.filter(Mention.created_at >= d)
        except ValueError:
            pass
    if end:
        try:
            d = datetime.fromisoformat(end) + timedelta(days=1)
            query = query.filter(Mention.created_at < d)
        except ValueError:
            pass
    return query


@router.get("/summary")
def get_dashboard_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    try:
        base = db.query(Mention)
        base = _date_filter(base, start_date, end_date)

        total_keywords = db.query(func.count(Keyword.id)).scalar() or 0
        total_mentions = base.count()
        negative_count = base.filter(Mention.sentiment == "Negative").count()
        high_risk_count = base.filter(Mention.risk_level == "High").count()
        medium_risk_count = base.filter(Mention.risk_level == "Medium").count()
        purchase_intent_count = base.filter(Mention.purchase_intent == True).count()

        sentiment_stats = base.with_entities(Mention.sentiment, func.count(Mention.id)).group_by(Mention.sentiment).all()
        sentiment_breakdown = {"Positive": 0, "Neutral": 0, "Negative": 0}
        for s, c in sentiment_stats:
            sentiment_breakdown[s] = c

        platform_stats = base.with_entities(Mention.platform, func.count(Mention.id)).group_by(Mention.platform).all()
        platform_breakdown = {p: c for p, c in platform_stats}

        keyword_stats = (
            base.with_entities(Keyword.name, func.count(Mention.id))
            .join(Keyword, Keyword.id == Mention.keyword_id)
            .group_by(Keyword.name).order_by(func.count(Mention.id).desc()).limit(10).all()
        )
        keyword_breakdown = {k: c for k, c in keyword_stats}

        today = datetime.utcnow().date()
        trend_days = 7
        if start_date:
            try:
                sd = datetime.fromisoformat(start_date).date()
                trend_days = max(7, (today - sd).days + 1)
            except ValueError:
                pass

        trend = {(today - timedelta(days=i)).isoformat(): 0 for i in range(trend_days)}
        trend_stats = (
            base.with_entities(func.date(Mention.created_at), func.count(Mention.id))
            .filter(Mention.created_at >= datetime.utcnow() - timedelta(days=trend_days))
            .group_by(func.date(Mention.created_at)).all()
        )
        for d, c in trend_stats:
            if d and str(d) in trend:
                trend[str(d)] = c
        trend_list = [{"date": k, "count": v} for k, v in sorted(trend.items())]

        latest = base.options(joinedload(Mention.keyword)).order_by(Mention.created_at.desc()).limit(20).all()
        high_risks = base.options(joinedload(Mention.keyword)).filter(Mention.risk_level == "High").order_by(Mention.created_at.desc()).limit(10).all()

        return {
            "total_keywords": total_keywords, "total_mentions": total_mentions,
            "negative_count": negative_count, "high_risk_count": high_risk_count,
            "medium_risk_count": medium_risk_count, "purchase_intent_count": purchase_intent_count,
            "platform_breakdown": platform_breakdown, "sentiment_breakdown": sentiment_breakdown,
            "keyword_breakdown": keyword_breakdown, "trend": trend_list,
            "latest_mentions": [_serialize_mention(m) for m in latest],
            "high_risk_events": [_serialize_mention(m) for m in high_risks],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")


@router.get("/platforms")
def get_platform_breakdown(db: Session = Depends(get_db)):
    try:
        stats = db.query(Mention.platform, func.count(Mention.id)).group_by(Mention.platform).all()
        return [{"platform": p, "count": c} for p, c in stats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/keywords")
def get_keyword_ranking(db: Session = Depends(get_db)):
    try:
        stats = (db.query(Keyword.name, func.count(Mention.id))
                 .join(Mention, Keyword.id == Mention.keyword_id)
                 .group_by(Keyword.name).order_by(func.count(Mention.id).desc()).limit(10).all())
        return [{"keyword": k, "count": c} for k, c in stats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/high-risks")
def get_high_risks(db: Session = Depends(get_db)):
    try:
        events = (db.query(Mention).options(joinedload(Mention.keyword))
                  .filter(Mention.risk_level == "High")
                  .order_by(Mention.created_at.desc()).limit(10).all())
        return [_serialize_mention(m) for m in events]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/latest")
def get_latest_mentions(db: Session = Depends(get_db)):
    try:
        mentions = (db.query(Mention).options(joinedload(Mention.keyword))
                    .order_by(Mention.created_at.desc()).limit(20).all())
        return [_serialize_mention(m) for m in mentions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
