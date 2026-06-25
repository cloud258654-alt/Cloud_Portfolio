from app.services.chunk_service import ChunkConfig, ChunkService


def test_chunk_service_uses_configured_overlap():
    service = ChunkService(ChunkConfig(size=4, overlap=1))
    chunks = service.build_chunks("one two three four five six", title="Doc")

    assert len(chunks) == 2
    assert chunks[1]["content"].startswith("four")
