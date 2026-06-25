import hashlib

from app.core.config import settings


class EmbeddingService:
    def embed(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        values = [byte / 255 for byte in digest]
        repeats = (settings.embedding_dimension // len(values)) + 1
        return (values * repeats)[: settings.embedding_dimension]
