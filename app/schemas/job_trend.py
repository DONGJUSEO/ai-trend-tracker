from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class TrendingSkill(BaseModel):
    skill: str
    count: int


class AIJobTrendBase(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    location: Optional[str] = None
    is_remote: bool = False

class AIJobTrendResponse(AIJobTrendBase):
    id: int
    description: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    required_skills: List[str] = Field(default_factory=list)
    role_category: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    created_at: datetime
    class Config:
        from_attributes = True

class AIJobTrendList(BaseModel):
    total: int
    items: List[AIJobTrendResponse]
    trending_skills: List[TrendingSkill] = Field(default_factory=list)
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
