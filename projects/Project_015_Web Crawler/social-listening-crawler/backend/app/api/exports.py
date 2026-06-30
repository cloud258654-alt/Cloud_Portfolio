import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.database import get_db
from app.models.mention import Mention

router = APIRouter()

CSV_HEADERS = [
    "id", "platform", "keyword", "title", "content", "url", "author",
    "published_at", "sentiment", "sentiment_score", "risk_level",
    "purchase_intent", "ai_summary", "ai_suggestion", "created_at",
]


@router.get("/mentions.csv")
def export_mentions_csv(
    platform: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    keyword_id: Optional[int] = Query(None),
    limit: int = Query(1000, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    query = db.query(Mention).options(joinedload(Mention.keyword))

    if platform:
        query = query.filter(Mention.platform == platform)
    if sentiment:
        query = query.filter(Mention.sentiment == sentiment)
    if risk_level:
        query = query.filter(Mention.risk_level == risk_level)
    if keyword_id is not None:
        query = query.filter(Mention.keyword_id == keyword_id)

    query = query.order_by(Mention.created_at.desc()).limit(limit)
    mentions = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(CSV_HEADERS)

    for m in mentions:
        writer.writerow([
            m.id,
            m.platform,
            m.keyword.name if m.keyword else "",
            m.title or "",
            m.content or "",
            m.url or "",
            m.author or "",
            m.published_at.isoformat() if m.published_at else "",
            m.sentiment,
            m.sentiment_score,
            m.risk_level,
            "YES" if m.purchase_intent else "NO",
            m.ai_summary or "",
            m.ai_suggestion or "",
            m.created_at.isoformat() if m.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mentions_export.csv"},
    )
