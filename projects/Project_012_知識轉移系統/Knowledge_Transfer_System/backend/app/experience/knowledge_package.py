class KnowledgePackageBuilder:
    def build(
        self,
        *,
        transcript: str,
        summary: dict,
        extracted: dict,
        faq: list[dict],
    ) -> dict:
        keywords = []
        for word in transcript.lower().split():
            clean = word.strip(".,:;!?[]()")
            if len(clean) >= 5 and clean not in keywords:
                keywords.append(clean)
            if len(keywords) >= 12:
                break
        return {
            "transcript": transcript,
            "summary": summary,
            "faq": faq,
            "best_practices": extracted.get("best_practices", []),
            "keywords": keywords,
            "tags": keywords[:5],
            "related_documents": [],
        }
