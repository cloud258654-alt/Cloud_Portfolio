from pydantic import BaseModel


class ParsedQuery(BaseModel):
    raw: str
    keywords: list[str]
    department: str | None = None


class QueryParser:
    def parse(self, query: str, department: str | None = None) -> ParsedQuery:
        keywords = [part.strip().lower() for part in query.split() if part.strip()]
        return ParsedQuery(raw=query, keywords=keywords, department=department)
