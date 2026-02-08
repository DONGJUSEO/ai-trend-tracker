from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.db_compat import has_archive_column
from app.models.job_trend import AIJobTrend
from app.schemas.job_trend import AIJobTrendList
from app.cache import cache_get, cache_set, TTL_LIST_QUERY
from app.services.job_trend_service import JobTrendService

router = APIRouter()

@router.get("/", response_model=AIJobTrendList)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    service = JobTrendService()
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
    rows = (await db.execute(query.offset(offset).limit(page_size))).scalars().all()
    serialized_items = []
    for row in rows:
        skills = row.required_skills or []
        serialized_items.append(
            {
                "id": row.id,
                "job_title": row.job_title,
                "company_name": row.company_name or "미공개",
                "location": row.location,
                "is_remote": bool(row.is_remote),
                "description": row.description,
                "salary_min": row.salary_min,
                "salary_max": row.salary_max,
                "required_skills": skills,
                "keywords": row.keywords or [],
                "created_at": row.created_at,
                "role_category": service.classify_role_category(
                    title=row.job_title or "",
                    description=row.description or "",
                    skills=skills,
                ),
            }
        )

    trending_skills = await service.get_trending_skills(db, limit=10)
    payload = AIJobTrendList(
        total=total,
        items=serialized_items,
        trending_skills=trending_skills,
        page=page,
        page_size=page_size,
        total_pages=max((total + page_size - 1) // page_size, 1),
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload
