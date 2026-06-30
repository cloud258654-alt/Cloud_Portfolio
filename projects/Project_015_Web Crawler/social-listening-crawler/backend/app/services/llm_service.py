"""
Mock LLM service that wraps rule-based AI with optional OpenAI fallback.
If OPENAI_API_KEY is set in environment, attempts GPT call.
On any failure, falls back to rule-based AIService.
"""
import os
import logging
from typing import Dict, Any
from app.services.ai_service import AIService

logger = logging.getLogger("llm_service")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")


def analyze_with_llm(
    text: str,
    keyword: str,
    likes: int = 0,
    comments: int = 0,
    shares: int = 0,
    is_resolved: bool = False,
    recent_count: int = 0,
    platform: str = ""
) -> Dict[str, Any]:
    from app.config import settings
    openai_key = settings.OPENAI_API_KEY
    if openai_key:
        try:
            import requests
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "Analyze the reputation risk of this social media post about a brand/product. Return JSON: {sentiment: 'Positive'/'Neutral'/'Negative', sentiment_score: -1.0 to 1.0, risk_score: 0 to 100, risk_reason: 'A brief sentence explaining factors', crisis_keywords_matched: ['scam'/'outage'/etc in Chinese], recommended_priority: 'P0'/'P1'/'P2'/'P3', purchase_intent: boolean, summary: 'string', suggestion: 'string'}"},
                        {"role": "user", "content": f"Keyword: {keyword}\nPlatform: {platform}\nLikes: {likes}, Comments: {comments}, Shares: {shares}\nRecent 24h keyword occurrences count: {recent_count}\nText: {text}"},
                    ],
                    "temperature": 0.3,
                },
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json()
                raw = data["choices"][0]["message"]["content"]
                try:
                    import json
                    parsed = json.loads(raw)
                    r_score = int(parsed.get("risk_score", 0))
                    # Map risk level
                    if r_score >= 70:
                        r_level = "High"
                    elif r_score >= 30:
                        r_level = "Medium"
                    else:
                        r_level = "Low"
                    
                    matched_kws = parsed.get("crisis_keywords_matched", [])
                    if isinstance(matched_kws, list):
                        crisis_str = ",".join(matched_kws)
                    else:
                        crisis_str = str(matched_kws)

                    return {
                        "sentiment": parsed.get("sentiment", "Neutral"),
                        "sentiment_score": float(parsed.get("sentiment_score", 0.0)),
                        "risk_level": r_level,
                        "risk_score": r_score,
                        "risk_reason": parsed.get("risk_reason", ""),
                        "crisis_keywords_matched": crisis_str,
                        "recommended_priority": parsed.get("recommended_priority", "P3"),
                        "purchase_intent": bool(parsed.get("purchase_intent", False)),
                        "ai_summary": parsed.get("summary", ""),
                        "ai_suggestion": parsed.get("suggestion", ""),
                        "status": "new" if not is_resolved else "resolved",
                        "model_name": "openai-gpt-4o-mini",
                    }
                except Exception:
                    logger.warning("Failed to parse LLM JSON response")
        except Exception as e:
            logger.warning(f"LLM API call failed, falling back to rule-based: {e}")

    # Fallback to rule-based AIService
    result = AIService.analyze_content(
        text, keyword, likes=likes, comments=comments, shares=shares,
        is_resolved=is_resolved, recent_count=recent_count, platform=platform
    )
    result["model_name"] = "rule-based"
    return result
