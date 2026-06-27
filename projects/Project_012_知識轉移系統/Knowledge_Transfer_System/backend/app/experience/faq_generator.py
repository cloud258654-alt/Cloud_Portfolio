import json
import logging

from app.ai.ai_gateway import ai_gateway

logger = logging.getLogger(__name__)


class FAQGenerator:
    def generate(self, transcript: str) -> list[dict]:
        compact = transcript.replace("\n", " ")[:3000]
        prompt = (
            "Generate 3-5 FAQ items from the following experience transcript. "
            "Return ONLY a JSON array of objects, each with keys: question (string), answer (string), "
            "citation (string), confidence (number 0-1).\n\n"
            f"Transcript:\n{compact}"
        )

        messages = [
            {"role": "system", "content": "You are an expert knowledge analyst. Output only valid JSON array."},
            {"role": "user", "content": prompt},
        ]

        try:
            response = ai_gateway.chat(messages, temperature=0.3, max_tokens=1024)
            result = json.loads(response)
            if isinstance(result, list):
                return result
            return result if isinstance(result, list) else []
        except Exception as e:
            logger.warning("FAQ generation failed: %s", e)
            return [
                {
                    "question": "What is the key experience captured?",
                    "answer": compact[:300],
                    "citation": "transcript:segment:1",
                    "confidence": 0.0,
                }
            ]
