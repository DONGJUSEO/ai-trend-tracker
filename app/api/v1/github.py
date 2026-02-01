"""GitHub API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.services.github_service import GitHubService
from app.schemas.github import GitHubProject, GitHubProjectList

router = APIRouter()


@router.get("/projects", response_model=GitHubProjectList)
async def get_projects(
    skip: int = 0,
    limit: int = 30,
    trending_only: bool = False,
    language: Optional[str] = Query(None, description="프로그래밍 언어 (예: Python, JavaScript)"),
    db: AsyncSession = Depends(get_db),
):
    """
    GitHub 프로젝트 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 프로젝트만 조회
    - **language**: 프로그래밍 언어 필터
    """
    if limit > 100:
        limit = 100

    service = GitHubService()
    projects = await service.get_projects(
        db=db, skip=skip, limit=limit, trending_only=trending_only, language=language
    )

    return {"total": len(projects), "projects": projects}


@router.get("/projects/{repo_name:path}", response_model=GitHubProject)
async def get_project(
    repo_name: str,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 GitHub 프로젝트 조회

    - **repo_name**: 레포지토리 이름 (owner/repo 형식)
    """
    service = GitHubService()
    project = await service.get_project_by_name(db=db, repo_name=repo_name)

    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    return project


@router.get("/search")
async def search_trending(
    language: str = Query("", description="프로그래밍 언어"),
    max_results: int = 20,
):
    """
    GitHub에서 트렌딩 AI/ML 프로젝트 검색 (실시간)

    - **language**: 프로그래밍 언어 필터 (Python, JavaScript 등)
    - **max_results**: 최대 결과 수 (최대 100)
    """
    if max_results > 100:
        max_results = 100

    service = GitHubService()
    projects = await service.fetch_trending_repos(
        language=language, max_results=max_results
    )

    return {"total": len(projects), "projects": projects}
