"""Dashboard API 엔드포인트

Phase 2: 대시보드용 집계/통계 API
- /summary: 전체 카테고리별 데이터 개수 및 통합 통계
- /trending-keywords: 전체 카테고리에서 상위 키워드 집계
- /category-stats: 카테고리별 빠른 통계 (개수, 최근 업데이트, 트렌드 방향)
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from typing import Dict, Any, List
from collections import Counter

from app.database import get_db
from app.models.huggingface import HuggingFaceModel
from app.models.youtube import YouTubeVideo
from app.models.paper import AIPaper
from app.models.news import AINews
from app.models.github import GitHubProject
from app.models.conference import AIConference
from app.models.ai_tool import AITool
from app.models.job_trend import AIJobTrend
from app.models.policy import AIPolicy
from app.cache import cache_get, cache_set, TTL_SYSTEM_STATUS, TTL_KEYWORDS, TTL_LIST_QUERY

router = APIRouter()

# ── 카테고리 메타데이터 ──────────────────────────────────────
CATEGORY_META = {
    "huggingface": {"name": "Hugging Face 모델", "model": HuggingFaceModel, "date_field": "collected_at"},
    "github": {"name": "GitHub 프로젝트", "model": GitHubProject, "date_field": "created_at"},
    "youtube": {"name": "YouTube 영상", "model": YouTubeVideo, "date_field": "created_at"},
    "papers": {"name": "AI 논문", "model": AIPaper, "date_field": "created_at"},
    "news": {"name": "AI 뉴스", "model": AINews, "date_field": "created_at"},
    "conferences": {"name": "AI 컨퍼런스", "model": AIConference, "date_field": "created_at"},
    "tools": {"name": "AI 도구/플랫폼", "model": AITool, "date_field": "created_at"},
    "jobs": {"name": "AI 채용", "model": AIJobTrend, "date_field": "created_at"},
    "policies": {"name": "AI 정책", "model": AIPolicy, "date_field": "created_at"},
}


async def _get_count(db: AsyncSession, model) -> int:
    """모델의 전체 레코드 수 반환."""
    result = await db.execute(select(func.count()).select_from(model))
    return result.scalar() or 0


async def _get_latest_date(db: AsyncSession, model, date_field_name: str):
    """모델의 가장 최근 날짜 반환."""
    date_col = getattr(model, date_field_name)
    result = await db.execute(
        select(date_col).order_by(date_col.desc()).limit(1)
    )
    return result.scalar_one_or_none()


async def _get_recent_count(db: AsyncSession, model, date_field_name: str, days: int = 7) -> int:
    """최근 N일 내 추가된 레코드 수 반환."""
    date_col = getattr(model, date_field_name)
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(func.count()).select_from(model).where(date_col >= cutoff)
    )
    return result.scalar() or 0


@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    대시보드 요약 정보

    - 전체 데이터 개수
    - 카테고리별 개수
    - 최근 7일간 신규 데이터 수
    """
    cache_key = "dashboard:summary"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    categories = {}
    total_items = 0
    total_recent = 0

    for key, meta in CATEGORY_META.items():
        try:
            count = await _get_count(db, meta["model"])
            latest = await _get_latest_date(db, meta["model"], meta["date_field"])
            recent = await _get_recent_count(db, meta["model"], meta["date_field"], days=7)

            categories[key] = {
                "name": meta["name"],
                "total": count,
                "recent_7d": recent,
                "last_update": latest.isoformat() if latest else None,
            }
            total_items += count
            total_recent += recent
        except Exception as e:
            categories[key] = {
                "name": meta["name"],
                "total": 0,
                "recent_7d": 0,
                "last_update": None,
                "error": str(e),
            }

    response = {
        "total_items": total_items,
        "total_recent_7d": total_recent,
        "total_categories": len(CATEGORY_META),
        "timestamp": datetime.utcnow().isoformat(),
        "categories": categories,
    }

    await cache_set(cache_key, response, ttl=TTL_SYSTEM_STATUS)
    return response


