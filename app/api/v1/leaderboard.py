"""AI Leaderboard API 엔드포인트"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.database import get_db
from app.models.leaderboard import AILeaderboard
from app.schemas.leaderboard import AILeaderboardList, AILeaderboardResponse

router = APIRouter()

@router.get("/", response_model=AILeaderboardList)
async def list_leaderboards(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(AILeaderboard)
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    offset = (page - 1) * page_size
    query = query.order_by(AILeaderboard.rank).offset(offset).limit(page_size)
    result = await db.execute(query)
    return AILeaderboardList(total=total, items=result.scalars().all())
