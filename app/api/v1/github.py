"""GitHub API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.db_compat import has_archive_column
from app.services.github_service import GitHubService
from app.schemas.github import GitHubProject, GitHubProjectList
from app.models.github import GitHubProject as GitHubProjectModel
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()


@router.get("/projects", response_model=GitHubProjectList)
async def get_projects(
    skip: Optional[int] = Query(None, ge=0, description="건너뛸 개수 (레거시)"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="조회 개수 (레거시)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    trending_only: bool = False,
    language: Optional[str] = Query(None, description="프로그래밍 언어 (예: Python, JavaScript)"),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    GitHub 프로젝트 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 프로젝트만 조회
    - **language**: 프로그래밍 언어 필터
    """
    # page/page_size 우선, skip/limit은 하위 호환
    if skip is not None or limit is not None:
        effective_skip = skip or 0
        effective_limit = min(limit or 20, 100)
    else:
        effective_limit = min(page_size, 100)
        effective_skip = (page - 1) * effective_limit

    cache_key = (
        "list:github:"
        f"skip={effective_skip}:limit={effective_limit}:trending={int(trending_only)}:"
        f"language={language or ''}:archived={int(include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    supports_archive = await has_archive_column(db, "github_projects")
    effective_include_archived = include_archived or not supports_archive

    count_query = select(func.count()).select_from(GitHubProjectModel)
    if not effective_include_archived:
        count_query = count_query.where(GitHubProjectModel.is_archived == False)
    if trending_only:
        count_query = count_query.where(GitHubProjectModel.is_trending == True)
    if language:
        count_query = count_query.where(GitHubProjectModel.language == language)
    total = (await db.execute(count_query)).scalar() or 0
    total_pages = max((total + effective_limit - 1) // effective_limit, 1)

    service = GitHubService()
    projects = await service.get_projects(
        db=db,
        skip=effective_skip,
        limit=effective_limit,
        trending_only=trending_only,
        language=language,
        include_archived=effective_include_archived,
    )

    current_page = (effective_skip // effective_limit) + 1
    payload = GitHubProjectList(
        total=total,
        projects=projects,
        items=projects,  # 프론트 호환 필드
        page=current_page,
        page_size=effective_limit,
        total_pages=total_pages,
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload


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
