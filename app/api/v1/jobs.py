from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.db_compat import has_archive_column
from app.models.job_trend import AIJobTrend
from app.schemas.job_trend import AIJobTrendList
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()

@router.get("/", response_model=AIJobTrendList)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    supports_archive = await has_archive_column(db, "ai_job_trends")
    effective_include_archived = include_archived or not supports_archive

    query = select(AIJobTrend)
    count_query = select(func.count()).select_from(AIJobTrend)
    if not effective_include_archived:
        query = query.where(AIJobTrend.is_archived == False)
        count_query = count_query.where(AIJobTrend.is_archived == False)

    offset = (page - 1) * page_size
    cache_key = (
        f"list:jobs:skip={offset}:limit={page_size}:archived={int(effective_include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    total = (await db.execute(count_query)).scalar() or 0
    offset = (page - 1) * page_size
    items = (await db.execute(query.offset(offset).limit(page_size))).scalars().all()
    payload = AIJobTrendList(
        total=total,
        items=items,
        page=page,
        page_size=page_size,
        total_pages=max((total + page_size - 1) // page_size, 1),
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload
