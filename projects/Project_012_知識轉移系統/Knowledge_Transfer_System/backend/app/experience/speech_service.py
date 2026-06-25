from pathlib import Path


class SpeechService:
    def transcribe(self, storage_path: str, *, expert_name: str | None = None) -> list[dict]:
        stem = Path(storage_path).stem.replace("_", " ")
        speaker = expert_name or "Speaker 1"
        return [
            {
                "speaker": speaker,
                "start_time": 0.0,
                "end_time": 12.0,
                "text": f"{stem} interview opening and background context.",
                "confidence": 0.86,
            },
            {
                "speaker": speaker,
                "start_time": 12.0,
                "end_time": 36.0,
                "text": "Key lessons, risks, troubleshooting notes, and practical recommendations were captured.",
                "confidence": 0.84,
            },
        ]
