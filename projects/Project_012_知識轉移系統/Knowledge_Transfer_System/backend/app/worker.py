from celery import Celery

celery_app = Celery(
    "kts_worker",
    broker="redis://redis:6379/1",
    backend="redis://redis:6379/2",
)


@celery_app.task(name="kts.healthcheck")
def healthcheck() -> str:
    return "ok"
