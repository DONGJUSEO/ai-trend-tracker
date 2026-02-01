"""AI News API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.services.news_service import NewsService
from app.schemas.news import AINews, AINewsList

router = APIRouter()


@router.get("/news", response_model=AINewsList)
async def get_news(
    skip: int = 0,
    limit: int = 20,
    trending_only: bool = False,
    source: Optional[str] = Query(None, description="뉴스 소스 (예: TechCrunch AI)"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 뉴스 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 뉴스만 조회
    - **source**: 소스 필터
    """
    if limit > 100:
        limit = 100

    service = NewsService()
    news = await service.get_news(
        db=db, skip=skip, limit=limit, trending_only=trending_only, source=source
    )

    return {"total": len(news), "news": news}


@router.get("/news/{news_id}", response_model=AINews)
async def get_news_item(
    news_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 AI 뉴스 조회

    - **news_id**: 뉴스 ID
    """
    service = NewsService()
    news = await service.get_news_by_id(db=db, news_id=news_id)

    if not news:
        raise HTTPException(status_code=404, detail="뉴스를 찾을 수 없습니다")

    return news


@router.get("/sources")
async def get_sources():
    """
    사용 가능한 뉴스 소스 목록

    Returns:
        소스 이름 리스트
    """
    service = NewsService()
    sources = service.get_available_sources()

    return {"total": len(sources), "sources": sources}


@router.get("/fetch")
async def fetch_latest_news():
    """
    최신 뉴스 실시간 수집 (DB 저장 없음)

    Returns:
        수집된 뉴스 리스트
    """
    service = NewsService()
    articles = await service.fetch_all_feeds()

    return {"total": len(articles), "articles": articles}
