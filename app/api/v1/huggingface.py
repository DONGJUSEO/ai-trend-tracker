from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.database import get_db
from app.models.huggingface import HuggingFaceModel
from app.schemas.huggingface import (
    HuggingFaceModelResponse,
    HuggingFaceModelList,
    HuggingFaceModelCreate,
)

router = APIRouter()


@router.get("/", response_model=HuggingFaceModelList)
async def get_models(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    task: str = Query(None, description="태스크 필터 (예: text-generation)"),
    author: str = Query(None, description="작성자 필터"),
    trending: bool = Query(None, description="트렌딩 모델만 보기"),
    db: AsyncSession = Depends(get_db),
):
    """
    Hugging Face 모델 목록 조회

    - **page**: 페이지 번호 (기본값: 1)
    - **page_size**: 페이지당 항목 수 (기본값: 20, 최대: 100)
    - **task**: 태스크 필터 (선택사항)
    - **author**: 작성자 필터 (선택사항)
    - **trending**: 트렌딩 모델만 보기 (선택사항)
    """
    # 기본 쿼리
    query = select(HuggingFaceModel)

    # 필터 적용
    if task:
        query = query.where(HuggingFaceModel.task == task)
    if author:
        query = query.where(HuggingFaceModel.author == author)
    if trending is not None:
        query = query.where(HuggingFaceModel.is_trending == trending)

    # 정렬 (최신순)
    query = query.order_by(HuggingFaceModel.collected_at.desc())

    # 전체 개수 조회
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # 페이지네이션 적용
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    # 실행
    result = await db.execute(query)
    models = result.scalars().all()

    return HuggingFaceModelList(
        total=total,
        items=models,
        page=page,
        page_size=page_size,
    )


@router.get("/{model_id}", response_model=HuggingFaceModelResponse)
async def get_model(
    model_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 Hugging Face 모델 상세 조회

    - **model_id**: 모델 ID
    """
    query = select(HuggingFaceModel).where(HuggingFaceModel.id == model_id)
    result = await db.execute(query)
    model = result.scalar_one_or_none()

    if not model:
        raise HTTPException(status_code=404, detail="모델을 찾을 수 없습니다.")

    return model


@router.post("/", response_model=HuggingFaceModelResponse, status_code=201)
async def create_model(
    model_data: HuggingFaceModelCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    새로운 Hugging Face 모델 추가 (테스트용)

    실제로는 스케줄러가 자동으로 수집합니다.
    """
    # 중복 체크
    query = select(HuggingFaceModel).where(
        HuggingFaceModel.model_id == model_data.model_id
    )
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 모델입니다.")

    # 새 모델 생성
    new_model = HuggingFaceModel(**model_data.model_dump())
    db.add(new_model)
    await db.commit()
    await db.refresh(new_model)

    return new_model


@router.get("/tasks/list", response_model=List[str])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    """
    사용 가능한 태스크 목록 조회
    """
    query = select(HuggingFaceModel.task).distinct()
    result = await db.execute(query)
    tasks = [task for task in result.scalars().all() if task]
    return tasks
