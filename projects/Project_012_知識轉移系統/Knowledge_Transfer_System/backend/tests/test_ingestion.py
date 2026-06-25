from app.services.chunk_service import ChunkConfig, ChunkService
from app.services.language_service import LanguageService
from app.services.metadata_service import MetadataExtractionService
from app.services.parser_service import DocumentParser


def test_chunk_service_builds_overlapping_chunks():
    service = ChunkService(ChunkConfig(size=5, overlap=2))
    chunks = service.build_chunks(
        "one two three four five six seven eight",
        title="Sample",
        language="en",
    )

    assert len(chunks) == 3
    assert chunks[0]["chunk_index"] == 0
    assert chunks[0]["token_count"] == 5
    assert chunks[1]["content"].startswith("four")


def test_language_detection_supports_chinese_and_english():
    assert LanguageService.detect("This is a document") == "en"
    assert LanguageService.detect("這是一份文件") == "zh-TW"


def test_metadata_extraction_returns_summary_and_keywords():
    metadata = MetadataExtractionService().extract(
        "Procurement policy document for supplier onboarding",
        title="Policy",
        language="en",
    )

    assert metadata["title"] == "Policy"
    assert metadata["language"] == "en"
    assert "procurement" in metadata["keywords"]
    assert metadata["summary"]


def test_document_parser_returns_placeholder_text():
    parsed = DocumentParser().parse(
        storage_path="documents/general/sample.pdf",
        file_type="pdf",
        fallback_title="Sample PDF",
    )

    assert parsed["parser"] == "pdf_parser"
    assert "Sample PDF" in parsed["text"]
