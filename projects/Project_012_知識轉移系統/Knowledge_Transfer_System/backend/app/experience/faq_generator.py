class FAQGenerator:
    def generate(self, transcript: str) -> list[dict]:
        base = transcript[:240] or "No transcript available."
        return [
            {
                "question": "What is the key experience captured?",
                "answer": base,
                "citation": "transcript:segment:1",
                "confidence": 0.72,
            },
            {
                "question": "What should reviewers verify?",
                "answer": "Reviewers should verify transcript accuracy, recommendations, and risk statements.",
                "citation": "transcript:summary",
                "confidence": 0.7,
            },
        ]
