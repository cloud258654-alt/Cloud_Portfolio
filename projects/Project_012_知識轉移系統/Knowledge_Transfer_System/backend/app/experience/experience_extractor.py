class ExperienceExtractor:
    def extract(self, transcript: str) -> dict:
        return {
            "best_practices": [
                {
                    "type": "best_practice",
                    "title": "Review decisions with source evidence",
                    "content": transcript[:280],
                }
            ],
            "common_mistakes": [
                "Relying on undocumented verbal instructions.",
            ],
            "troubleshooting": [
                "Trace each recommendation back to transcript segments.",
            ],
            "checklist": [
                "Confirm owner",
                "Review transcript",
                "Approve package",
            ],
            "tips": [
                "Keep quotes short and tied to timestamps.",
            ],
            "warnings": [
                "Do not publish unreviewed expert claims.",
            ],
        }
