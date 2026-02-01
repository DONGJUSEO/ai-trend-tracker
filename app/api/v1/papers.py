"""AI Papers API 엔드포인트"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.services.arxiv_service import ArxivService
from app.schemas.paper import AIPaper, AIPaperList

router = APIRouter()


@router.get("/", response_model=AIPaperList)
async def get_papers(
    skip: int = 0,
    limit: int = 20,
    trending_only: bool = False,
    category: Optional[str] = Query(None, description="arXiv 카테고리 (예: cs.AI, cs.LG)"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 논문 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 논문만 조회
    - **category**: 카테고리 필터 (cs.AI, cs.LG, cs.CL, cs.CV 등)
    """
    if limit > 100:
        limit = 100

    service = ArxivService()
    papers = await service.get_papers(
        db=db, skip=skip, limit=limit, trending_only=trending_only, category=category
    )

    return {"total": len(papers), "papers": papers}


@router.get("/{arxiv_id}", response_model=AIPaper)
async def get_paper(
    arxiv_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 AI 논문 조회

    - **arxiv_id**: arXiv ID (예: 2301.12345)
    """
    service = ArxivService()
    paper = await service.get_paper_by_arxiv_id(db=db, arxiv_id=arxiv_id)

    if not paper:
        raise HTTPException(status_code=404, detail="논문을 찾을 수 없습니다")

    return paper


@router.get("/search")
async def search_papers(
    query: str = Query(
        "cat:cs.AI OR cat:cs.LG",
        description="arXiv 검색 쿼리",
    ),
    max_results: int = 10,
):
    """
    arXiv에서 AI 논문 검색 (실시간)

    - **query**: arXiv 검색 쿼리 (기본: AI/ML 카테고리)
    - **max_results**: 최대 결과 수 (최대 50)

    **검색 쿼리 예시:**
    - `cat:cs.AI`: AI 카테고리
    - `cat:cs.LG`: Machine Learning
    - `cat:cs.CL`: NLP
    - `all:transformer`: 제목/초록에 'transformer' 포함
    """
    if max_results > 50:
        max_results = 50

    service = ArxivService()
    papers = await service.search_ai_papers(query=query, max_results=max_results)

    return {"total": len(papers), "papers": papers}
