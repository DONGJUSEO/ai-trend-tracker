"""AI Conferences API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.models.conference import AIConference
from app.schemas.conference import AIConferenceList, AIConferenceResponse

router = APIRouter()


@router.get("/", response_model=AIConferenceList)
async def list_conferences(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    upcoming: bool = Query(None, description="다가오는 컨퍼런스만 조회"),
    tier: str = Query(None, description="등급 필터 (A*, A, B)"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 컨퍼런스 목록 조회

    - **page**: 페이지 번호 (1부터 시작)
    - **page_size**: 페이지당 항목 수 (최대 100)
    - **upcoming**: True시 다가오는 컨퍼런스만 반환
    - **tier**: 등급 필터 (A*, A, B)
    """
    query = select(AIConference)

    # 필터 적용
    if upcoming is not None:
        query = query.where(AIConference.is_upcoming == upcoming)

    if tier:
        query = query.where(AIConference.tier == tier)

    # 총 개수 조회
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # 페이지네이션
    offset = (page - 1) * page_size
    query = (
        query.order_by(desc(AIConference.submission_deadline))
        .offset(offset)
        .limit(page_size)
    )

    result = await db.execute(query)
    conferences = result.scalars().all()

    return AIConferenceList(total=total, items=conferences)


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
