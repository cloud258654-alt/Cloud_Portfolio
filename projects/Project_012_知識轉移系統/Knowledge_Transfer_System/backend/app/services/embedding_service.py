import hashlib
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def embed(self, text: str) -> list[float]:
        if settings.openai_api_key:
            try:
                return self._embed_openai(text)
            except Exception as e:
                logger.warning("OpenAI embedding failed, falling back: %s", e)

        return self._embed_deterministic(text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if settings.openai_api_key:
            try:
                return self._embed_openai_batch(texts)
            except Exception as e:
                logger.warning("OpenAI batch embedding failed, falling back: %s", e)

        return [self._embed_deterministic(t) for t in texts]

    def _embed_openai(self, text: str) -> list[float]:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=text,
            dimensions=settings.embedding_dimension,
        )
        return response.data[0].embedding

    def _embed_openai_batch(self, texts: list[str]) -> list[list[float]]:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=texts,
            dimensions=settings.embedding_dimension,
        )
        return [item.embedding for item in response.data]

    @staticmethod
    def _embed_deterministic(text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        values = [byte / 255 for byte in digest]
        repeats = (settings.embedding_dimension // len(values)) + 1
        return (values * repeats)[: settings.embedding_dimension]
