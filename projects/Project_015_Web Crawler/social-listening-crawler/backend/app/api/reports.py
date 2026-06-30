from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime
from app.database import get_db
from app.models.mention import Mention
from app.models.keyword import Keyword
from app.services.brand_health_service import BrandHealthService

router = APIRouter()


@router.get("/daily")
def get_daily_report(db: Session = Depends(get_db)) -> Dict[str, Any]:
    try:
        total = db.query(func.count(Mention.id)).scalar() or 0
        pos = db.query(func.count(Mention.id)).filter(Mention.sentiment == "Positive").scalar() or 0
        neg = db.query(func.count(Mention.id)).filter(Mention.sentiment == "Negative").scalar() or 0
        
        # Risk Priority Counts
        p0_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P0").scalar() or 0
        p1_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P1").scalar() or 0
        p2_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P2").scalar() or 0
        p3_count = db.query(func.count(Mention.id)).filter(Mention.recommended_priority == "P3").scalar() or 0

        # Brand Health Score
        brand_health = BrandHealthService.calculate(db)

        # Root Cause Ranking
        root_cause_stats = (
            db.query(Mention.root_cause_category, func.count(Mention.id))
            .filter(Mention.root_cause_category != None, Mention.root_cause_category != "", Mention.root_cause_category != "其他")
            .group_by(Mention.root_cause_category)
            .order_by(func.count(Mention.id).desc())
            .limit(5)
            .all()
        )

        # Fetch top P0/P1 events
        high_events = (db.query(Mention)
                       .filter(Mention.recommended_priority.in_(["P0", "P1"]))
                       .order_by(Mention.risk_score.desc(), Mention.created_at.desc())
                       .limit(5).all())

        # Platforms risk source
        platform_stats = (db.query(Mention.platform, func.count(Mention.id))
                          .group_by(Mention.platform).order_by(func.count(Mention.id).desc()).all())
        platform_str = ", ".join([f"{p}: {c}筆" for p, c in platform_stats])

        # Unresolved events
        unresolved = db.query(Mention).filter(~Mention.status.in_(["resolved", "ignored"])).filter(Mention.recommended_priority.in_(["P0", "P1", "P2"])).order_by(Mention.recommended_priority.asc(), Mention.risk_score.desc()).limit(5).all()

        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        bh = brand_health
        report = f"""# 每日商譽智慧報告 - 文章牛肉湯
## {today_str}

---

## 一、今日品牌健康分數

| 指標 | 數值 |
|------|------|
| **品牌健康分數** | **{bh['brand_health_score']} / 100** |
| 相較昨日 | {'+' if bh['score_change'] >= 0 else ''}{bh['score_change']} 分 |
| 正向訊號 | {bh['positive_count']} 筆 ({bh['positive_ratio']}%) |
| 負向訊號 | {bh['negative_count']} 筆 ({bh['negative_ratio']}%) |
| 高風險事件 | {bh['high_risk_count']} 筆 |

> {bh['summary']}

---

## 二、今日聲量總覽

| 指標 | 數值 | 說明 |
|------|------|------|
| 風險訊號總數 | {total} 筆 | 所有平台監測信號 |
| 正面信號 | {pos} 筆 | 帶有正面情緒之信號 |
| 負面信號 | {neg} 筆 | 帶有負面情緒之信號 |
| **P0 級緊急事件** | **{p0_count} 筆** | 需立即在 1 小時內處置 |
| **P1 級高風險事件** | **{p1_count} 筆** | 需在 2 小時內處置 |
| P2 級中風險事件 | {p2_count} 筆 | 當日內需處置 |
| P3 級觀察事件 | {p3_count} 筆 | 僅需常規觀測 |

---

## 三、主要負評根因

"""
        if root_cause_stats:
            for rc, cnt in root_cause_stats:
                report += f"- **{rc}**：{cnt} 筆\n"
        else:
            report += "- *目前無明顯負評根因分類*\n"

        report += """
---

## 四、P0/P1 高風險事件

"""
        if high_events:
            for e in high_events:
                kwn = e.keyword.name if e.keyword else ""
                title = e.title or "無標題"
                report += f"### 【{e.recommended_priority} - 風險 {e.risk_score} 分】{title}\n"
                report += f"- 平台: {e.platform} | 品牌: {kwn}\n"
                if e.root_cause_category:
                    report += f"- 根因: {e.root_cause_category}\n"
                if e.risk_reason:
                    report += f"- 成因: {e.risk_reason}\n"
                if e.suggested_action:
                    report += f"- **建議行動**: {e.suggested_action}\n"
                if e.ai_summary:
                    report += f"- AI 摘要: {e.ai_summary}\n"
                report += "\n"
        else:
            report += "- *今日無 P0/P1 高風險商譽事件*\n\n"

        report += """
---

## 五、AI 重點摘要

"""
        if p0_count > 0:
            report += f"- ⚠ 偵測到 {p0_count} 筆 P0 級緊急商譽危機，需立即啟動應變程序。\n"
        if p1_count > 0:
            report += f"- 🚨 {p1_count} 筆 P1 級高風險事件，建議品牌主管 2 小時內審核。\n"
        if root_cause_stats:
            top_rc = root_cause_stats[0]
            report += f"- 📊 主要風險來源為「{top_rc[0]}」（{top_rc[1]} 筆），建議優先處理此類問題。\n"
        if p0_count == 0 and p1_count == 0:
            report += "- ✅ 品牌商譽狀況穩定，無重大危機事件。\n"

        report += """
---

## 六、今日建議行動

"""
        if unresolved:
            for u in unresolved:
                report += f"- [{u.recommended_priority}] {u.title or '無標題'} — {u.suggested_action or '請相關人員評估處理'}\n"
        else:
            report += "- ✅ 無待處理事件\n"

        report += """
---

## 七、待處理事件

"""
        if unresolved:
            for u in unresolved:
                report += f"- [{u.recommended_priority}] {u.title or '無標題'} | 平台: {u.platform} | 根因: {u.root_cause_category or '未分類'}\n"
        else:
            report += "- 無\n"

        return {
            "date": today_str,
            "total_mentions": total,
            "negative_count": neg,
            "high_risk_count": p0_count + p1_count,
            "reputation_risk_index": bh['brand_health_score'],
            "brand_health": bh,
            "markdown": report,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
