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


def analyze_with_llm(text: str, keyword: str) -> Dict[str, Any]:
    if OPENAI_KEY:
        try:
            import requests
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "Analyze the sentiment, risk level, and purchase intent of this social media post about a brand/product. Return JSON: {sentiment, sentiment_score, risk_level, purchase_intent, summary, suggestion, keyphrases}."},
                        {"role": "user", "content": f"Keyword: {keyword}\nText: {text}"},
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
                    return {
                        "sentiment": parsed.get("sentiment", "Neutral"),
                        "sentiment_score": float(parsed.get("sentiment_score", 0)),
                        "risk_level": parsed.get("risk_level", "Low"),
                        "purchase_intent": bool(parsed.get("purchase_intent", False)),
                        "ai_summary": parsed.get("summary", ""),
                        "ai_suggestion": parsed.get("suggestion", ""),
                        "status": "Processed",
                        "model_name": "openai-gpt-4o-mini",
                    }
                except Exception:
                    logger.warning("Failed to parse LLM JSON response")
        except Exception as e:
            logger.warning(f"LLM API call failed, falling back to rule-based: {e}")

    result = AIService.analyze_content(text, keyword)
    result["model_name"] = "rule-based"
    return result
