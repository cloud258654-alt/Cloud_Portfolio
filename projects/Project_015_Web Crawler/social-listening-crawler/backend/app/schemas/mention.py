from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MentionBase(BaseModel):
    keyword_id: int
    platform: str
    title: Optional[str] = None
    content: str
    url: Optional[str] = None
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    sentiment: Optional[str] = "Neutral"
    sentiment_score: Optional[float] = 0.0
    risk_level: Optional[str] = "Low"
    purchase_intent: Optional[bool] = False
    ai_summary: Optional[str] = None
    ai_suggestion: Optional[str] = None
    status: Optional[str] = "Processed"
    raw_data: Optional[str] = None
    
    # Reputation Risk fields
    risk_score: Optional[int] = 0
    risk_reason: Optional[str] = None
    crisis_keywords_matched: Optional[str] = None
    recommended_priority: Optional[str] = "P3"
    assigned_to: Optional[str] = None
    handled_note: Optional[str] = None
    handled_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

class MentionCreate(MentionBase):
    pass

class Mention(MentionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
