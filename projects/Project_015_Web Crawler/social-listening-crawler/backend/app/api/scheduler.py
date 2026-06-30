from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from app.services.scheduler_service import SchedulerService

router = APIRouter()


class StartRequest(BaseModel):
    interval_hours: int = 6


@router.get("/status")
def get_status():
    return SchedulerService().status()


@router.post("/start")
def start_scheduler(req: StartRequest):
    return SchedulerService().start(interval_hours=req.interval_hours)


@router.post("/stop")
def stop_scheduler():
    return SchedulerService().stop()


@router.post("/run-now")
def run_now(background_tasks: BackgroundTasks):
    background_tasks.add_task(SchedulerService().run_now)
    return {"status": "triggered", "message": "Crawl job started in background."}
