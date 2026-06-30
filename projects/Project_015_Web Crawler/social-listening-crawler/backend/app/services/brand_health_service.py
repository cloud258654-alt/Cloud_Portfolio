from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.mention import Mention


class BrandHealthService:
    @staticmethod
    def calculate(db: Session, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        base = db.query(Mention)

        if start_date:
            try:
                d = datetime.fromisoformat(start_date)
                base = base.filter(Mention.created_at >= d)
            except ValueError:
                pass
        if end_date:
            try:
                d = datetime.fromisoformat(end_date) + timedelta(days=1)
                base = base.filter(Mention.created_at < d)
            except ValueError:
                pass

        total = base.count() or 1
        positive = base.filter(Mention.sentiment == "Positive").count()
        negative = base.filter(Mention.sentiment == "Negative").count()
        neutral = base.filter(Mention.sentiment == "Neutral").count()
        high_risk = base.filter(Mention.risk_level == "High").count()

        pos_ratio = (positive / total) * 100
        neg_ratio = (negative / total) * 100

        # Brand Health Score formula:
        # rating_score(30%) + positive_ratio(20%) - negative_penalty(20%) - risk_penalty(20%) + trend(10%)
        rating_score = min(30, (pos_ratio / 100) * 30)
        positive_score = min(20, (pos_ratio / 100) * 20)
        negative_penalty = min(20, (neg_ratio / 100) * 20)
        risk_penalty = min(20, (high_risk / max(total, 1)) * 100 * 0.2)

        # Trend: compare last 7 days vs previous 7 days
        now = datetime.utcnow()
        recent = db.query(Mention).filter(Mention.created_at >= now - timedelta(days=7))
        recent_total = recent.count() or 1
        recent_pos = recent.filter(Mention.sentiment == "Positive").count()
        recent_pos_ratio = (recent_pos / recent_total) * 100

        prev = db.query(Mention).filter(
            Mention.created_at >= now - timedelta(days=14),
            Mention.created_at < now - timedelta(days=7),
        )
        prev_total = prev.count() or 1
        prev_pos = prev.filter(Mention.sentiment == "Positive").count()
        prev_pos_ratio = (prev_pos / prev_total) * 100

        trend_score = 5
        diff = recent_pos_ratio - prev_pos_ratio
        if diff > 5:
            trend_score = 10
        elif diff > 0:
            trend_score = 7
        elif diff < -5:
            trend_score = 0
        elif diff < 0:
            trend_score = 3

        health_score = round(rating_score + positive_score - negative_penalty - risk_penalty + trend_score)
        health_score = max(0, min(100, health_score))

        # Top root causes
        root_cause_stats = (
            base.with_entities(Mention.root_cause_category, func.count(Mention.id))
            .filter(Mention.root_cause_category != None, Mention.root_cause_category != "")
            .group_by(Mention.root_cause_category)
            .order_by(func.count(Mention.id).desc())
            .limit(5)
            .all()
        )
        top_root_causes = [{"category": rc, "count": cnt} for rc, cnt in root_cause_stats]

        # Previous score for comparison (last snapshot or estimate)
        yesterday = now - timedelta(days=1)
        yesterday_mentions = db.query(Mention).filter(
            Mention.created_at >= yesterday.replace(hour=0, minute=0, second=0),
            Mention.created_at < yesterday.replace(hour=23, minute=59, second=59),
        )
        y_total = yesterday_mentions.count() or 1
        y_pos = yesterday_mentions.filter(Mention.sentiment == "Positive").count()
        y_pos_ratio = (y_pos / y_total) * 100
        y_rating = min(30, (y_pos_ratio / 100) * 30)
        y_p_score = min(20, (y_pos_ratio / 100) * 20)
        y_neg = yesterday_mentions.filter(Mention.sentiment == "Negative").count()
        y_neg_ratio = (y_neg / y_total) * 100
        y_neg_p = min(20, (y_neg_ratio / 100) * 20)
        prev_score = round(y_rating + y_p_score - y_neg_p)
        prev_score = max(0, min(100, prev_score))

        score_change = health_score - prev_score

        # Summary
        parts = []
        if top_root_causes:
            parts.append(f"主要負評根因：{', '.join(f'{r['category']}({r['count']}筆)' for r in top_root_causes[:3])}")
        if score_change > 0:
            parts.append(f"相較昨日上升 {score_change} 分")
        elif score_change < 0:
            parts.append(f"相較昨日下降 {abs(score_change)} 分")
        else:
            parts.append("與昨日持平")

        return {
            "brand_health_score": health_score,
            "previous_score": prev_score,
            "score_change": score_change,
            "positive_count": positive,
            "neutral_count": neutral,
            "negative_count": negative,
            "total_mentions": total,
            "high_risk_count": high_risk,
            "positive_ratio": round(pos_ratio, 1),
            "negative_ratio": round(neg_ratio, 1),
            "top_root_causes": top_root_causes,
            "summary": "；".join(parts),
        }
