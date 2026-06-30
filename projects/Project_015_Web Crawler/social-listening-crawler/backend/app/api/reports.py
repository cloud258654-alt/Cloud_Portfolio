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
        
        # Risk Priority Counts
        p0_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P0").scalar() or 0
        p1_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P1").scalar() or 0
        p2_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P2").scalar() or 0
        p3_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P3").scalar() or 0

        # Average Risk Index
        avg_risk = db.query(func.avg(Mention.risk_score)).scalar()
        risk_index = round(float(avg_risk), 1) if avg_risk is not None else 0.0

        top_kw = (db.query(Keyword.name, func.count(Mention.id))
                  .join(Mention, Keyword.id == Mention.keyword_id)
                  .group_by(Keyword.name).order_by(func.count(Mention.id).desc()).limit(5).all())

        # Fetch top P0/P1 events
        high_events = (db.query(Mention)
                       .filter(Mention.recommended_priority.in_(["P0", "P1"]))
                       .order_by(Mention.risk_score.desc(), Mention.created_at.desc())
                       .limit(5).all())

        # Platforms risk source breakdown
        platform_stats = (db.query(Mention.platform, func.count(Mention.id))
                          .group_by(Mention.platform).order_by(func.count(Mention.id).desc()).all())
        platform_str = ", ".join([f"{p}: {c}筆" for p, c in platform_stats])

        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        report = f"""# 每日商譽風險偵測報告 - {today_str}

## 戰情總覽
| 指標 | 數值 / 狀態 | 說明 |
|------|------------|------|
| **商譽風險指數** | **{risk_index} / 100** | 近期平均風險分數 |
| 風險訊號總數 | {total} 筆 | 所有平台監測信號 |
| 負面信號 | {neg} 筆 | 帶有負面情緒之信號 |
| **P0 級緊急事件** | **{p0_count} 筆** | 需立即在 1 小時內處置 |
| **P1 級高風險事件** | **{p1_count} 筆** | 需在 2 小時內處置 |
| P2 級中風險事件 | {p2_count} 筆 | 當日內需處置 |
| P3 級觀察事件 | {p3_count} 筆 | 僅需常規觀測 |

## 風險主要來源平台
{platform_str if platform_stats else "無風險來源信號"}

## TOP 5 危機監測關鍵字
"""
        for kw, cnt in top_kw:
            report += f"- **{kw}**: 命中 {cnt} 次商譽風險信號\n"

        report += "\n## 高風險事件 (P0/P1) 明細\n"
        if high_events:
            for e in high_events:
                kwn = e.keyword.name if e.keyword else ""
                title = e.title or "無標題"
                report += f"### 【{e.recommended_priority} - 商譽分數 {e.risk_score}】{title}\n"
                report += f"- 平台: {e.platform} | 品牌標的: {kwn} | 風險成因: {e.risk_reason or '未知'}\n"
                if e.ai_summary:
                    report += f"- **AI 風險摘要**: {e.ai_summary}\n"
                if e.ai_suggestion:
                    report += f"- **處置對策建議**: {e.ai_suggestion}\n"
                report += "\n"
        else:
            report += "- *今日無 P0/P1 高風險商譽事件，狀況穩定。*\n\n"

        report += "## AI 建議優先處置對策\n"
        if p0_count > 0:
            report += f"- ⚠ **緊急處置**：偵測到 {p0_count} 筆 P0 級緊急商譽危機！公關團隊應立即啟動危機應變程序，在 1 小時內發布澄清。\n"
        if p1_count > 0:
            report += f"- 🚨 **高優處理**：有 {p1_count} 筆 P1 級商譽負面信號，請相關品牌主管於 2 小時內審核並準備回應稿。\n"
        if p2_count > 5:
            report += f"- 💬 **社群追蹤**：中風險 P2 級事件偏多 ({p2_count}筆)，客服團隊應主動介入防範擴散。\n"
        if p0_count == 0 and p1_count == 0:
            report += "- ✅ 今日整體商譽安全度良好，無重大品牌負評，持續保持常規監控即可。\n"

        return {
            "date": today_str,
            "total_mentions": total,
            "negative_count": neg,
            "high_risk_count": p0_count + p1_count,
            "reputation_risk_index": risk_index,
            "markdown": report,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
