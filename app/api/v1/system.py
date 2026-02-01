"""시스템 상태 API 엔드포인트"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime
from typing import Dict, Any, List
from collections import Counter

from app.database import get_db
from app.models.huggingface import HuggingFaceModel
from app.models.github import GitHubProject
from app.models.youtube import YouTubeVideo
from app.models.paper import AIPaper
from app.models.news import AINews

router = APIRouter()


@router.get("/status")
async def get_system_status(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    시스템 전체 상태 조회

    - 백엔드 서버 상태
    - 데이터베이스 연결 상태
    - 각 카테고리별 데이터 개수 및 최신 업데이트 시간
    """

    # Database connectivity test
    db_connected = False
    try:
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    # Get counts and latest updates for each category
    categories_status = {}

    # Hugging Face Models
    try:
        hf_count = await db.execute(select(func.count()).select_from(HuggingFaceModel))
        hf_total = hf_count.scalar()

        hf_latest = await db.execute(
            select(HuggingFaceModel.collected_at)
            .order_by(HuggingFaceModel.collected_at.desc())
            .limit(1)
        )
        hf_last_update = hf_latest.scalar_one_or_none()

        categories_status["huggingface"] = {
            "name": "Hugging Face 모델",
            "icon": "🤗",
            "total": hf_total,
            "last_update": hf_last_update.isoformat() if hf_last_update else None,
            "status": "healthy" if hf_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["huggingface"] = {
            "name": "Hugging Face 모델",
            "icon": "🤗",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # GitHub Projects
    try:
        gh_count = await db.execute(select(func.count()).select_from(GitHubProject))
        gh_total = gh_count.scalar()

        gh_latest = await db.execute(
            select(GitHubProject.created_at)
            .order_by(GitHubProject.created_at.desc())
            .limit(1)
        )
        gh_last_update = gh_latest.scalar_one_or_none()

        categories_status["github"] = {
            "name": "GitHub 프로젝트",
            "icon": "⭐",
            "total": gh_total,
            "last_update": gh_last_update.isoformat() if gh_last_update else None,
            "status": "healthy" if gh_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["github"] = {
            "name": "GitHub 프로젝트",
            "icon": "⭐",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # YouTube Videos
    try:
        yt_count = await db.execute(select(func.count()).select_from(YouTubeVideo))
        yt_total = yt_count.scalar()

        yt_latest = await db.execute(
            select(YouTubeVideo.created_at)
            .order_by(YouTubeVideo.created_at.desc())
            .limit(1)
        )
        yt_last_update = yt_latest.scalar_one_or_none()

        categories_status["youtube"] = {
            "name": "YouTube 영상",
            "icon": "📺",
            "total": yt_total,
            "last_update": yt_last_update.isoformat() if yt_last_update else None,
            "status": "healthy" if yt_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["youtube"] = {
            "name": "YouTube 영상",
            "icon": "📺",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI Papers
    try:
        paper_count = await db.execute(select(func.count()).select_from(AIPaper))
        paper_total = paper_count.scalar()

        paper_latest = await db.execute(
            select(AIPaper.created_at)
            .order_by(AIPaper.created_at.desc())
            .limit(1)
        )
        paper_last_update = paper_latest.scalar_one_or_none()

        categories_status["papers"] = {
            "name": "AI 논문",
            "icon": "📄",
            "total": paper_total,
            "last_update": paper_last_update.isoformat() if paper_last_update else None,
            "status": "healthy" if paper_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["papers"] = {
            "name": "AI 논문",
            "icon": "📄",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI News
    try:
        news_count = await db.execute(select(func.count()).select_from(AINews))
        news_total = news_count.scalar()

        news_latest = await db.execute(
            select(AINews.created_at)
            .order_by(AINews.created_at.desc())
            .limit(1)
        )
        news_last_update = news_latest.scalar_one_or_none()

        categories_status["news"] = {
            "name": "AI 뉴스",
            "icon": "📰",
            "total": news_total,
            "last_update": news_last_update.isoformat() if news_last_update else None,
            "status": "healthy" if news_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["news"] = {
            "name": "AI 뉴스",
            "icon": "📰",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # Overall system status
    total_items = sum(cat.get("total", 0) for cat in categories_status.values())
    healthy_categories = sum(1 for cat in categories_status.values() if cat.get("status") == "healthy")

    return {
        "backend_status": "online",
        "database_status": "connected" if db_connected else "disconnected",
        "timestamp": datetime.utcnow().isoformat(),
        "total_items": total_items,
        "healthy_categories": healthy_categories,
        "total_categories": len(categories_status),
        "categories": categories_status
    }


@router.get("/keywords")
async def get_keywords(
    db: AsyncSession = Depends(get_db),
    limit: int = 50
) -> Dict[str, Any]:
    """
    전체 카테고리에서 키워드 집계

    - 모든 카테고리의 keywords 필드를 합산
    - 빈도수 기준으로 정렬
    - 워드 클라우드 및 키워드 순위용 데이터 제공
    """

    all_keywords = []

    # Hugging Face keywords
    try:
        hf_result = await db.execute(
            select(HuggingFaceModel.key_features).where(
                HuggingFaceModel.key_features.isnot(None)
            ).limit(100)
        )
        for row in hf_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # GitHub keywords
    try:
        gh_result = await db.execute(
            select(GitHubProject.keywords).where(
                GitHubProject.keywords.isnot(None)
            ).limit(100)
        )
        for row in gh_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # YouTube keywords
    try:
        yt_result = await db.execute(
            select(YouTubeVideo.keywords).where(
                YouTubeVideo.keywords.isnot(None)
            ).limit(100)
        )
        for row in yt_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI Papers keywords
    try:
        paper_result = await db.execute(
            select(AIPaper.keywords).where(
                AIPaper.keywords.isnot(None)
            ).limit(100)
        )
        for row in paper_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI News keywords
    try:
        news_result = await db.execute(
            select(AINews.keywords).where(
                AINews.keywords.isnot(None)
            ).limit(100)
        )
        for row in news_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # Count keywords
    if not all_keywords:
        return {
            "total_keywords": 0,
            "unique_keywords": 0,
            "top_keywords": [],
            "all_keywords": []
        }

    keyword_counts = Counter(all_keywords)

    # Top keywords with counts
    top_keywords = [
        {"keyword": keyword, "count": count}
        for keyword, count in keyword_counts.most_common(limit)
    ]

    # All keywords for word cloud (with normalized counts)
    max_count = max(keyword_counts.values()) if keyword_counts else 1
    all_keywords_normalized = [
        {
            "keyword": keyword,
            "count": count,
            "weight": count / max_count
        }
        for keyword, count in keyword_counts.items()
    ]

    return {
        "total_keywords": len(all_keywords),
        "unique_keywords": len(keyword_counts),
        "top_keywords": top_keywords,
        "all_keywords": all_keywords_normalized[:limit]
    }
