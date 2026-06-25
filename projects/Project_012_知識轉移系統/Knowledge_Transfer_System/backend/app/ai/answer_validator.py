class AnswerValidator:
    def validate(self, *, answer: str, citation_count: int) -> dict:
        if citation_count == 0:
            return {
                "confidence": 0.25,
                "valid": False,
                "message": "No supporting citations were found.",
            }
        if not answer.strip():
            return {
                "confidence": 0.0,
                "valid": False,
                "message": "Answer is empty.",
            }
        return {
            "confidence": min(0.95, 0.55 + citation_count * 0.08),
            "valid": True,
            "message": "validated",
        }
