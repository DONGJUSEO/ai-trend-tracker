"""AI 뉴스/블로그 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class AINews(Base):
    """AI 뉴스 및 블로그 포스트"""

    __tablename__ = "ai_news"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)  # 원본 URL
    title = Column(String, nullable=False)
    author = Column(String)  # 저자
    source = Column(String)  # 출처 (TechCrunch, VentureBeat 등)
    source_url = Column(String)  # 출처 사이트 URL
    published_date = Column(DateTime(timezone=True))  # 발행일
    content = Column(Text)  # 본문 내용
    excerpt = Column(Text)  # 발췌문
    image_url = Column(String)  # 대표 이미지
    tags = Column(JSON, default=[])  # 태그

    # AI 요약 정보
    summary = Column(Text)  # AI가 생성한 한글 요약
    keywords = Column(JSON, default=[])  # AI가 추출한 핵심 키워드
    key_points = Column(JSON, default=[])  # AI가 추출한 핵심 내용

    # 메타데이터
    category = Column(String, default="AI News")  # 카테고리
    is_featured = Column(Boolean, default=False)  # 주요 뉴스
    is_trending = Column(Boolean, default=False)  # 트렌딩 뉴스
    is_archived = Column(Boolean, default=False, index=True)  # 아카이브 여부
    archived_at = Column(DateTime(timezone=True))  # 아카이브 처리 시각
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<AINews(url={self.url}, title={self.title})>"
