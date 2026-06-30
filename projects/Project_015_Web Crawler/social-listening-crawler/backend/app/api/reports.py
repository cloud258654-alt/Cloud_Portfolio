from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime
from app.database import get_db
from app.models.mention import Mention
from app.models.keyword import Keyword

router = APIRouter()


@router.get("/daily")
def get_daily_report(db: Session = Depends(get_db)) -> Dict[str, Any]:
    try:
        total = db.query(func.count(Mention.id)).scalar() or 0
        neg = db.query(func.count(Mention.id)).filter(Mention.sentiment == "Negative").scalar() or 0
        high = db.query(func.count(Mention.id)).filter(Mention.risk_level == "High").scalar() or 0
        pi = db.query(func.count(Mention.id)).filter(Mention.purchase_intent == True).scalar() or 0

        top_kw = (db.query(Keyword.name, func.count(Mention.id))
                  .join(Mention, Keyword.id == Mention.keyword_id)
                  .group_by(Keyword.name).order_by(func.count(Mention.id).desc()).limit(5).all())

        high_events = (db.query(Mention).filter(Mention.risk_level == "High")
                       .order_by(Mention.created_at.desc()).limit(5).all())

        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        report = f"""# 每日輿情報告 - {today_str}

## 總覽
| 指標 | 數值 |
|------|------|
| 總聲量 | {total} |
| 負面聲量 | {neg} |
| 高風險事件 | {high} |
| 購買意圖 | {pi} |

## 熱門關鍵字
"""
        for kw, cnt in top_kw:
            report += f"- **{kw}**: {cnt} 筆\n"

        report += "\n## 高風險事件\n"
        for e in high_events:
            kwn = e.keyword.name if e.keyword else ""
            title = e.title or "無標題"
            report += f"### {title}\n"
            report += f"- 平台: {e.platform} | 關鍵字: {kwn} | 情緒: {e.sentiment}\n"
            if e.ai_summary:
                report += f"- AI 摘要: {e.ai_summary}\n"
            if e.ai_suggestion:
                report += f"- 建議: {e.ai_suggestion}\n"
            report += "\n"

        report += "## 建議行動\n"
        if high > 0:
            report += f"- ⚠ 有 {high} 件高風險事件需立即處理\n"
        if neg > 5:
            report += f"- 負面聲量偏高 ({neg} 筆)，建議檢視負面貼文並制定回應策略\n"
        if pi > 0:
            report += f"- 偵測到 {pi} 筆購買意圖，行銷團隊可跟進\n"
        if high == 0:
            report += "- 今日無高風險事件，狀況穩定\n"

        return {
            "date": today_str,
            "total_mentions": total,
            "negative_count": neg,
            "high_risk_count": high,
            "purchase_intent_count": pi,
            "markdown": report,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
