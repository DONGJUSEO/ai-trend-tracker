"""v4 데이터 품질 보정/요약 백필 서비스."""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_tool import AITool
from app.models.github import GitHubProject
from app.models.huggingface import HuggingFaceModel
from app.models.job_trend import AIJobTrend
from app.models.news import AINews
from app.models.paper import AIPaper
from app.models.policy import AIPolicy
from app.models.youtube import YouTubeVideo
from app.services.ai_summary_service import AISummaryService
from app.services.arxiv_service import ArxivService
from app.services.huggingface_service import HuggingFaceService
from app.services.news_service import NewsService
from app.services.youtube_service import YouTubeService

logger = logging.getLogger(__name__)

_V4_NEWS_CATEGORIES = {"정책", "기업동향", "기술발전", "제품출시", "AI 일반"}


async def backfill_missing_summaries(
    db: AsyncSession,
    limit_per_category: int = 20,
) -> Dict[str, Any]:
    """summary가 비어있는 레코드를 대상으로 한글 요약 백필."""
    ai_service = AISummaryService()
    can_summarize = await ai_service.can_summarize()
    provider = "gemini" if ai_service.model is not None else "ollama"

    if not can_summarize:
        return {
            "provider": "none",
            "updated": {},
            "total_updated": 0,
            "message": "No available summarization provider (Gemini/Ollama).",
        }

    delay_seconds = 2.0 if ai_service.model is not None else 0.0
    updated: Dict[str, int] = {}

    async def maybe_sleep() -> None:
        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

    # HuggingFace
    count = 0
    hf_rows = (
        await db.execute(
            select(HuggingFaceModel)
            .where(or_(HuggingFaceModel.summary.is_(None), HuggingFaceModel.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in hf_rows:
        try:
            payload = await ai_service.summarize_huggingface_model(
                model_name=row.model_name,
                description=row.description,
                task=row.task,
                tags=row.tags or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("key_features"):
                    row.key_features = payload["key_features"]
                if payload.get("use_cases"):
                    row.use_cases = payload["use_cases"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("huggingface summary backfill failed (%s): %s", row.model_id, e)
    updated["huggingface"] = count

    # Papers
    count = 0
    paper_rows = (
        await db.execute(
            select(AIPaper)
            .where(or_(AIPaper.summary.is_(None), AIPaper.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in paper_rows:
        try:
            payload = await ai_service.summarize_paper(
                title=row.title,
                abstract=row.abstract,
                authors=row.authors or [],
                categories=row.categories or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                if payload.get("key_contributions"):
                    row.key_contributions = payload["key_contributions"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("paper summary backfill failed (%s): %s", row.arxiv_id, e)
    updated["papers"] = count

    # News
    count = 0
    news_rows = (
        await db.execute(
            select(AINews)
            .where(or_(AINews.summary.is_(None), AINews.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in news_rows:
        try:
            payload = await ai_service.summarize_news(
                title=row.title,
                content=row.content or row.excerpt,
                source=row.source,
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                if payload.get("key_points"):
                    row.key_points = payload["key_points"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("news summary backfill failed (%s): %s", row.url, e)
    updated["news"] = count

    # GitHub
    count = 0
    github_rows = (
        await db.execute(
            select(GitHubProject)
            .where(or_(GitHubProject.summary.is_(None), GitHubProject.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in github_rows:
        try:
            payload = await ai_service.summarize_github_project(
                repo_name=row.repo_name,
                description=row.description,
                language=row.language,
                topics=row.topics or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                if payload.get("use_cases"):
                    row.use_cases = payload["use_cases"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("github summary backfill failed (%s): %s", row.repo_name, e)
    updated["github"] = count

    # YouTube
    count = 0
    youtube_rows = (
        await db.execute(
            select(YouTubeVideo)
            .where(or_(YouTubeVideo.summary.is_(None), YouTubeVideo.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in youtube_rows:
        try:
            payload = await ai_service.summarize_youtube_video(
                title=row.title,
                description=row.description,
                tags=row.tags or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                if payload.get("key_points"):
                    row.key_points = payload["key_points"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("youtube summary backfill failed (%s): %s", row.video_id, e)
    updated["youtube"] = count

    # Tools
    count = 0
    tool_rows = (
        await db.execute(
            select(AITool)
            .where(or_(AITool.summary.is_(None), AITool.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in tool_rows:
        try:
            payload = await ai_service.summarize_ai_tool(
                name=row.tool_name,
                description=row.description,
                category=row.category,
                use_cases=row.use_cases or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                if payload.get("best_for"):
                    row.best_for = payload["best_for"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("tool summary backfill failed (%s): %s", row.tool_name, e)
    updated["tools"] = count

    # Jobs
    count = 0
    job_rows = (
        await db.execute(
            select(AIJobTrend)
            .where(or_(AIJobTrend.summary.is_(None), AIJobTrend.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in job_rows:
        try:
            payload = await ai_service.summarize_job(
                title=row.job_title,
                company=row.company_name,
                description=row.description,
                skills=row.required_skills or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("job summary backfill failed (%s): %s", row.job_url, e)
    updated["jobs"] = count

    # Policies
    count = 0
    policy_rows = (
        await db.execute(
            select(AIPolicy)
            .where(or_(AIPolicy.summary.is_(None), AIPolicy.summary == ""))
            .limit(limit_per_category)
        )
    ).scalars().all()
    for row in policy_rows:
        try:
            payload = await ai_service.summarize_policy(
                title=row.title,
                description=row.description,
                policy_type=row.policy_type,
                impact_areas=row.impact_areas or [],
            )
            if payload.get("summary"):
                row.summary = payload["summary"]
                if payload.get("keywords"):
                    row.keywords = payload["keywords"]
                count += 1
            await maybe_sleep()
        except Exception as e:
            logger.warning("policy summary backfill failed (%s): %s", row.source_url, e)
    updated["policies"] = count

    await db.commit()
    return {
        "provider": provider,
        "updated": updated,
        "total_updated": sum(updated.values()),
    }


async def backfill_v4_metadata(
    db: AsyncSession,
    limit: int = 5000,
) -> Dict[str, int]:
    """v4 규칙(뉴스/논문/유튜브/HF)을 기존 데이터에 소급 적용."""
    result: Dict[str, int] = {
        "news_category": 0,
        "paper_topic": 0,
        "youtube_channel_language": 0,
        "huggingface_task_ko": 0,
    }

    # 1) News category backfill
    news_rows = (
        await db.execute(select(AINews).order_by(AINews.id.desc()).limit(limit))
    ).scalars().all()
    for row in news_rows:
        if row.category in _V4_NEWS_CATEGORIES:
            continue
        row.category = NewsService.classify_news_topic(
            row.title or "",
            row.content or row.excerpt or "",
        )
        result["news_category"] += 1

    # 2) Paper topic backfill
    paper_rows = (
        await db.execute(
            select(AIPaper)
            .where(or_(AIPaper.topic.is_(None), AIPaper.topic == ""))
            .order_by(AIPaper.id.desc())
            .limit(limit)
        )
    ).scalars().all()
    for row in paper_rows:
        row.topic = ArxivService.classify_topic(row.title or "", row.categories or [])
        result["paper_topic"] += 1

    # 3) HuggingFace task_ko backfill
    hf_service = HuggingFaceService()
    hf_rows = (
        await db.execute(
            select(HuggingFaceModel)
            .where(
                HuggingFaceModel.task.is_not(None),
                or_(HuggingFaceModel.task_ko.is_(None), HuggingFaceModel.task_ko == ""),
            )
            .order_by(HuggingFaceModel.id.desc())
            .limit(limit)
        )
    ).scalars().all()
    for row in hf_rows:
        mapped = hf_service.PIPELINE_TAG_KO.get(row.task or "", row.task)
        if mapped:
            row.task_ko = mapped
            result["huggingface_task_ko"] += 1

    # 4) YouTube channel_language backfill
    yt_service = YouTubeService()
    yt_rows = (
        await db.execute(
            select(YouTubeVideo)
            .where(or_(YouTubeVideo.channel_language.is_(None), YouTubeVideo.channel_language == ""))
            .order_by(YouTubeVideo.id.desc())
            .limit(limit)
        )
    ).scalars().all()
    for row in yt_rows:
        curated = yt_service._get_curated_channel_meta(row.channel_id)
        fallback = curated.get("language") or yt_service._fallback_language_from_video(
            {
                "channel_title": row.channel_title or "",
                "title": row.title or "",
            }
        )
        row.channel_language = yt_service._normalize_channel_language(
            row.channel_language,
            fallback=fallback,
        )
        result["youtube_channel_language"] += 1

    await db.commit()
    return result
