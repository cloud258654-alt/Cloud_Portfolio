from fastapi import APIRouter
from app.api.keywords import router as keywords_router
from app.api.mentions import router as mentions_router
from app.api.crawler import router as crawler_router
from app.api.dashboard import router as dashboard_router
from app.api.scheduler import router as scheduler_router
from app.api.exports import router as exports_router
from app.api.reports import router as reports_router
from app.api.settings import router as settings_router
from app.api.notifications import router as notifications_router
from app.api.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(keywords_router, prefix="/keywords", tags=["Keywords"])
api_router.include_router(mentions_router, prefix="/mentions", tags=["Mentions"])
api_router.include_router(crawler_router, prefix="/crawler", tags=["Crawler"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(scheduler_router, prefix="/scheduler", tags=["Scheduler"])
api_router.include_router(exports_router, prefix="/exports", tags=["Exports"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
