import json
import logging

from app.ai.ai_gateway import ai_gateway

logger = logging.getLogger(__name__)


class SummaryService:
    def summarize(self, transcript: str) -> dict:
        compact = transcript.replace("\n", " ")[:3000]
        prompt = (
            "Analyze the following experience transcript and extract the structured summary in JSON format. "
            "Return ONLY valid JSON with these keys: executive_summary (string), key_decisions (list of strings), "
            "lessons_learned (list of strings), risks (list of strings), recommendations (list of strings), "
            "important_quotes (list of strings).\n\n"
            f"Transcript:\n{compact}"
        )

        messages = [
            {"role": "system", "content": "You are an expert knowledge analyst. Output only valid JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            response = ai_gateway.chat(messages, temperature=0.1, max_tokens=1024)
            result = json.loads(response)
            return {
                "executive_summary": result.get("executive_summary", ""),
                "key_decisions": result.get("key_decisions", []),
                "lessons_learned": result.get("lessons_learned", []),
                "risks": result.get("risks", []),
                "recommendations": result.get("recommendations", []),
                "important_quotes": result.get("important_quotes", []),
            }
        except Exception as e:
            logger.warning("Summary generation failed: %s", e)
            return {
                "executive_summary": compact[:700],
                "key_decisions": ["Decision extraction requires AI API key."],
                "lessons_learned": ["Document operational context with examples."],
                "risks": ["Knowledge loss if experience remains verbal only."],
                "recommendations": ["Review extracted package with the expert owner."],
                "important_quotes": [compact[:180]] if compact else [],
            }
