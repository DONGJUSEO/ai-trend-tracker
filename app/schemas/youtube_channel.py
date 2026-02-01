"""YouTube 채널 스키마"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class YouTubeChannelBase(BaseModel):
    """YouTube 채널 기본 스키마"""

    channel_id: str = Field(..., description="YouTube 채널 ID")
    channel_name: str = Field(..., description="채널 이름")
    channel_handle: Optional[str] = Field(None, description="채널 핸들")
    description: Optional[str] = Field(None, description="채널 설명")
    category: str = Field(default="AI/ML", description="카테고리")
    subscriber_count: int = Field(default=0, description="구독자 수")
    video_count: int = Field(default=0, description="총 영상 수")
    is_active: bool = Field(default=True, description="수집 활성화")
    priority: int = Field(default=0, description="우선순위")


class YouTubeChannelCreate(YouTubeChannelBase):
    """YouTube 채널 생성 스키마"""

    pass


class YouTubeChannelUpdate(BaseModel):
    """YouTube 채널 업데이트 스키마"""

    channel_name: Optional[str] = None
    channel_handle: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subscriber_count: Optional[int] = None
    video_count: Optional[int] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None


class YouTubeChannel(YouTubeChannelBase):
    """YouTube 채널 응답 스키마"""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_collected_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class YouTubeChannelList(BaseModel):
    """YouTube 채널 목록 응답"""

    total: int
    channels: list[YouTubeChannel]
