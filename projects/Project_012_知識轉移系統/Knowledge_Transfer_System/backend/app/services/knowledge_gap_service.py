"""Knowledge gap analysis from search logs and usage patterns."""

import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.chat import Conversation
from app.models.document import Document
from app.models.chat import Citation

logger = logging.getLogger(__name__)


class KnowledgeGapService:
    def __init__(self, db: Session):
        self.db = db

    def analyze(self) -> dict:
        return {
            "zero_result_searches": self._zero_result_searches(),
            "frequent_unanswered_questions": self._frequent_unanswered(),
            "low_coverage_topics": self._low_coverage_topics(),
            "gap_summary": self._gap_summary(),
        }

    def _zero_result_searches(self) -> list[dict]:
        conversations = (
            self.db.query(Conversation)
            .filter(Conversation.deleted_at.is_(None))
            .order_by(Conversation.created_at.desc())
            .limit(200)
            .all()
        )

        unanswered = []
        seen = set()
        for conv in conversations:
            messages = conv.messages or []
            user_msgs = [m for m in messages if m.sender_type == "user"]
            assistant_msgs = [m for m in messages if m.sender_type == "assistant"]

            for msg in user_msgs[-5:]:
                if msg.message.lower() in seen:
                    continue
                seen.add(msg.message.lower())

                has_answer = any(
                    "找不到" in a.message or "low_confidence" in (a.metadata or {}).get("confidence_tier", "")
                    for a in assistant_msgs
                )
                if has_answer:
                    unanswered.append({
                        "query": msg.message[:200],
                        "conversation_id": conv.id,
                        "timestamp": str(msg.created_at or ""),
                    })

        return unanswered[:20]

    def _frequent_unanswered(self) -> list[dict]:
        unanswered = self._zero_result_searches()
        freq: dict[str, int] = {}
        for item in unanswered:
            key = item["query"].lower()[:80]
            freq[key] = freq.get(key, 0) + 1

        return [
            {"query": k, "frequency": v}
            for k, v in sorted(freq.items(), key=lambda x: -x[1])[:10]
        ]

    def _low_coverage_topics(self) -> list[dict]:
        docs = self.db.query(Document).filter(Document.deleted_at.is_(None)).all()
        doc_topics: dict[str, list[str]] = {}
        for doc in docs:
            topic = doc.doc_metadata.get("category") or doc.doc_metadata.get("topic") or "uncategorized"
            doc_topics.setdefault(topic, []).append(doc.id)

        topic_stats = []
        for topic, doc_ids in doc_topics.items():
            citations = (
                self.db.query(Citation)
                .filter(Citation.document_id.in_(doc_ids))
                .count()
            )
            topic_stats.append({
                "topic": topic,
                "document_count": len(doc_ids),
                "total_citations": citations,
            })

        topic_stats.sort(key=lambda x: x["total_citations"])
        return topic_stats[:10]

    def _gap_summary(self) -> dict:
        zero = self._zero_result_searches()
        freq = self._frequent_unanswered()
        low = self._low_coverage_topics()

        total_docs = self.db.query(Document).filter(Document.deleted_at.is_(None)).count()

        return {
            "unanswered_queries_count": len(zero),
            "top_gaps": [f["query"] for f in freq[:5]],
            "lowest_coverage_topic": low[0]["topic"] if low else "N/A",
            "total_documents": total_docs,
            "recommendation": (
                f"Consider creating documents for: {', '.join(f['query'][:60] for f in freq[:3])}"
                if freq
                else "No significant knowledge gaps detected."
            ),
        }
