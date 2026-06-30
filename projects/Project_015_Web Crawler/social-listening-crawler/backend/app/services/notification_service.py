import datetime
import logging
from sqlalchemy.orm import Session
from app.models.notification_log import NotificationLog
from app.database import SessionLocal

logger = logging.getLogger("notification_service")


class NotificationService:

    @staticmethod
    def create(mention_id: int, title: str, content: str = "", level: str = "warning"):
        db: Session = SessionLocal()
        try:
            log = NotificationLog(
                mention_id=mention_id,
                title=title,
                content=content[:500] if content else "",
                level=level,
                is_read="false",
                created_at=datetime.datetime.utcnow(),
            )
            db.add(log)
            db.commit()
            logger.info(f"Notification created: {title}")
        except Exception as e:
            logger.error(f"Notification error: {e}")
        finally:
            db.close()
