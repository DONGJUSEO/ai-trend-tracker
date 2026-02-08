"""전역 검색 API 엔드포인트"""
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import TTL_LIST_QUERY, cache_get, cache_set
from app.database import get_db

router = APIRouter()


SEARCH_QUERIES = {
    "huggingface": """
        SELECT
            'huggingface' AS category,
            id::text AS item_id,
            model_name AS title,
            COALESCE(summary, description, '') AS snippet,
            url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(model_name,'') || ' ' || COALESCE(description,'') || ' ' || COALESCE(task,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            collected_at AS published_at
        FROM huggingface_models
        WHERE
            to_tsvector('simple', COALESCE(model_name,'') || ' ' || COALESCE(description,'') || ' ' || COALESCE(task,'')) @@ plainto_tsquery('simple', :q)
            OR model_name ILIKE :q_like
            OR description ILIKE :q_like
        ORDER BY score DESC, collected_at DESC NULLS LAST
        LIMIT :per_source
    """,
    "youtube": """
        SELECT
            'youtube' AS category,
            id::text AS item_id,
            title,
            COALESCE(summary, description, '') AS snippet,
            ('https://www.youtube.com/watch?v=' || video_id) AS url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(description,'') || ' ' || COALESCE(channel_title,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            published_at
        FROM youtube_videos
        WHERE
            to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(description,'') || ' ' || COALESCE(channel_title,'')) @@ plainto_tsquery('simple', :q)
            OR title ILIKE :q_like
            OR description ILIKE :q_like
            OR channel_title ILIKE :q_like
        ORDER BY score DESC, published_at DESC NULLS LAST
        LIMIT :per_source
    """,
    "papers": """
        SELECT
            'papers' AS category,
            id::text AS item_id,
            title,
            COALESCE(summary, abstract, '') AS snippet,
            COALESCE(arxiv_url, pdf_url) AS url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(abstract,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            published_date AS published_at
        FROM ai_papers
        WHERE
            to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(abstract,'')) @@ plainto_tsquery('simple', :q)
            OR title ILIKE :q_like
            OR abstract ILIKE :q_like
        ORDER BY score DESC, published_date DESC NULLS LAST
        LIMIT :per_source
    """,
    "news": """
        SELECT
            'news' AS category,
            id::text AS item_id,
            title,
            COALESCE(summary, excerpt, content, '') AS snippet,
            url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(content,'') || ' ' || COALESCE(excerpt,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            published_date AS published_at
        FROM ai_news
        WHERE
            to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(content,'') || ' ' || COALESCE(excerpt,'')) @@ plainto_tsquery('simple', :q)
            OR title ILIKE :q_like
            OR content ILIKE :q_like
            OR excerpt ILIKE :q_like
        ORDER BY score DESC, published_date DESC NULLS LAST
        LIMIT :per_source
    """,
    "github": """
        SELECT
            'github' AS category,
            id::text AS item_id,
            COALESCE(repo_name, name) AS title,
            COALESCE(summary, description, '') AS snippet,
            url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(repo_name,'') || ' ' || COALESCE(name,'') || ' ' || COALESCE(description,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            created_at AS published_at
        FROM github_projects
        WHERE
            to_tsvector('simple', COALESCE(repo_name,'') || ' ' || COALESCE(name,'') || ' ' || COALESCE(description,'')) @@ plainto_tsquery('simple', :q)
            OR repo_name ILIKE :q_like
            OR name ILIKE :q_like
            OR description ILIKE :q_like
        ORDER BY score DESC, created_at DESC NULLS LAST
        LIMIT :per_source
    """,
    "conferences": """
        SELECT
            'conferences' AS category,
            id::text AS item_id,
            conference_name AS title,
            COALESCE(summary, conference_acronym, '') AS snippet,
            website_url AS url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(conference_name,'') || ' ' || COALESCE(conference_acronym,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            start_date AS published_at
        FROM ai_conferences
        WHERE
            to_tsvector('simple', COALESCE(conference_name,'') || ' ' || COALESCE(conference_acronym,'')) @@ plainto_tsquery('simple', :q)
            OR conference_name ILIKE :q_like
            OR conference_acronym ILIKE :q_like
            OR summary ILIKE :q_like
        ORDER BY score DESC, start_date DESC NULLS LAST
        LIMIT :per_source
    """,
    "jobs": """
        SELECT
            'jobs' AS category,
            id::text AS item_id,
            job_title AS title,
            COALESCE(summary, description, '') AS snippet,
            job_url AS url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(job_title,'') || ' ' || COALESCE(description,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            posted_date AS published_at
        FROM ai_job_trends
        WHERE
            to_tsvector('simple', COALESCE(job_title,'') || ' ' || COALESCE(description,'')) @@ plainto_tsquery('simple', :q)
            OR job_title ILIKE :q_like
            OR description ILIKE :q_like
            OR company_name ILIKE :q_like
        ORDER BY score DESC, posted_date DESC NULLS LAST
        LIMIT :per_source
    """,
    "policies": """
        SELECT
            'policies' AS category,
            id::text AS item_id,
            title,
            COALESCE(summary, description, '') AS snippet,
            source_url AS url,
            COALESCE(
              ts_rank(
                to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(description,'')),
                plainto_tsquery('simple', :q)
              ),
              0
            ) AS score,
            effective_date AS published_at
        FROM ai_policies
        WHERE
            to_tsvector('simple', COALESCE(title,'') || ' ' || COALESCE(description,'')) @@ plainto_tsquery('simple', :q)
            OR title ILIKE :q_like
            OR description ILIKE :q_like
            OR country ILIKE :q_like
        ORDER BY score DESC, effective_date DESC NULLS LAST
        LIMIT :per_source
    """,
}


@router.get("")
async def global_search(
    q: str = Query(..., min_length=2, description="검색어"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """카테고리 통합 전역 검색 (FTS + ILIKE fallback)."""
    cache_key = f"search:{q}:{page}:{page_size}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    per_source = min(max(page_size * 4, 20), 120)
    params = {"q": q, "q_like": f"%{q}%", "per_source": per_source}

    rows: List[Dict[str, Any]] = []
    for category, sql in SEARCH_QUERIES.items():
        try:
            result = await db.execute(text(sql), params)
            for row in result.mappings().all():
                rows.append(
                    {
                        "category": row["category"],
                        "id": row["item_id"],
                        "title": row["title"],
                        "snippet": row["snippet"],
                        "url": row["url"],
                        "score": float(row["score"] or 0),
                        "published_at": (
                            row["published_at"].isoformat()
                            if row.get("published_at") is not None
                            else None
                        ),
                    }
                )
        except Exception as e:
            # 스키마 불일치나 특정 테이블 오류가 있어도 전체 검색은 계속 동작
            print(f"⚠️ search query skipped ({category}): {e}")
            continue

    rows.sort(
        key=lambda x: (
            x.get("score", 0),
            x.get("published_at") or "",
        ),
        reverse=True,
    )
    total = len(rows)
    total_pages = max((total + page_size - 1) // page_size, 1)
    start = (page - 1) * page_size
    items = rows[start : start + page_size]

    payload = {
        "q": q,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": items,
    }
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload
