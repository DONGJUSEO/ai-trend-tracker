"""YouTube 비디오 스키마"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class YouTubeVideoBase(BaseModel):
    """YouTube 비디오 기본 스키마"""

    video_id: str
    title: str
    channel_title: Optional[str] = None
    channel_id: Optional[str] = None
    description: Optional[str] = None
    published_at: Optional[datetime] = None
    thumbnail_url: Optional[str] = None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    duration: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: str = "AI/Tech"
    is_trending: bool = False


class YouTubeVideoCreate(YouTubeVideoBase):
    """YouTube 비디오 생성 스키마"""

    pass


class YouTubeVideoUpdate(BaseModel):
    """YouTube 비디오 업데이트 스키마"""

    title: Optional[str] = None
    description: Optional[str] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    is_trending: Optional[bool] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    key_points: Optional[List[str]] = None


class YouTubeVideo(YouTubeVideoBase):
    """YouTube 비디오 응답 스키마"""

    id: int
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    key_points: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class YouTubeVideoList(BaseModel):
    """YouTube 비디오 목록 응답"""

    total: int
    videos: List[YouTubeVideo]
