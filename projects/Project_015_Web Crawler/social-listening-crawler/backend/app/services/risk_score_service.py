from typing import Dict, Any

KEYWORD_BONUS: Dict[str, int] = {
    "食安": 35,
    "衛生": 30,
    "拉肚子": 35,
    "很髒": 30,
    "態度差": 20,
    "等很久": 15,
    "排隊太久": 15,
    "停車不方便": 10,
    "太貴": 10,
    "不會再來": 20,
    "負評": 15,
    "爆料": 35,
}


class RiskScoreService:
    @staticmethod
    def calculate(
        sentiment: str,
        content: str,
        root_cause_category: str = "其他",
        likes: int = 0,
        comments: int = 0,
        shares: int = 0,
        is_resolved: bool = False,
    ) -> Dict[str, Any]:
        # Base score by sentiment
        if sentiment == "Positive":
            base = 5
        elif sentiment == "Neutral":
            base = 20
        else:
            base = 50

        # Keyword bonus
        keyword_bonus = 0
        for kw, pts in KEYWORD_BONUS.items():
            if kw in content:
                keyword_bonus = max(keyword_bonus, pts)
                break

        # Engagement bonus
        engagement_bonus = 0
        if comments > 10:
            engagement_bonus += 10
        if shares > 5:
            engagement_bonus += 10
        if likes > 50:
            engagement_bonus += 5

        # Root cause severity bonus
        root_cause_bonus = 0
        high_severity = ["衛生疑慮", "排隊等待", "服務態度"]
        medium_severity = ["價格", "環境整潔", "份量"]
        if root_cause_category in high_severity:
            root_cause_bonus = 15
        elif root_cause_category in medium_severity:
            root_cause_bonus = 8

        # Unresolved bonus
        unresolved_bonus = 10 if not is_resolved else 0

        risk_score = base + keyword_bonus + engagement_bonus + root_cause_bonus + unresolved_bonus
        risk_score = min(100, max(0, risk_score))

        # Risk level
        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Priority
        if risk_score >= 90 or ("食安" in content) or ("拉肚子" in content) or ("爆料" in content):
            priority = "P0"
        elif risk_score >= 70:
            priority = "P1"
        elif risk_score >= 30:
            priority = "P2"
        else:
            priority = "P3"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "priority": priority,
        }
