"""AI News API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.db_compat import has_archive_column
from app.services.news_service import NewsService
from app.schemas.news import AINews, AINewsList
from app.models.news import AINews as AINewsModel
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()


@router.get("/news", response_model=AINewsList)
async def get_news(
    skip: Optional[int] = Query(None, ge=0, description="건너뛸 개수 (레거시)"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="조회 개수 (레거시)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    trending_only: bool = False,
    source: Optional[str] = Query(None, description="뉴스 소스 (예: TechCrunch AI)"),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 뉴스 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 뉴스만 조회
    - **source**: 소스 필터
    """
    # page/page_size 우선, skip/limit은 하위 호환
    if skip is not None or limit is not None:
        effective_skip = skip or 0
        effective_limit = min(limit or 20, 100)
    else:
        effective_limit = min(page_size, 100)
        effective_skip = (page - 1) * effective_limit

    cache_key = (
        "list:news:"
        f"skip={effective_skip}:limit={effective_limit}:trending={int(trending_only)}:"
        f"source={source or ''}:archived={int(include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    supports_archive = await has_archive_column(db, "ai_news")
    effective_include_archived = include_archived or not supports_archive

    count_query = select(func.count()).select_from(AINewsModel)
    if not effective_include_archived:
        count_query = count_query.where(AINewsModel.is_archived == False)
    if trending_only:
        count_query = count_query.where(AINewsModel.is_trending == True)
    if source:
        count_query = count_query.where(AINewsModel.source == source)
    total = (await db.execute(count_query)).scalar() or 0
    total_pages = max((total + effective_limit - 1) // effective_limit, 1)

    service = NewsService()
    news = await service.get_news(
        db=db,
        skip=effective_skip,
        limit=effective_limit,
        trending_only=trending_only,
        source=source,
        include_archived=effective_include_archived,
    )

    current_page = (effective_skip // effective_limit) + 1
    payload = AINewsList(
        total=total,
        news=news,
        items=news,
        page=current_page,
        page_size=effective_limit,
        total_pages=total_pages,
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload


@router.get("/news/{news_id}", response_model=AINews)
async def get_news_item(
    news_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 AI 뉴스 조회

    - **news_id**: 뉴스 ID
    """
    service = NewsService()
    news = await service.get_news_by_id(db=db, news_id=news_id)

    if not news:
        raise HTTPException(status_code=404, detail="뉴스를 찾을 수 없습니다")

    return news


@router.get("/sources")
async def get_sources():
    """
    사용 가능한 뉴스 소스 목록

    Returns:
        소스 이름 리스트
    """
    service = NewsService()
    sources = service.get_available_sources()

    return {"total": len(sources), "sources": sources}


@router.get("/fetch")
async def fetch_latest_news():
    """
    최신 뉴스 실시간 수집 (DB 저장 없음)

    Returns:
        수집된 뉴스 리스트
    """
    service = NewsService()
    articles = await service.fetch_all_feeds()

    return {"total": len(articles), "articles": articles}
