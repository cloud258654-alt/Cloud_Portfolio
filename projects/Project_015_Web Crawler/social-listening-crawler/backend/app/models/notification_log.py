import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    mention_id = Column(Integer, nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    level = Column(String, default="info")
    is_read = Column(String, default="false")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
