from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class KeywordBase(BaseModel):
    name: str
    group_name: Optional[str] = None
    is_active: Optional[bool] = True
    platforms: Optional[str] = "PTT,Dcard,Google Search"

class KeywordCreate(KeywordBase):
    pass

class KeywordUpdate(BaseModel):
    name: Optional[str] = None
    group_name: Optional[str] = None
    is_active: Optional[bool] = None
    platforms: Optional[str] = None

class Keyword(KeywordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
