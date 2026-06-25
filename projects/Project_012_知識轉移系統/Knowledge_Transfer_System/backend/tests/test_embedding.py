from app.core.config import settings
from app.services.embedding_service import EmbeddingService


def test_embedding_service_returns_configured_dimension():
    vector = EmbeddingService().embed("hello")

    assert len(vector) == settings.embedding_dimension
    assert all(0 <= value <= 1 for value in vector)
