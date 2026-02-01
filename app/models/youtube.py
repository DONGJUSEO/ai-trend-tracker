"""YouTube 비디오 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class YouTubeVideo(Base):
    """YouTube AI 관련 비디오"""

    __tablename__ = "youtube_videos"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    channel_title = Column(String)
    channel_id = Column(String)
    description = Column(Text)
    published_at = Column(DateTime)
    thumbnail_url = Column(String)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    duration = Column(String)  # ISO 8601 duration format (PT4M13S)
    tags = Column(JSON, default=[])

    # AI 요약 정보
    summary = Column(Text)  # AI가 생성한 한글 요약
    keywords = Column(JSON, default=[])  # AI가 추출한 핵심 키워드
    key_points = Column(JSON, default=[])  # AI가 추출한 핵심 포인트

    # 메타데이터
    category = Column(String, default="AI/Tech")
    is_trending = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<YouTubeVideo(video_id={self.video_id}, title={self.title})>"
