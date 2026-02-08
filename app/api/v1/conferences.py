"""AI Conferences API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.db_compat import has_archive_column
from app.models.conference import AIConference
from app.schemas.conference import AIConferenceList, AIConferenceResponse
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()


@router.get("/", response_model=AIConferenceList)
async def list_conferences(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    upcoming: bool = Query(None, description="다가오는 컨퍼런스만 조회"),
    tier: str = Query(None, description="등급 필터 (A*, A, B)"),
    year: int = Query(None, description="연도 필터 (예: 2026)"),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 컨퍼런스 목록 조회

    - **page**: 페이지 번호 (1부터 시작)
    - **page_size**: 페이지당 항목 수 (최대 100)
    - **upcoming**: True시 다가오는 컨퍼런스만 반환
    - **tier**: 등급 필터 (A*, A, B)
    - **year**: 연도 필터 (예: 2026)
    """
    supports_archive = await has_archive_column(db, "ai_conferences")
    effective_include_archived = include_archived or not supports_archive

    query = select(AIConference)
    count_query = select(func.count()).select_from(AIConference)

    if not effective_include_archived:
        query = query.where(AIConference.is_archived == False)
        count_query = count_query.where(AIConference.is_archived == False)

    # 필터 적용
    if upcoming is not None:
        query = query.where(AIConference.is_upcoming == upcoming)
        count_query = count_query.where(AIConference.is_upcoming == upcoming)

    if tier:
        query = query.where(AIConference.tier == tier)
        count_query = count_query.where(AIConference.tier == tier)

    # Phase 2: 연도 필터
    if year is not None:
        query = query.where(AIConference.year == year)
        count_query = count_query.where(AIConference.year == year)

    # 총 개수 조회
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # 페이지네이션
    offset = (page - 1) * page_size
    query = (
        query.order_by(desc(AIConference.submission_deadline))
        .offset(offset)
        .limit(page_size)
    )

    cache_key = (
        "list:conferences:"
        f"page={page}:size={page_size}:upcoming={upcoming}:tier={tier}:year={year}:"
        f"archived={int(effective_include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(query)
    conferences = result.scalars().all()
    payload = AIConferenceList(
        total=total or 0,
        items=conferences,
        page=page,
        page_size=page_size,
        total_pages=max(((total or 0) + page_size - 1) // page_size, 1),
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload


@router.get("/{conference_id}", response_model=AIConferenceResponse)
async def get_conference(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 AI 컨퍼런스 상세 정보 조회

    - **conference_id**: 컨퍼런스 ID
    """
    result = await db.execute(
        select(AIConference).where(AIConference.id == conference_id)
    )
    conference = result.scalar_one_or_none()

    if not conference:
        raise HTTPException(status_code=404, detail="Conference not found")

    return conference
