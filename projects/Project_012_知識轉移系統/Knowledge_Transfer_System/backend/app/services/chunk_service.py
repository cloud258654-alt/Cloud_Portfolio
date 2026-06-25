from dataclasses import dataclass


@dataclass(frozen=True)
class ChunkConfig:
    size: int = 800
    overlap: int = 100


class ChunkService:
    def __init__(self, config: ChunkConfig | None = None) -> None:
        self.config = config or ChunkConfig()

    def build_chunks(
        self,
        text: str,
        *,
        title: str | None = None,
        language: str | None = None,
    ) -> list[dict]:
        words = text.split()
        if not words:
            return []

        chunks: list[dict] = []
        start = 0
        index = 0
        step = max(1, self.config.size - self.config.overlap)
        while start < len(words):
            selected = words[start : start + self.config.size]
            chunks.append(
                {
                    "chunk_index": index,
                    "title": title,
                    "content": " ".join(selected),
                    "token_count": len(selected),
                    "metadata": {"language": language},
                }
            )
            index += 1
            start += step
        return chunks
