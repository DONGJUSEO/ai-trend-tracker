"""시스템 상태 API 엔드포인트"""
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
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
from app.models.job_trend import AIJobTrend
from app.models.policy import AIPolicy
from app.services.scheduler import collect_all_data, scheduler, get_scheduler_runtime_status
from app.config import get_settings
from app.cache import cache_get, cache_set, TTL_SYSTEM_STATUS, TTL_KEYWORDS, get_redis
import asyncio

router = APIRouter()
settings = get_settings()


@router.get("/status")
async def get_system_status(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    시스템 전체 상태 조회

    - 백엔드 서버 상태
    - 데이터베이스 연결 상태
    - 각 카테고리별 데이터 개수 및 최신 업데이트 시간
    """
    cache_key = "system:status"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

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

    # Overall system status
    total_items = sum(cat.get("total", 0) for cat in categories_status.values())
    healthy_categories = sum(1 for cat in categories_status.values() if cat.get("status") == "healthy")
    now_iso = datetime.utcnow().isoformat()

    # DB size (가능한 경우)
    db_size = "unknown"
    try:
        db_size_query = await db.execute(
            text("SELECT pg_size_pretty(pg_database_size(current_database()))")
        )
        db_size = db_size_query.scalar() or "unknown"
    except Exception:
        pass

    # Redis connectivity
    redis_running = False
    try:
        redis = await get_redis()
        redis_running = bool(await redis.ping())
    except Exception:
        redis_running = False

    # Scheduler runtime metrics
    runtime = get_scheduler_runtime_status()
    scheduler_jobs = []
    next_run_candidates = []
    completed_today = 0
    failed_today = 0
    today = datetime.utcnow().date()

    for job in scheduler.get_jobs():
        meta = runtime.get(job.id, {})
        next_run = job.next_run_time.isoformat() if job.next_run_time else None
        last_run = meta.get("last_run")
        if next_run:
            next_run_candidates.append(next_run)
        if last_run:
            try:
                parsed_last = datetime.fromisoformat(last_run).date()
                if parsed_last == today:
                    if meta.get("last_status") == "success":
                        completed_today += 1
                    elif meta.get("last_status") == "error":
                        failed_today += 1
            except Exception:
                pass

        scheduler_jobs.append(
            {
                "id": job.id,
                "name": job.name,
                "next_run": next_run,
                "last_run": last_run,
                "last_status": meta.get("last_status"),
                "last_error": meta.get("last_error"),
            }
        )

    last_crawl = None
    if runtime:
        last_runs = [v.get("last_run") for v in runtime.values() if v.get("last_run")]
        if last_runs:
            last_crawl = sorted(last_runs)[-1]

    next_crawl = sorted(next_run_candidates)[0] if next_run_candidates else None

    if db_connected and healthy_categories == len(categories_status):
        status = "healthy"
    elif db_connected:
        status = "degraded"
    else:
        status = "down"

    services = [
        {
            "name": "backend",
            "status": "running",
            "last_check": now_iso,
        },
        {
            "name": "database",
            "status": "running" if db_connected else "error",
            "last_check": now_iso,
        },
        {
            "name": "scheduler",
            "status": "running" if scheduler.running else "stopped",
            "last_check": now_iso,
        },
        {
            "name": "redis-cache",
            "status": "running" if redis_running else "error",
            "last_check": now_iso,
        },
    ]

    response = {
        "status": status,
        "uptime": "unknown",
        "version": settings.app_version,
        "services": services,
        "last_crawl": last_crawl,
        "next_crawl": next_crawl,
        "database": {
            "status": "connected" if db_connected else "disconnected",
            "size": db_size,
            "collections": len(categories_status),
        },
        "crawler": {
            "status": "running" if scheduler.running else "stopped",
            "active_jobs": len(scheduler.get_jobs()) if scheduler.running else 0,
            "completed_today": completed_today,
            "failed_today": failed_today,
        },
        "scheduler_jobs": scheduler_jobs,
        # backward-compat fields
        "backend_status": "online",
        "database_status": "connected" if db_connected else "disconnected",
        "timestamp": now_iso,
        "total_items": total_items,
        "healthy_categories": healthy_categories,
        "total_categories": len(categories_status),
        "categories": categories_status,
    }
    await cache_set(cache_key, response, ttl=TTL_SYSTEM_STATUS)
    return response


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

    cache_key = f"system:keywords:{limit}"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

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

    # Count keywords
    if not all_keywords:
        payload = {
            "total_keywords": 0,
            "unique_keywords": 0,
            "top_keywords": [],
            "all_keywords": []
        }
        await cache_set(cache_key, payload, ttl=TTL_KEYWORDS)
        return payload

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

    payload = {
        "total_keywords": len(all_keywords),
        "unique_keywords": len(keyword_counts),
        "top_keywords": top_keywords,
        "all_keywords": all_keywords_normalized[:limit]
    }
    await cache_set(cache_key, payload, ttl=TTL_KEYWORDS)
    return payload


@router.get("/collection-logs")
async def get_collection_logs() -> Dict[str, Any]:
    """카테고리별 수집 로그 요약 (스케줄러 런타임 상태 기반)."""
    runtime = get_scheduler_runtime_status()
    jobs = []
    success_count = 0
    error_count = 0

    for job in scheduler.get_jobs():
        meta = runtime.get(job.id, {})
        last_status = meta.get("last_status")
        if last_status == "success":
            success_count += 1
        elif last_status == "error":
            error_count += 1

        jobs.append(
            {
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "last_run": meta.get("last_run"),
                "last_status": last_status,
                "last_error": meta.get("last_error"),
            }
        )

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "total_jobs": len(jobs),
        "successful_jobs": success_count,
        "failed_jobs": error_count,
        "jobs": jobs,
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
async def trigger_data_collection(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    수동으로 전체 데이터 수집 트리거 (백그라운드)

    - 모든 카테고리의 데이터를 즉시 수집합니다
    - 이 작업은 1-2분 정도 소요됩니다
    - 백그라운드에서 실행되므로 즉시 응답이 반환됩니다
    """

    # FastAPI BackgroundTasks로 실행
    background_tasks.add_task(collect_all_data)

    return {
        "status": "started",
        "message": "데이터 수집이 시작되었습니다. 1-2분 후 시스템 상태를 확인하세요.",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/collect/sync")
async def trigger_data_collection_sync() -> Dict[str, Any]:
    """
    수동으로 전체 데이터 수집 트리거 (동기 - 완료까지 대기)

    - 모든 카테고리의 데이터를 즉시 수집합니다
    - 완료될 때까지 대기하므로 1-2분 소요됩니다
    - 에러 발생 시 즉시 확인 가능합니다
    """

    try:
        # 동기적으로 실행 (완료까지 대기)
        await collect_all_data()

        return {
            "status": "completed",
            "message": "데이터 수집이 완료되었습니다.",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"데이터 수집 중 오류 발생: {str(e)}",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }
