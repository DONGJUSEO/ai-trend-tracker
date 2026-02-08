"""AI 논문 스키마"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AIPaperBase(BaseModel):
    """AI 논문 기본 스키마"""

    arxiv_id: str
    title: str
    authors: List[str] = Field(default_factory=list)
    abstract: Optional[str] = None
    categories: List[str] = Field(default_factory=list)
    published_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    pdf_url: Optional[str] = None
    arxiv_url: Optional[str] = None
    comment: Optional[str] = None
    journal_ref: Optional[str] = None
    topic: Optional[str] = None
    conference_name: Optional[str] = None
    conference_year: Optional[int] = None
    is_featured: bool = False
    is_trending: bool = False


class AIPaperCreate(AIPaperBase):
    """AI 논문 생성 스키마"""

    pass


class AIPaperUpdate(BaseModel):
    """AI 논문 업데이트 스키마"""

    title: Optional[str] = None
    abstract: Optional[str] = None
    topic: Optional[str] = None
    conference_name: Optional[str] = None
    conference_year: Optional[int] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    key_contributions: Optional[List[str]] = None


class AIPaper(AIPaperBase):
    """AI 논문 응답 스키마"""

    id: int
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    key_contributions: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIPaperList(BaseModel):
    """AI 논문 목록 응답"""

    total: int
    papers: List[AIPaper]
    items: List[AIPaper] = Field(default_factory=list)
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
