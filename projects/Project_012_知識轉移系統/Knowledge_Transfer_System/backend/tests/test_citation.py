from app.search.citation_builder import CitationBuilder


def test_citation_builder_returns_document_citation():
    citation = CitationBuilder().build(
        document_id="doc-1",
        document_title="ERP SOP",
        version="v1.0.0",
        page=3,
        chunk_id="chunk-1",
        section="Approval",
        score=0.8,
    )

    assert citation.document_title == "ERP SOP"
    assert citation.chunk_id == "chunk-1"
    assert citation.score == 0.8
