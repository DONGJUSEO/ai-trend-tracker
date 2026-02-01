"""시스템 상태 API 엔드포인트"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime
from typing import Dict, Any, List
from collections import Counter
from pathlib import Path

from app.database import get_db
from app.models.huggingface import HuggingFaceModel
from app.models.github import GitHubProject
from app.models.youtube import YouTubeVideo
from app.models.paper import AIPaper
from app.models.news import AINews
from app.models.conference import AIConference
from app.models.ai_tool import AITool
from app.models.leaderboard import AILeaderboard
from app.models.job_trend import AIJobTrend
from app.models.policy import AIPolicy
from app.models.startup import AIStartup
from app.services.scheduler import collect_all_data
import asyncio

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

    # AI Conferences
    try:
        conf_count = await db.execute(select(func.count()).select_from(AIConference))
        conf_total = conf_count.scalar()

        conf_latest = await db.execute(
            select(AIConference.created_at)
            .order_by(AIConference.created_at.desc())
            .limit(1)
        )
        conf_last_update = conf_latest.scalar_one_or_none()

        categories_status["conferences"] = {
            "name": "AI 컨퍼런스",
            "icon": "📅",
            "total": conf_total,
            "last_update": conf_last_update.isoformat() if conf_last_update else None,
            "status": "healthy" if conf_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["conferences"] = {
            "name": "AI 컨퍼런스",
            "icon": "📅",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI Tools
    try:
        tool_count = await db.execute(select(func.count()).select_from(AITool))
        tool_total = tool_count.scalar()

        tool_latest = await db.execute(
            select(AITool.created_at)
            .order_by(AITool.created_at.desc())
            .limit(1)
        )
        tool_last_update = tool_latest.scalar_one_or_none()

        categories_status["tools"] = {
            "name": "AI 도구",
            "icon": "🛠️",
            "total": tool_total,
            "last_update": tool_last_update.isoformat() if tool_last_update else None,
            "status": "healthy" if tool_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["tools"] = {
            "name": "AI 도구",
            "icon": "🛠️",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI Leaderboards
    try:
        lb_count = await db.execute(select(func.count()).select_from(AILeaderboard))
        lb_total = lb_count.scalar()

        lb_latest = await db.execute(
            select(AILeaderboard.created_at)
            .order_by(AILeaderboard.created_at.desc())
            .limit(1)
        )
        lb_last_update = lb_latest.scalar_one_or_none()

        categories_status["leaderboards"] = {
            "name": "AI 리더보드",
            "icon": "🏆",
            "total": lb_total,
            "last_update": lb_last_update.isoformat() if lb_last_update else None,
            "status": "healthy" if lb_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["leaderboards"] = {
            "name": "AI 리더보드",
            "icon": "🏆",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI Jobs
    try:
        job_count = await db.execute(select(func.count()).select_from(AIJobTrend))
        job_total = job_count.scalar()

        job_latest = await db.execute(
            select(AIJobTrend.created_at)
            .order_by(AIJobTrend.created_at.desc())
            .limit(1)
        )
        job_last_update = job_latest.scalar_one_or_none()

        categories_status["jobs"] = {
            "name": "AI 채용",
            "icon": "💼",
            "total": job_total,
            "last_update": job_last_update.isoformat() if job_last_update else None,
            "status": "healthy" if job_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["jobs"] = {
            "name": "AI 채용",
            "icon": "💼",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI Policies
    try:
        policy_count = await db.execute(select(func.count()).select_from(AIPolicy))
        policy_total = policy_count.scalar()

        policy_latest = await db.execute(
            select(AIPolicy.created_at)
            .order_by(AIPolicy.created_at.desc())
            .limit(1)
        )
        policy_last_update = policy_latest.scalar_one_or_none()

        categories_status["policies"] = {
            "name": "AI 정책",
            "icon": "📜",
            "total": policy_total,
            "last_update": policy_last_update.isoformat() if policy_last_update else None,
            "status": "healthy" if policy_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["policies"] = {
            "name": "AI 정책",
            "icon": "📜",
            "total": 0,
            "last_update": None,
            "status": "error",
            "error": str(e)
        }

    # AI Startups
    try:
        startup_count = await db.execute(select(func.count()).select_from(AIStartup))
        startup_total = startup_count.scalar()

        startup_latest = await db.execute(
            select(AIStartup.created_at)
            .order_by(AIStartup.created_at.desc())
            .limit(1)
        )
        startup_last_update = startup_latest.scalar_one_or_none()

        categories_status["startups"] = {
            "name": "AI 스타트업",
            "icon": "🚀",
            "total": startup_total,
            "last_update": startup_last_update.isoformat() if startup_last_update else None,
            "status": "healthy" if startup_total > 0 else "no_data"
        }
    except Exception as e:
        categories_status["startups"] = {
            "name": "AI 스타트업",
            "icon": "🚀",
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

    # AI Conference keywords
    try:
        conf_result = await db.execute(
            select(AIConference.topics).where(
                AIConference.topics.isnot(None)
            ).limit(100)
        )
        for row in conf_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI Tool keywords
    try:
        tool_result = await db.execute(
            select(AITool.key_features).where(
                AITool.key_features.isnot(None)
            ).limit(100)
        )
        for row in tool_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI Leaderboard keywords
    try:
        lb_result = await db.execute(
            select(AILeaderboard.keywords).where(
                AILeaderboard.keywords.isnot(None)
            ).limit(100)
        )
        for row in lb_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI Job keywords
    try:
        job_result = await db.execute(
            select(AIJobTrend.required_skills).where(
                AIJobTrend.required_skills.isnot(None)
            ).limit(100)
        )
        for row in job_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI Policy keywords
    try:
        policy_result = await db.execute(
            select(AIPolicy.impact_areas).where(
                AIPolicy.impact_areas.isnot(None)
            ).limit(100)
        )
        for row in policy_result.scalars():
            if row and isinstance(row, list):
                all_keywords.extend(row)
    except Exception:
        pass

    # AI Startup keywords
    try:
        startup_result = await db.execute(
            select(AIStartup.industry_tags).where(
                AIStartup.industry_tags.isnot(None)
            ).limit(100)
        )
        for row in startup_result.scalars():
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


@router.get("/logs")
async def get_logs(
    log_type: str = Query("app", description="로그 타입: app, error, collection"),
    lines: int = Query(100, ge=1, le=1000, description="읽을 라인 수"),
) -> Dict[str, Any]:
    """
    로그 파일 내용 조회

    - **log_type**: 로그 타입 (app, error, collection)
    - **lines**: 읽을 라인 수 (기본값: 100, 최대: 1000)
    """

    # 로그 파일 경로 매핑
    log_files = {
        "app": Path("logs/app.log"),
        "error": Path("logs/error.log"),
        "collection": Path("logs/collection.log")
    }

    if log_type not in log_files:
        raise HTTPException(status_code=400, detail=f"Invalid log type. Must be one of: {', '.join(log_files.keys())}")

    log_file = log_files[log_type]

    if not log_file.exists():
        return {
            "log_type": log_type,
            "file_path": str(log_file),
            "exists": False,
            "lines": [],
            "total_lines": 0,
            "message": "로그 파일이 아직 생성되지 않았습니다."
        }

    try:
        # 파일의 마지막 N줄 읽기
        with open(log_file, 'r', encoding='utf-8') as f:
            all_lines = f.readlines()

        # 마지막 N줄만 가져오기
        recent_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines

        return {
            "log_type": log_type,
            "file_path": str(log_file),
            "exists": True,
            "lines": [line.rstrip() for line in recent_lines],
            "total_lines": len(all_lines),
            "returned_lines": len(recent_lines),
            "file_size_kb": round(log_file.stat().st_size / 1024, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그 읽기 실패: {str(e)}")


@router.get("/logs/list")
async def list_log_files() -> Dict[str, Any]:
    """
    사용 가능한 로그 파일 목록 조회
    """

    logs_dir = Path("logs")

    if not logs_dir.exists():
        return {
            "logs_directory": str(logs_dir),
            "exists": False,
            "log_files": []
        }

    log_files = []
    for log_file in logs_dir.glob("*.log*"):
        try:
            stat = log_file.stat()
            log_files.append({
                "filename": log_file.name,
                "path": str(log_file),
                "size_kb": round(stat.st_size / 1024, 2),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        except Exception:
            continue

    # 수정 시간 기준으로 정렬 (최신순)
    log_files.sort(key=lambda x: x["modified"], reverse=True)

    return {
        "logs_directory": str(logs_dir.absolute()),
        "exists": True,
        "total_files": len(log_files),
        "log_files": log_files
    }


@router.post("/collect")
async def trigger_data_collection() -> Dict[str, Any]:
    """
    수동으로 전체 데이터 수집 트리거

    - 모든 카테고리의 데이터를 즉시 수집합니다
    - 이 작업은 1-2분 정도 소요됩니다
    - 백그라운드에서 실행되므로 즉시 응답이 반환됩니다
    """

    # 백그라운드 태스크로 실행
    asyncio.create_task(collect_all_data())

    return {
        "status": "started",
        "message": "데이터 수집이 시작되었습니다. 1-2분 후 시스템 상태를 확인하세요.",
        "timestamp": datetime.utcnow().isoformat()
    }
