"""GitHub 트렌딩 프로젝트 모델"""
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base


class GitHubProject(Base):
    """GitHub 트렌딩 AI 프로젝트"""

    __tablename__ = "github_projects"

    id = Column(Integer, primary_key=True, index=True)
    repo_name = Column(String, unique=True, index=True, nullable=False)  # owner/repo 형식
    owner = Column(String)  # 레포 소유자
    name = Column(String)  # 레포 이름
    description = Column(Text)  # 프로젝트 설명
    url = Column(String)  # GitHub URL
    homepage = Column(String)  # 프로젝트 홈페이지
    language = Column(String)  # 주 프로그래밍 언어
    stars = Column(Integer, default=0)  # 스타 수
    forks = Column(Integer, default=0)  # 포크 수
    watchers = Column(Integer, default=0)  # 워처 수
    open_issues = Column(Integer, default=0)  # 오픈 이슈 수
    topics = Column(JSON, default=[])  # 토픽 태그
    license = Column(String)  # 라이센스
    created_at_github = Column(DateTime)  # GitHub 생성일
    updated_at_github = Column(DateTime)  # GitHub 마지막 업데이트
    pushed_at = Column(DateTime)  # 마지막 푸시

    # AI 요약 정보
    summary = Column(Text)  # AI가 생성한 한글 요약
    keywords = Column(JSON, default=[])  # AI가 추출한 핵심 키워드
    use_cases = Column(JSON, default=[])  # AI가 추출한 사용 사례

    # 메타데이터
    category = Column(String, default="AI/ML")  # 카테고리
    is_trending = Column(Boolean, default=False)  # 트렌딩 여부
    is_featured = Column(Boolean, default=False)  # 주요 프로젝트
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GitHubProject(repo_name={self.repo_name}, stars={self.stars})>"
