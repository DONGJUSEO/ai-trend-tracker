"""YouTube API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.database import get_db
from app.db_compat import has_archive_column
from app.services.youtube_service import YouTubeService
from app.schemas.youtube import YouTubeVideo, YouTubeVideoList
from app.models.youtube import YouTubeVideo as YouTubeVideoModel
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()


@router.get("/videos", response_model=YouTubeVideoList)
async def get_videos(
    skip: Optional[int] = Query(None, ge=0, description="건너뛸 개수 (레거시)"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="조회 개수 (레거시)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    trending_only: bool = False,
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    YouTube 비디오 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 비디오만 조회
    """
    # page/page_size 우선, skip/limit은 하위 호환
    if skip is not None or limit is not None:
        effective_skip = skip or 0
        effective_limit = min(limit or 20, 100)
    else:
        effective_limit = min(page_size, 100)
        effective_skip = (page - 1) * effective_limit

    cache_key = (
        "list:youtube:"
        f"skip={effective_skip}:limit={effective_limit}:trending={int(trending_only)}:"
        f"archived={int(include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    supports_archive = await has_archive_column(db, "youtube_videos")
    effective_include_archived = include_archived or not supports_archive

    count_query = select(func.count()).select_from(YouTubeVideoModel)
    if not effective_include_archived:
        count_query = count_query.where(YouTubeVideoModel.is_archived == False)
    if trending_only:
        count_query = count_query.where(YouTubeVideoModel.is_trending == True)
    total = (await db.execute(count_query)).scalar() or 0
    total_pages = max((total + effective_limit - 1) // effective_limit, 1)

    service = YouTubeService()
    videos = await service.get_videos(
        db=db,
        skip=effective_skip,
        limit=effective_limit,
        trending_only=trending_only,
        include_archived=effective_include_archived,
    )

    current_page = (effective_skip // effective_limit) + 1
    payload = YouTubeVideoList(
        total=total,
        videos=videos,
        page=current_page,
        page_size=effective_limit,
        total_pages=total_pages,
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload


@router.get("/videos/{video_id}", response_model=YouTubeVideo)
async def get_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 YouTube 비디오 조회

    - **video_id**: YouTube 비디오 ID
    """
    service = YouTubeService()
    video = await service.get_video_by_id(db=db, video_id=video_id)

    if not video:
        raise HTTPException(status_code=404, detail="비디오를 찾을 수 없습니다")

    return video


@router.get("/search")
async def search_videos(query: str = "AI artificial intelligence", max_results: int = 10):
    """
    YouTube에서 AI 관련 비디오 검색 (실시간)

    - **query**: 검색 쿼리
    - **max_results**: 최대 결과 수 (최대 50)
    """
    if max_results > 50:
        max_results = 50

    service = YouTubeService()
    videos = await service.search_ai_videos(query=query, max_results=max_results)

    return {"total": len(videos), "videos": videos}
