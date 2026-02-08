from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class AIPolicyBase(BaseModel):
    title: str
    policy_type: Optional[str] = None
    country: Optional[str] = None

class AIPolicyResponse(AIPolicyBase):
    id: int
    status: Optional[str] = None
    description: Optional[str] = None
    impact_areas: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    created_at: datetime
    class Config:
        from_attributes = True

class AIPolicyList(BaseModel):
    total: int
    items: List[AIPolicyResponse]
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
