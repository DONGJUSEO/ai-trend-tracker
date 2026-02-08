"""AI 뉴스/블로그 스키마"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime


class AINewsBase(BaseModel):
    """AI 뉴스 기본 스키마"""

    url: str
    title: str
    author: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    published_date: Optional[datetime] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: str = "AI News"
    is_featured: bool = False
    is_trending: bool = False


class AINewsCreate(AINewsBase):
    """AI 뉴스 생성 스키마"""

    pass


class AINewsUpdate(BaseModel):
    """AI 뉴스 업데이트 스키마"""

    title: Optional[str] = None
    content: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    key_points: Optional[List[str]] = None


class AINews(AINewsBase):
    """AI 뉴스 응답 스키마"""

    id: int
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    key_points: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AINewsList(BaseModel):
    """AI 뉴스 목록 응답"""

    total: int
    news: List[AINews]
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
