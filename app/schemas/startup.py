from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class AIStartupBase(BaseModel):
    company_name: str
    description: Optional[str] = None

class AIStartupResponse(AIStartupBase):
    id: int
    funding_amount: Optional[int] = None
    funding_series: Optional[str] = None
    founders: List[str] = Field(default_factory=list)
    investors: List[str] = Field(default_factory=list)
    industry_tags: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    created_at: datetime
    class Config:
        from_attributes = True

class AIStartupList(BaseModel):
    total: int
    items: List[AIStartupResponse]