@router.get("/trending-keywords")
async def get_trending_keywords(
    limit: int = Query(30, ge=1, le=100, description="반환할 키워드 수"),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    전체 카테고리에서 트렌딩 키워드 집계

    - 각 카테고리의 keywords / key_features / topics 등에서 집계
    - 빈도 순 정렬
    """
    cache_key = f"dashboard:trending_keywords:{limit}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    all_keywords: List[str] = []

    # 각 카테고리별 키워드 수집 (필드명이 모델마다 다름)
    keyword_sources = [
        (HuggingFaceModel, "key_features"),
        (GitHubProject, "keywords"),
        (YouTubeVideo, "keywords"),
        (AIPaper, "keywords"),
        (AINews, "keywords"),
        (AIConference, "topics"),
        (AITool, "key_features"),
        (AIJobTrend, "required_skills"),
        (AIPolicy, "impact_areas"),
    ]

    for model, field_name in keyword_sources:
        try:
            col = getattr(model, field_name)
            result = await db.execute(
                select(col).where(col.isnot(None)).limit(200)
            )
            for row in result.scalars():
                if row and isinstance(row, list):
                    all_keywords.extend(row)
        except Exception:
            continue

    if not all_keywords:
        response = {
            "total_keywords": 0,
            "unique_keywords": 0,
            "top_keywords": [],
        }
        await cache_set(cache_key, response, ttl=TTL_KEYWORDS)
        return response

    keyword_counts = Counter(all_keywords)
    max_count = max(keyword_counts.values()) if keyword_counts else 1

    top_keywords = [
        {
            "keyword": kw,
            "count": cnt,
            "weight": round(cnt / max_count, 3),
        }
        for kw, cnt in keyword_counts.most_common(limit)
    ]

    response = {
        "total_keywords": len(all_keywords),
        "unique_keywords": len(keyword_counts),
        "top_keywords": top_keywords,
    }

    await cache_set(cache_key, response, ttl=TTL_KEYWORDS)
    return response


@router.get("/category-stats")
async def get_category_stats(
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    카테고리별 빠른 통계

    - 각 카테고리 데이터 개수
    - 최근 업데이트 시간
    - 트렌드 방향 (최근 7일 vs 이전 7일 비교)
    """
    cache_key = "dashboard:category_stats"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    stats = []

    for key, meta in CATEGORY_META.items():
        try:
            model = meta["model"]
            date_field_name = meta["date_field"]

            count = await _get_count(db, model)
            latest = await _get_latest_date(db, model, date_field_name)

            # 트렌드 방향 계산: 최근 7일 vs 이전 7일
            recent_7d = await _get_recent_count(db, model, date_field_name, days=7)
            prev_7d_count = await _get_prev_period_count(db, model, date_field_name, days=7)

            if prev_7d_count > 0:
                if recent_7d > prev_7d_count:
                    trend = "up"
                elif recent_7d < prev_7d_count:
                    trend = "down"
                else:
                    trend = "stable"
            else:
                trend = "up" if recent_7d > 0 else "stable"

            stats.append({
                "category": key,
                "name": meta["name"],
                "total": count,
                "recent_7d": recent_7d,
                "prev_7d": prev_7d_count,
                "trend": trend,
                "last_update": latest.isoformat() if latest else None,
            })
        except Exception as e:
            stats.append({
                "category": key,
                "name": meta["name"],
                "total": 0,
                "recent_7d": 0,
                "prev_7d": 0,
                "trend": "stable",
                "last_update": None,
                "error": str(e),
            })

    response = {
        "timestamp": datetime.utcnow().isoformat(),
        "categories": stats,
    }

    await cache_set(cache_key, response, ttl=TTL_LIST_QUERY)
    return response


async def _get_prev_period_count(
    db: AsyncSession, model, date_field_name: str, days: int = 7
) -> int:
    """이전 기간(N일 전 ~ 2N일 전)에 추가된 레코드 수 반환."""
    date_col = getattr(model, date_field_name)
    now = datetime.utcnow()
    period_start = now - timedelta(days=days * 2)
    period_end = now - timedelta(days=days)
    result = await db.execute(
        select(func.count())
        .select_from(model)
        .where(date_col >= period_start, date_col < period_end)
    )
    return result.scalar() or 0
