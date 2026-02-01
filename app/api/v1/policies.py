from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.policy import AIPolicy
from app.schemas.policy import AIPolicyList

router = APIRouter()

@router.get("/", response_model=AIPolicyList)
async def list_policies(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    query = select(AIPolicy)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    offset = (page - 1) * page_size
    result = await db.execute(query.offset(offset).limit(page_size))
    return AIPolicyList(total=total, items=result.scalars().all())
