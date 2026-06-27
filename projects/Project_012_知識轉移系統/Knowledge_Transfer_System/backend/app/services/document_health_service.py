"""Document health scoring and stale content detection."""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.chat import Citation

logger = logging.getLogger(__name__)


class DocumentHealthService:
    STALE_DAYS = 180
    ARCHIVE_DAYS = 365
    LOW_CITATION_WINDOW_DAYS = 30

    def __init__(self, db: Session):
        self.db = db

    def calculate_health(self, document: Document) -> dict:
        score = 0
        details: dict[str, dict] = {}

        recency_score, recency_detail = self._score_recency(document)
        score += recency_score
        details["recency"] = recency_detail

        usage_score, usage_detail = self._score_usage(document)
        score += usage_score
        details["usage"] = usage_detail

        quality_score, quality_detail = self._score_quality(document)
        score += quality_score
        details["quality"] = quality_detail

        completeness_score, completeness_detail = self._score_completeness(document)
        score += completeness_score
        details["completeness"] = completeness_detail

        health = min(100, max(0, score))
        return {"score": health, "details": details}

    def _score_recency(self, doc: Document) -> tuple[int, dict]:
        max_score = 25
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        updated = doc.updated_at or doc.created_at or now

        days_since = (now - updated).days
        if days_since <= 30:
            return max_score, {"days_since_update": days_since, "label": "up_to_date"}
        if days_since <= 90:
            return 20, {"days_since_update": days_since, "label": "recent"}
        if days_since <= 180:
            return 15, {"days_since_update": days_since, "label": "aging"}
        if days_since <= 365:
            return 8, {"days_since_update": days_since, "label": "stale"}
        return 0, {"days_since_update": days_since, "label": "outdated"}

    def _score_usage(self, doc: Document) -> tuple[int, dict]:
        max_score = 25
        citation_count = (
            self.db.query(Citation)
            .filter(Citation.document_id == doc.id)
            .count()
        )

        if citation_count >= 20:
            return max_score, {"citations": citation_count, "label": "high_usage"}
        if citation_count >= 10:
            return 20, {"citations": citation_count, "label": "moderate_usage"}
        if citation_count >= 5:
            return 15, {"citations": citation_count, "label": "some_usage"}
        if citation_count >= 1:
            return 10, {"citations": citation_count, "label": "low_usage"}
        return 0, {"citations": 0, "label": "unused"}

    def _score_quality(self, doc: Document) -> tuple[int, dict]:
        max_score = 25
        feedback_data = {"avg_rating": None, "label": "unrated"}
        from app.models.chat import Feedback

        feedbacks = (
            self.db.query(Feedback)
            .join(Citation, Feedback.message_id == Citation.message_id)
            .filter(Citation.document_id == doc.id)
            .all()
        )
        if not feedbacks:
            return 15, feedback_data

        avg = sum(f.rating for f in feedbacks) / len(feedbacks)
        feedback_data["avg_rating"] = round(avg, 2)
        feedback_data["count"] = len(feedbacks)

        if avg >= 4.0:
            return max_score, {**feedback_data, "label": "highly_rated"}
        if avg >= 3.0:
            return 20, {**feedback_data, "label": "rated"}
        if avg >= 2.0:
            return 10, {**feedback_data, "label": "mixed"}
        return 5, {**feedback_data, "label": "poorly_rated"}

    def _score_completeness(self, doc: Document) -> tuple[int, dict]:
        max_score = 25
        score = 0
        checks = {}

        if doc.title:
            score += 5
            checks["has_title"] = True
        else:
            checks["has_title"] = False

        if doc.description:
            score += 7
            checks["has_description"] = True
        else:
            checks["has_description"] = False

        version_count = len(doc.versions) if doc.versions else 0
        if version_count >= 3:
            score += 8
            checks["version_count"] = version_count
        elif version_count >= 1:
            score += 5
            checks["version_count"] = version_count
        else:
            checks["version_count"] = 0

        if doc.doc_metadata.get("summary"):
            score += 5
            checks["has_summary"] = True
        else:
            checks["has_summary"] = False

        return score, checks

    def update_health(self, document: Document) -> Document:
        health = self.calculate_health(document)
        document.doc_metadata = {
            **document.doc_metadata,
            "health": health,
            "health_updated_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
        }
        self.db.commit()
        return document

    def find_stale_documents(self) -> list[Document]:
        stale_threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=self.STALE_DAYS)
        archive_threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=self.ARCHIVE_DAYS)

        stale = (
            self.db.query(Document)
            .filter(
                Document.deleted_at.is_(None),
                Document.status != "archived",
                ((Document.updated_at.is_(None)) | (Document.updated_at < stale_threshold)),
            )
            .all()
        )

        archivable = [
            d for d in stale
            if (d.updated_at or d.created_at) and (d.updated_at or d.created_at) < archive_threshold
        ]
        return stale

    def mark_stale(self, document: Document) -> Document:
        health = self.calculate_health(document)
        document.doc_metadata = {
            **document.doc_metadata,
            "health": health,
            "stale_flagged_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
        }
        if health["score"] < 30:
            document.status = "needs_review"
        self.db.commit()
        return document

    def archive_if_eligible(self, document: Document) -> bool:
        health = self.calculate_health(document)
        archive_threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=self.ARCHIVE_DAYS)
        last_updated = document.updated_at or document.created_at

        if health["score"] < 20 and last_updated and last_updated < archive_threshold:
            document.status = "archived"
            document.doc_metadata = {**document.doc_metadata, "archived_reason": "stale_and_unused"}
            self.db.commit()
            return True
        return False

    def run_health_check(self) -> dict:
        documents = self.db.query(Document).filter(Document.deleted_at.is_(None)).all()
        results = []
        for doc in documents:
            health = self.calculate_health(doc)
            doc.doc_metadata = {
                **doc.doc_metadata,
                "health": health,
                "health_updated_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
            }
            results.append({"id": doc.id, "title": doc.title, "health": health})

        stale = self.find_stale_documents()
        for s in stale:
            self.mark_stale(s)

        self.db.commit()

        return {
            "total": len(documents),
            "stale_count": len(stale),
            "average_health": sum(r["health"]["score"] for r in results) / max(len(results), 1),
            "documents": results,
        }
