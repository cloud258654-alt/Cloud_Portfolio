class TranscriptService:
    def combine(self, segments: list[dict]) -> str:
        return "\n".join(
            f"[{item.get('start_time', 0):.1f}-{item.get('end_time', 0):.1f}] "
            f"{item.get('speaker', 'Speaker')}: {item.get('text', '')}"
            for item in segments
        )
