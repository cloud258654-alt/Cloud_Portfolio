from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class CrawlLogBase(BaseModel):
    keyword_id: Optional[int] = None
    platform: str
    status: str
    items_count: Optional[int] = 0
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

class CrawlLogCreate(CrawlLogBase):
    pass

class CrawlLog(CrawlLogBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
