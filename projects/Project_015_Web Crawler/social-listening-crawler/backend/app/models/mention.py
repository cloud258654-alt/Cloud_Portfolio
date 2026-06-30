import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Mention(Base):
    __tablename__ = "mentions"

    id = Column(Integer, primary_key=True, index=True)
    keyword_id = Column(Integer, ForeignKey("keywords.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String, index=True, nullable=False)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    sentiment = Column(String, default="Neutral")
    sentiment_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low")
    purchase_intent = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)
    ai_suggestion = Column(Text, nullable=True)
    status = Column(String, default="new")            # new, reviewing, replied, resolved, ignored
    raw_data = Column(Text, nullable=True)
    assigned_to = Column(String, nullable=True)        # assigned person
    handled_note = Column(Text, nullable=True)         # handling notes
    handled_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    model_name = Column(String, nullable=True)         # which AI model analyzed
    analyzed_at = Column(DateTime, nullable=True)
    
    # Reputation Risk fields
    risk_score = Column(Integer, default=0)
    risk_reason = Column(String, nullable=True)
    crisis_keywords_matched = Column(String, nullable=True)
    recommended_priority = Column(String, default="P3")
    resolved_at = Column(DateTime, nullable=True)

    # AI Root Cause / v3.0 fields
    root_cause_category = Column(String, nullable=True)
    root_cause_tags = Column(Text, nullable=True)
    brand_health_impact = Column(Integer, default=0)
    suggested_action = Column(Text, nullable=True)

    keyword = relationship("Keyword", back_populates="mentions")
