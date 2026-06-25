import re


class MetadataExtractionService:
    def extract(self, text: str, *, title: str | None = None, language: str | None = None) -> dict:
        words = re.findall(r"[\w\u4e00-\u9fff]+", text.lower())
        keywords = []
        for word in words:
            if len(word) >= 4 and word not in keywords:
                keywords.append(word)
            if len(keywords) >= 10:
                break
        summary = text.strip().replace("\n", " ")[:500]
        return {
            "title": title,
            "keywords": keywords,
            "language": language,
            "summary": summary,
            "entities": [],
            "tags": keywords[:5],
        }
