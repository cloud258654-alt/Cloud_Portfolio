"""Enhanced answer validator with hallucination detection and confidence tiers."""

import re


class AnswerValidator:
    TIER_THRESHOLDS = {
        "verified": 0.80,
        "partial": 0.50,
        "uncertain": 0.0,
    }

    def validate(self, *, answer: str, citation_count: int) -> dict:
        if citation_count == 0:
            return {
                "confidence": 0.25,
                "valid": False,
                "tier": "uncertain",
                "message": "No supporting citations were found.",
            }
        if not answer.strip():
            return {
                "confidence": 0.0,
                "valid": False,
                "tier": "uncertain",
                "message": "Answer is empty.",
            }

        confidence = min(0.95, 0.55 + citation_count * 0.08)
        tier = self._tier_for(confidence)

        return {
            "confidence": confidence,
            "valid": True,
            "tier": tier,
            "message": "validated",
        }

    def check_grounding(self, answer: str, context_snippets: list[str], citations: list) -> dict:
        sentences = self._split_sentences(answer)
        grounded = []
        ungrounded = []

        for sentence in sentences:
            is_grounded = self._sentence_has_source(sentence, context_snippets)
            if is_grounded:
                grounded.append(sentence)
            else:
                ungrounded.append(sentence)

        grounding_ratio = len(grounded) / max(len(sentences), 1)
        tier = self._tier_for(grounding_ratio)

        return {
            "grounding_ratio": round(grounding_ratio, 2),
            "total_sentences": len(sentences),
            "grounded_count": len(grounded),
            "ungrounded_count": len(ungrounded),
            "ungrounded_sentences": ungrounded[:5],
            "tier": tier,
            "citation_count": len(citations),
        }

    @staticmethod
    def _split_sentences(text: str) -> list[str]:
        raw = re.split(r"(?<=[。！？.!?])\s*", text)
        return [s.strip() for s in raw if s.strip() and len(s.strip()) > 5]

    @staticmethod
    def _sentence_has_source(sentence: str, snippets: list[str]) -> bool:
        if not snippets:
            return False
        sentence_lower = sentence.lower()
        for snippet in snippets:
            words = set(sentence_lower.split()) & set(snippet.lower().split())
            if len(words) >= 3:
                return True
        return False

    @staticmethod
    def _tier_for(score: float) -> str:
        if score >= 0.80:
            return "verified"
        if score >= 0.50:
            return "partial"
        return "uncertain"

    def tier_badge(self, tier: str) -> dict:
        badges = {
            "verified": {"label": "Verified", "color": "#2E7D32", "icon": "shield-check"},
            "partial": {"label": "Partial", "color": "#F9A825", "icon": "alert-circle"},
            "uncertain": {"label": "Uncertain", "color": "#E53935", "icon": "help-circle"},
        }
        return badges.get(tier, badges["uncertain"])
