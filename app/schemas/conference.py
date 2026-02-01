"""AI Conference 스키마"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class AIConferenceBase(BaseModel):
    """AI Conference 기본 스키마"""

    conference_name: str
    conference_acronym: Optional[str] = None
    year: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    notification_date: Optional[datetime] = None
    location: Optional[str] = None
    venue_type: Optional[str] = None
    website_url: Optional[str] = None
    topics: List[str] = Field(default_factory=list)


class AIConferenceCreate(AIConferenceBase):
    """AI Conference 생성 스키마"""

    pass


class AIConferenceResponse(AIConferenceBase):
    """AI Conference 응답 스키마"""

    id: int
    num_submissions: Optional[int] = None
    num_acceptances: Optional[int] = None
    acceptance_rate: Optional[float] = None
    keynote_speakers: List[str] = Field(default_factory=list)
    organizing_committee: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    highlights: List[str] = Field(default_factory=list)
    tier: Optional[str] = None
    is_trending: bool = False
    is_upcoming: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIConferenceList(BaseModel):
    """AI Conference 목록 응답"""

    total: int
    items: List[AIConferenceResponse]
