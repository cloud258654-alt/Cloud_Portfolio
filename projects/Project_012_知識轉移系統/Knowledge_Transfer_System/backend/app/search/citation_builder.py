from pydantic import BaseModel


class SearchCitation(BaseModel):
    document_id: str
    document_title: str
    version: str | None = None
    page: int | None = None
    chunk_id: str | None = None
    section: str | None = None
    score: float


class CitationBuilder:
    def build(
        self,
        *,
        document_id: str,
        document_title: str,
        version: str | None,
        page: int | None,
        chunk_id: str | None,
        section: str | None,
        score: float,
    ) -> SearchCitation:
        return SearchCitation(
            document_id=document_id,
            document_title=document_title,
            version=version,
            page=page,
            chunk_id=chunk_id,
            section=section,
            score=score,
        )
