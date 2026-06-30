import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    group_name = Column(String, nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    platforms = Column(String, default="PTT,Dcard,Google Search")  # Comma-separated list of enabled platforms
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    mentions = relationship("Mention", back_populates="keyword", cascade="all, delete-orphan")
    crawl_logs = relationship("CrawlLog", back_populates="keyword", cascade="all, delete-orphan")
