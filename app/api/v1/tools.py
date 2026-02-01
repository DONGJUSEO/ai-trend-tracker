"""AI Tools API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.models.ai_tool import AITool
from app.schemas.ai_tool import AIToolList, AIToolResponse

router = APIRouter()


@router.get("/", response_model=AIToolList)
async def list_tools(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    category: str = Query(None, description="카테고리 필터"),
    trending: bool = Query(None, description="트렌딩 도구만 조회"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 도구 목록 조회

    - **page**: 페이지 번호 (1부터 시작)
    - **page_size**: 페이지당 항목 수 (최대 100)
    - **category**: 카테고리 필터
    - **trending**: True시 트렌딩 도구만 반환
    """
    query = select(AITool)

    # 필터 적용
    if category:
        query = query.where(AITool.category == category)

    if trending is not None:
        query = query.where(AITool.is_trending == trending)

    # 총 개수 조회
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # 페이지네이션
    offset = (page - 1) * page_size
    query = query.order_by(desc(AITool.upvotes)).offset(offset).limit(page_size)

    result = await db.execute(query)
    tools = result.scalars().all()

    return AIToolList(total=total, items=tools)


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
