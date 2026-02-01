"""YouTube API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.services.youtube_service import YouTubeService
from app.schemas.youtube import YouTubeVideo, YouTubeVideoList

router = APIRouter()


@router.get("/videos", response_model=YouTubeVideoList)
async def get_videos(
    skip: int = 0,
    limit: int = 20,
    trending_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    YouTube 비디오 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 비디오만 조회
    """
    if limit > 100:
        limit = 100

    service = YouTubeService()
    videos = await service.get_videos(
        db=db, skip=skip, limit=limit, trending_only=trending_only
    )

    return {"total": len(videos), "videos": videos}


@router.get("/videos/{video_id}", response_model=YouTubeVideo)
async def get_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 YouTube 비디오 조회

    - **video_id**: YouTube 비디오 ID
    """
    service = YouTubeService()
    video = await service.get_video_by_id(db=db, video_id=video_id)

    if not video:
        raise HTTPException(status_code=404, detail="비디오를 찾을 수 없습니다")

    return video


@router.get("/search")
async def search_videos(query: str = "AI artificial intelligence", max_results: int = 10):
    """
    YouTube에서 AI 관련 비디오 검색 (실시간)

    - **query**: 검색 쿼리
    - **max_results**: 최대 결과 수 (최대 50)
    """
    if max_results > 50:
        max_results = 50

    service = YouTubeService()
    videos = await service.search_ai_videos(query=query, max_results=max_results)

    return {"total": len(videos), "videos": videos}
