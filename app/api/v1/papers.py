"""AI Papers API 엔드포인트"""
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.db_compat import has_archive_column
from app.services.arxiv_service import ArxivService
from app.schemas.paper import AIPaper, AIPaperList
from app.models.paper import AIPaper as AIPaperModel
from app.cache import cache_get, cache_set, TTL_LIST_QUERY

router = APIRouter()
ARXIV_ID_PATTERN = re.compile(
    r"^(?:\d{4}\.\d{4,5}(?:v\d+)?|[a-z\-]+(?:\.[a-z\-]+)?/\d{7}(?:v\d+)?)$",
    re.IGNORECASE,
)


@router.get("/", response_model=AIPaperList)
async def get_papers(
    skip: Optional[int] = Query(None, ge=0, description="건너뛸 개수 (레거시)"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="조회 개수 (레거시)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    trending_only: bool = False,
    category: Optional[str] = Query(None, description="arXiv 카테고리 (예: cs.AI, cs.LG)"),
    include_archived: bool = Query(False, description="아카이브 데이터 포함 여부"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 논문 목록 조회

    - **skip**: 건너뛸 개수
    - **limit**: 가져올 개수 (최대 100)
    - **trending_only**: 트렌딩 논문만 조회
    - **category**: 카테고리 필터 (cs.AI, cs.LG, cs.CL, cs.CV 등)
    """
    # page/page_size 우선, skip/limit은 하위 호환
    if skip is not None or limit is not None:
        effective_skip = skip or 0
        effective_limit = min(limit or 20, 100)
    else:
        effective_limit = min(page_size, 100)
        effective_skip = (page - 1) * effective_limit

    cache_key = (
        "list:papers:"
        f"skip={effective_skip}:limit={effective_limit}:trending={int(trending_only)}:"
        f"category={category or ''}:archived={int(include_archived)}"
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    supports_archive = await has_archive_column(db, "ai_papers")
    effective_include_archived = include_archived or not supports_archive

    count_query = select(func.count()).select_from(AIPaperModel)
    if not effective_include_archived:
        count_query = count_query.where(AIPaperModel.is_archived == False)
    if trending_only:
        count_query = count_query.where(AIPaperModel.is_trending == True)
    if category:
        count_query = count_query.where(AIPaperModel.categories.contains([category]))
    total = (await db.execute(count_query)).scalar() or 0
    total_pages = max((total + effective_limit - 1) // effective_limit, 1)

    service = ArxivService()
    papers = await service.get_papers(
        db=db,
        skip=effective_skip,
        limit=effective_limit,
        trending_only=trending_only,
        category=category,
        include_archived=effective_include_archived,
    )

    current_page = (effective_skip // effective_limit) + 1
    payload = AIPaperList(
        total=total,
        papers=papers,
        items=papers,
        page=current_page,
        page_size=effective_limit,
        total_pages=total_pages,
    ).model_dump(mode="json")
    await cache_set(cache_key, payload, ttl=TTL_LIST_QUERY)
    return payload


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


@router.get("/{arxiv_id}", response_model=AIPaper)
async def get_paper(
    arxiv_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 AI 논문 조회

    - **arxiv_id**: arXiv ID (예: 2301.12345)
    """
    if not ARXIV_ID_PATTERN.fullmatch(arxiv_id):
        raise HTTPException(status_code=400, detail="유효하지 않은 arXiv ID 형식입니다")

    service = ArxivService()
    paper = await service.get_paper_by_arxiv_id(db=db, arxiv_id=arxiv_id)

    if not paper:
        raise HTTPException(status_code=404, detail="논문을 찾을 수 없습니다")

    return paper
