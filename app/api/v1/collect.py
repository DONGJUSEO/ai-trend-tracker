"""데이터 수집 API 엔드포인트"""
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.huggingface_service import HuggingFaceService

router = APIRouter()


@router.post("/huggingface/trending")
async def collect_trending_models(
    limit: int = 20,
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Hugging Face 트렌딩 모델 수집

    - **limit**: 수집할 모델 개수 (기본값: 20)
    """
    service = HuggingFaceService()
    result = await service.collect_trending_models(db, limit=limit)
    return result


@router.post("/huggingface/recent")
async def collect_recent_models(
    limit: int = 20,
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Hugging Face 최신 모델 수집

    - **limit**: 수집할 모델 개수 (기본값: 20)
    """
    service = HuggingFaceService()
    result = await service.collect_recent_models(db, limit=limit)
    return result
