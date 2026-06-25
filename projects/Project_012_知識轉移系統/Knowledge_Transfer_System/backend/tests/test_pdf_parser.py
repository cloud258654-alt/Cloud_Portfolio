from app.services.parser_service import DocumentParser


def test_pdf_parser_strategy_is_selected():
    parsed = DocumentParser().parse(
        storage_path="documents/general/sample.pdf",
        file_type="pdf",
        fallback_title="Sample PDF",
    )

    assert parsed["parser"] == "pdf_parser"
    assert "Sample PDF" in parsed["text"]
