from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.startup import AIStartup
from app.schemas.startup import AIStartupList

router = APIRouter()

@router.get("/", response_model=AIStartupList)
async def list_startups(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)):
    query = select(AIStartup)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    offset = (page - 1) * page_size
    result = await db.execute(query.offset(offset).limit(page_size))
    return AIStartupList(total=total, items=result.scalars().all())
