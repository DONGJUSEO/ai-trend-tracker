"""AI 논문 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class AIPaper(Base):
    """arXiv AI 논문"""

    __tablename__ = "ai_papers"

    id = Column(Integer, primary_key=True, index=True)
    arxiv_id = Column(String, unique=True, index=True, nullable=False)  # arXiv ID (예: 2301.12345)
    title = Column(String, nullable=False)
    authors = Column(JSON, default=[])  # 저자 리스트
    abstract = Column(Text)  # 논문 초록
    categories = Column(JSON, default=[])  # arXiv 카테고리 (cs.AI, cs.LG 등)
    published_date = Column(DateTime)  # 최초 발표일
    updated_date = Column(DateTime)  # 마지막 업데이트일
    pdf_url = Column(String)  # PDF 링크
    arxiv_url = Column(String)  # arXiv 페이지 링크
    comment = Column(Text)  # 논문에 대한 추가 설명 (페이지 수, 컨퍼런스 등)
    journal_ref = Column(String)  # 저널 레퍼런스

    # AI 요약 정보
    summary = Column(Text)  # AI가 생성한 한글 요약
    keywords = Column(JSON, default=[])  # AI가 추출한 핵심 키워드
    key_contributions = Column(JSON, default=[])  # AI가 추출한 주요 기여

    # 메타데이터
    is_featured = Column(Boolean, default=False)  # 주목할 만한 논문
    is_trending = Column(Boolean, default=False)  # 트렌딩 논문
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<AIPaper(arxiv_id={self.arxiv_id}, title={self.title})>"
