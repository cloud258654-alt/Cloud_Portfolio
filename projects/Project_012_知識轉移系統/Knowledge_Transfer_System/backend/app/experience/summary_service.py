class SummaryService:
    def summarize(self, transcript: str) -> dict:
        compact = transcript.replace("\n", " ")[:700]
        return {
            "executive_summary": compact,
            "key_decisions": ["Capture and review tacit knowledge before handover."],
            "lessons_learned": ["Document operational context with examples."],
            "risks": ["Knowledge loss if experience remains only verbal."],
            "recommendations": ["Review extracted package with the expert owner."],
            "important_quotes": [compact[:180]] if compact else [],
        }
