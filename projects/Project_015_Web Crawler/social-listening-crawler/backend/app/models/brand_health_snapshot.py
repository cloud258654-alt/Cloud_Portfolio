import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.database import Base


class BrandHealthSnapshot(Base):
    __tablename__ = "brand_health_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String, nullable=False, default="文章牛肉湯 安平總店")
    score = Column(Float, default=0.0)
    previous_score = Column(Float, default=0.0)
    score_change = Column(Float, default=0.0)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    top_root_causes = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
