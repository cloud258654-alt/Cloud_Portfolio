import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.keyword import Keyword
from app.models.user import User
from app.utils.auth import hash_password
from app.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.main")

Base.metadata.create_all(bind=engine)


def seed_defaults():
    db = SessionLocal()
    try:
        if db.query(Keyword).count() == 0:
            logger.info("Seeding keywords...")
            initial = [
                Keyword(name="台積電", group_name="科技股", is_active=True, platforms="PTT,Dcard,Google Search"),
                Keyword(name="ChatGPT", group_name="AI工具", is_active=True, platforms="PTT,Dcard,Google Search"),
                Keyword(name="人工智慧", group_name="AI主題", is_active=True, platforms="PTT,Dcard,Google Search"),
                Keyword(name="美食推薦", group_name="生活消費", is_active=True, platforms="Google Maps,Facebook Import"),
                Keyword(name="電動車", group_name="產業趨勢", is_active=True, platforms="PTT,Google Search"),
                Keyword(name="iPhone 16", group_name="消費電子", is_active=True, platforms="Dcard,PTT"),
            ]
            db.add_all(initial)
            db.commit()
            logger.info(f"Seeded {len(initial)} keywords.")

        if db.query(User).count() == 0:
            logger.info("Seeding default users...")
            users = [
                User(username="admin", email="admin@demo.local", hashed_password=hash_password("admin123"), role="admin"),
                User(username="manager", email="manager@demo.local", hashed_password=hash_password("manager123"), role="manager"),
                User(username="viewer", email="viewer@demo.local", hashed_password=hash_password("viewer123"), role="viewer"),
            ]
            db.add_all(users)
            db.commit()
            logger.info("Seeded 3 default users (admin/manager/viewer). Demo passwords: admin123 / manager123 / viewer123")
    except Exception as e:
        logger.error(f"Seed error: {e}")
    finally:
        db.close()


seed_defaults()

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {"project": settings.PROJECT_NAME, "status": "online", "docs_url": "/docs", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
