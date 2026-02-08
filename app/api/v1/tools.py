"""AI Tools API 엔드포인트

# TODO (Phase 2): AI Tools -> AI Platforms 리네이밍 예정
# - 이 파일: tools.py -> platforms.py
# - API 경로: /api/v1/tools -> /api/v1/platforms
# - 스키마/모델도 함께 변경 필요 (AITool -> AIPlatform)
# - 기존 /api/v1/tools 경로는 호환성을 위해 당분간 유지
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from datetime import datetime
from typing import List, Set

from app.database import get_db
from app.db_compat import has_archive_column
from app.models.ai_tool import AITool
from app.schemas.ai_tool import AIToolList, AIToolResponse
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()


def _build_data_sources(tools: List[AITool]) -> List[str]:
    sources: Set[str] = set()
    for item in tools:
        if getattr(item, "product_hunt_url", None):
            sources.add("Product Hunt")
        if getattr(item, "github_url", None):
            sources.add("GitHub")
        if getattr(item, "website", None):
            sources.add("공식 웹사이트")
    if not sources:
        sources.add("Gemini Deep Research Seed")
    return sorted(sources)


def _max_updated_at(tools: List[AITool]):
    candidates = [
        item.updated_at or item.created_at
        for item in tools
        if (item.updated_at or item.created_at) is not None
    ]
    if not candidates:
        return None
    return max(candidates)


@router.get("/", response_model=AIToolList)
async def list_tools(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    category: str = Query(None, description="카테고리 필터"),
    trending: bool = Query(None, description="트렌딩 도구만 조회"),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 도구 목록 조회

    - **page**: 페이지 번호 (1부터 시작)
    - **page_size**: 페이지당 항목 수 (최대 100)
    - **category**: 카테고리 필터
    - **trending**: True시 트렌딩 도구만 반환
    """
    supports_archive = await has_archive_column(db, "ai_tools")
    effective_include_archived = include_archived or not supports_archive

    query = select(AITool)
    count_query = select(func.count()).select_from(AITool)

    if not effective_include_archived:
        query = query.where(AITool.is_archived == False)
        count_query = count_query.where(AITool.is_archived == False)

    # 필터 적용
    if category:
        query = query.where(AITool.category == category)
        count_query = count_query.where(AITool.category == category)

    if trending is not None:
        query = query.where(AITool.is_trending == trending)
        count_query = count_query.where(AITool.is_trending == trending)

    # 총 개수 조회
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # 페이지네이션
    offset = (page - 1) * page_size
    query = query.order_by(desc(AITool.upvotes)).offset(offset).limit(page_size)

    cache_key = (
        "list:tools:"
        f"page={page}:size={page_size}:category={category}:trending={trending}:"
        f"archived={int(effective_include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(query)
    tools = result.scalars().all()
    payload = AIToolList(
        total=total or 0,
        items=tools,
        data_sources=_build_data_sources(tools),
        last_updated=_max_updated_at(tools),
        page=page,
        page_size=page_size,
        total_pages=max(((total or 0) + page_size - 1) // page_size, 1),
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload


@router.get("/{tool_id}", response_model=AIToolResponse)
async def get_tool(
    tool_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 AI 도구 상세 정보 조회

    - **tool_id**: AI 도구 ID
    """
    result = await db.execute(select(AITool).where(AITool.id == tool_id))
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(status_code=404, detail="AI tool not found")

    return tool
