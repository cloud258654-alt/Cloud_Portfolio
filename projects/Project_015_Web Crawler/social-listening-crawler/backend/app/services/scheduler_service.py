import logging

logger = logging.getLogger("app.scheduler_service")

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    APSCHEDULER_AVAILABLE = True
except ImportError:
    APSCHEDULER_AVAILABLE = False
    logger.warning("apscheduler not installed. Scheduler features disabled. Install with: pip install apscheduler")


class SchedulerService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._scheduler = None
            cls._instance._running = False
            cls._instance._interval_hours = 6
            cls._instance._mock_mode = True
        return cls._instance

    def start(self, interval_hours: int = 6):
        if not APSCHEDULER_AVAILABLE:
            return {"status": "error", "message": "apscheduler not installed. Run: pip install apscheduler"}
        if self._running:
            return {"status": "already_running", "message": "Scheduler is already running."}
        self._interval_hours = max(1, interval_hours)
        self._scheduler = BackgroundScheduler(daemon=True)
        self._scheduler.add_job(
            self._run_crawl,
            trigger=IntervalTrigger(hours=self._interval_hours),
            id="mock_crawl_job",
            replace_existing=True,
        )
        self._scheduler.start()
        self._running = True
        return {"status": "started", "interval_hours": self._interval_hours, "mock_mode": self._mock_mode}

    def stop(self):
        if not self._running or self._scheduler is None:
            return {"status": "not_running", "message": "Scheduler is not running."}
        self._scheduler.shutdown(wait=False)
        self._scheduler = None
        self._running = False
        return {"status": "stopped", "message": "Scheduler stopped."}

    def run_now(self):
        result = self._run_crawl()
        return {"status": "completed", "message": "Crawl executed once.", "result": result}

    def status(self):
        next_time = None
        if self._running and self._scheduler and APSCHEDULER_AVAILABLE:
            job = self._scheduler.get_job("mock_crawl_job")
            if job and job.next_run_time:
                next_time = job.next_run_time.isoformat()
        return {
            "running": self._running,
            "mock_mode": self._mock_mode,
            "interval_hours": self._interval_hours,
            "next_run_time": next_time,
        }

    def _run_crawl(self):
        from app.database import SessionLocal
        from app.services.crawler_service import CrawlerService

        db = SessionLocal()
        try:
            service = CrawlerService()
            results = service.crawl_all_keywords(db)
            return results
        except Exception as e:
            logger.error(f"Scheduled crawl error: {str(e)}")
            return {"error": str(e)}
        finally:
            db.close()
