import json
import logging

from app.ai.ai_gateway import ai_gateway

logger = logging.getLogger(__name__)


class ExperienceExtractor:
    def extract(self, transcript: str) -> dict:
        compact = transcript.replace("\n", " ")[:3000]
        prompt = (
            "Extract structured knowledge from the following experience transcript. "
            "Return ONLY valid JSON with these keys: best_practices (list of {type, title, content}), "
            "common_mistakes (list of strings), troubleshooting (list of strings), "
            "checklist (list of strings), tips (list of strings), warnings (list of strings).\n\n"
            f"Transcript:\n{compact}"
        )

        messages = [
            {"role": "system", "content": "You are an expert knowledge extractor. Output only valid JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            response = ai_gateway.chat(messages, temperature=0.2, max_tokens=1024)
            result = json.loads(response)
            return {
                "best_practices": result.get("best_practices", []),
                "common_mistakes": result.get("common_mistakes", []),
                "troubleshooting": result.get("troubleshooting", []),
                "checklist": result.get("checklist", []),
                "tips": result.get("tips", []),
                "warnings": result.get("warnings", []),
            }
        except Exception as e:
            logger.warning("Experience extraction failed: %s", e)
            return {
                "best_practices": [
                    {"type": "best_practice", "title": "Review decisions with evidence", "content": compact[:280]}
                ],
                "common_mistakes": ["Relying on undocumented verbal instructions."],
                "troubleshooting": ["Trace each recommendation back to transcript segments."],
                "checklist": ["Confirm owner", "Review transcript", "Approve package"],
                "tips": ["Keep quotes short and tied to timestamps."],
                "warnings": ["Do not publish unreviewed expert claims."],
            }
