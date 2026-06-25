from celery import Celery

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.ingestion_service import IngestionService


celery_app = Celery(
    "kts_worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)


@celery_app.task(name="kts.debug_task")
def debug_task() -> str:
    return "ok"


@celery_app.task(
    name="kts.document_worker",
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 30},
)
def process_document(document_id: str) -> dict:
    db = SessionLocal()
    try:
        status = IngestionService(db).process_document(document_id)
        return status.model_dump()
    finally:
        db.close()


@celery_app.task(name="kts.ocr_worker")
def ocr_worker(document_id: str) -> str:
    return f"ocr queued for {document_id}"


@celery_app.task(name="kts.embedding_worker")
def embedding_worker(document_id: str) -> str:
    return f"embedding queued for {document_id}"


@celery_app.task(name="kts.metadata_worker")
def metadata_worker(document_id: str) -> str:
    return f"metadata queued for {document_id}"


@celery_app.task(name="kts.retry_worker")
def retry_worker(document_id: str) -> dict:
    return process_document(document_id)
