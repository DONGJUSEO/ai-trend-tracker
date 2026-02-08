from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.db_compat import has_archive_column
from app.models.policy import AIPolicy
from app.schemas.policy import AIPolicyList
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()

@router.get("/", response_model=AIPolicyList)
async def list_policies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    supports_archive = await has_archive_column(db, "ai_policies")
    effective_include_archived = include_archived or not supports_archive

    query = select(AIPolicy)
    count_query = select(func.count()).select_from(AIPolicy)
    if not effective_include_archived:
        query = query.where(AIPolicy.is_archived == False)
        count_query = count_query.where(AIPolicy.is_archived == False)

    offset = (page - 1) * page_size
    cache_key = (
        f"list:policies:skip={offset}:limit={page_size}:archived={int(effective_include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    total = (await db.execute(count_query)).scalar() or 0
    items = (await db.execute(query.offset(offset).limit(page_size))).scalars().all()
    payload = AIPolicyList(
        total=total,
        items=items,
        page=page,
        page_size=page_size,
        total_pages=max((total + page_size - 1) // page_size, 1),
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload
