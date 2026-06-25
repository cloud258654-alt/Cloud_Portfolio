from datetime import datetime
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.experience.experience_extractor import ExperienceExtractor
from app.experience.faq_generator import FAQGenerator
from app.experience.knowledge_package import KnowledgePackageBuilder
from app.experience.speech_service import SpeechService
from app.experience.summary_service import SummaryService
from app.experience.transcript_service import TranscriptService
from app.models.experience import ExperienceRecord, ExperienceSegment
from app.schemas.experience import ALLOWED_EXPERIENCE_TYPES, ExperienceCreate, ExperiencePackage, ExperienceRead, ExperienceSegmentRead
from app.services.storage_service import StorageService


class ExperienceService:
    def __init__(self, db: Session, storage: StorageService | None = None) -> None:
        self.db = db
        self.storage = storage or StorageService()
        self.speech = SpeechService()
        self.transcripts = TranscriptService()
        self.summary = SummaryService()
        self.extractor = ExperienceExtractor()
        self.faq = FAQGenerator()
        self.packages = KnowledgePackageBuilder()

    def upload(self, file: UploadFile, payload: ExperienceCreate) -> ExperienceRead:
        extension = Path(file.filename or "").suffix.lower().lstrip(".")
        if extension not in ALLOWED_EXPERIENCE_TYPES:
            raise AppException("Unsupported experience media type", code="UNSUPPORTED_MEDIA_TYPE")

        try:
            storage_path, _file_type = self.storage.upload(
                file,
                department="experience",
                allowed_types=ALLOWED_EXPERIENCE_TYPES,
            )
        except ValueError as exc:
            raise AppException(str(exc), code="UNSUPPORTED_MEDIA_TYPE") from exc
        now = datetime.utcnow()
        record = ExperienceRecord(
            title=payload.title,
            source_type=payload.source_type,
            category=payload.category,
            expert_name=payload.expert_name,
            department_id=payload.department_id,
            raw_storage_path=storage_path,
            status="uploaded",
            experience_metadata={"original_filename": file.filename},
            created_at=now,
            updated_at=now,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return self.to_read(record)

    def list(self) -> list[ExperienceRead]:
        records = self.db.scalars(
            select(ExperienceRecord)
            .where(ExperienceRecord.deleted_at.is_(None))
            .order_by(ExperienceRecord.updated_at.desc())
        ).all()
        return [self.to_read(record) for record in records]

    def detail(self, experience_id: str) -> ExperienceRead:
        return self.to_read(self.require_record(experience_id))

    def process(self, experience_id: str) -> ExperienceRead:
        record = self.require_record(experience_id)
        if not record.raw_storage_path:
            raise AppException("Experience media is missing", code="MEDIA_MISSING")

        segments = self.speech.transcribe(record.raw_storage_path, expert_name=record.expert_name)
        transcript = self.transcripts.combine(segments)
        summary = self.summary.summarize(transcript)
        extracted = self.extractor.extract(transcript)
        faq = self.faq.generate(transcript)
        package = self.packages.build(
            transcript=transcript,
            summary=summary,
            extracted=extracted,
            faq=faq,
        )

        self._replace_segments(record.id, segments)
        record.transcript = transcript
        record.summary = summary["executive_summary"]
        record.status = "review"
        record.experience_metadata = {
            **(record.experience_metadata or {}),
            "summary": summary,
            "extraction": extracted,
            "faq": faq,
            "knowledge_package": package,
            "embedding_status": "ready_for_embedding",
        }
        record.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(record)
        return self.to_read(record)

    def approve(self, experience_id: str) -> ExperienceRead:
        record = self.require_record(experience_id)
        record.status = "approved"
        record.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(record)
        return self.to_read(record)

    def reject(self, experience_id: str) -> ExperienceRead:
        record = self.require_record(experience_id)
        record.status = "rejected"
        record.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(record)
        return self.to_read(record)

    def segments(self, experience_id: str) -> list[ExperienceSegmentRead]:
        self.require_record(experience_id)
        segments = self.db.scalars(
            select(ExperienceSegment)
            .where(ExperienceSegment.experience_id == experience_id)
            .order_by(ExperienceSegment.segment_index.asc())
        ).all()
        return [self.to_segment_read(segment) for segment in segments]

    def package(self, experience_id: str) -> ExperiencePackage:
        record = self.require_record(experience_id)
        package = (record.experience_metadata or {}).get("knowledge_package")
        if not package:
            package = self.packages.build(
                transcript=record.transcript or "",
                summary={},
                extracted={},
                faq=[],
            )
        return ExperiencePackage(**package)

    def require_record(self, experience_id: str) -> ExperienceRecord:
        record = self.db.get(ExperienceRecord, experience_id)
        if record is None:
            raise AppException("Experience record not found", code="EXPERIENCE_NOT_FOUND")
        return record

    def _replace_segments(self, experience_id: str, segments: list[dict]) -> None:
        existing = self.db.scalars(
            select(ExperienceSegment).where(ExperienceSegment.experience_id == experience_id)
        ).all()
        for item in existing:
            self.db.delete(item)
        self.db.flush()
        now = datetime.utcnow()
        for index, item in enumerate(segments):
            self.db.add(
                ExperienceSegment(
                    experience_id=experience_id,
                    segment_index=index,
                    speaker=item.get("speaker"),
                    start_time=item.get("start_time"),
                    end_time=item.get("end_time"),
                    text=item.get("text", ""),
                    confidence=item.get("confidence"),
                    segment_metadata={},
                    created_at=now,
                )
            )
        self.db.commit()

    @staticmethod
    def to_read(record: ExperienceRecord) -> ExperienceRead:
        return ExperienceRead(
            id=record.id,
            title=record.title,
            source_type=record.source_type,
            category=record.category,
            expert_name=record.expert_name,
            raw_storage_path=record.raw_storage_path,
            transcript=record.transcript,
            summary=record.summary,
            status=record.status,
            metadata=record.experience_metadata or {},
            created_at=record.created_at,
            updated_at=record.updated_at,
        )

    @staticmethod
    def to_segment_read(segment: ExperienceSegment) -> ExperienceSegmentRead:
        return ExperienceSegmentRead(
            id=segment.id,
            segment_index=segment.segment_index,
            speaker=segment.speaker,
            start_time=segment.start_time,
            end_time=segment.end_time,
            text=segment.text,
            confidence=segment.confidence,
        )
