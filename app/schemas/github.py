"""GitHub 프로젝트 스키마"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GitHubProjectBase(BaseModel):
    """GitHub 프로젝트 기본 스키마"""

    repo_name: str
    owner: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    homepage: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    watchers: int = 0
    open_issues: int = 0
    topics: List[str] = Field(default_factory=list)
    license: Optional[str] = None
    created_at_github: Optional[datetime] = None
    updated_at_github: Optional[datetime] = None
    pushed_at: Optional[datetime] = None
    category: str = "AI/ML"
    is_trending: bool = False
    is_featured: bool = False


class GitHubProjectCreate(GitHubProjectBase):
    """GitHub 프로젝트 생성 스키마"""

    pass


class GitHubProjectUpdate(BaseModel):
    """GitHub 프로젝트 업데이트 스키마"""

    description: Optional[str] = None
    stars: Optional[int] = None
    forks: Optional[int] = None
    is_trending: Optional[bool] = None
    is_featured: Optional[bool] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    use_cases: Optional[List[str]] = None


class GitHubProject(GitHubProjectBase):
    """GitHub 프로젝트 응답 스키마"""

    id: int
    summary: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    use_cases: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GitHubProjectList(BaseModel):
    """GitHub 프로젝트 목록 응답"""

    total: int
    projects: List[GitHubProject]
