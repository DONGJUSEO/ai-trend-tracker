"""YouTube 채널 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class YouTubeChannel(Base):
    """YouTube 채널 정보 (큐레이션된 AI 유튜버)"""

    __tablename__ = "youtube_channels"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(String, unique=True, index=True, nullable=False, comment="YouTube 채널 ID")
    channel_name = Column(String, nullable=False, comment="채널 이름")
    channel_handle = Column(String, comment="채널 핸들 (@username)")
    description = Column(Text, comment="채널 설명")
    category = Column(String, default="AI/ML", comment="카테고리 (국내/해외)")
    subscriber_count = Column(Integer, default=0, comment="구독자 수")
    video_count = Column(Integer, default=0, comment="총 영상 수")
    is_active = Column(Boolean, default=True, comment="수집 활성화 여부")
    priority = Column(Integer, default=0, comment="우선순위 (높을수록 우선)")

    # 메타 정보
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="생성일시")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="수정일시")
    last_collected_at = Column(DateTime(timezone=True), comment="마지막 수집일시")

    def __repr__(self):
        return f"<YouTubeChannel {self.channel_name} ({self.channel_id})>"
