"""arXiv API 서비스"""
import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.paper import AIPaper
from app.schemas.paper import AIPaperCreate


class ArxivService:
    """arXiv API 서비스 (API 키 불필요)"""

    BASE_URL = "https://export.arxiv.org/api/query"

    async def search_ai_papers(
        self,
        query: str = "cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV",
        max_results: int = 20,
        sort_by: str = "submittedDate",
        sort_order: str = "descending",
    ) -> List[Dict[str, Any]]:
        """
        arXiv에서 AI 관련 논문 검색

        Args:
            query: 검색 쿼리 (arXiv 쿼리 문법)
            max_results: 최대 결과 수
            sort_by: 정렬 기준 (submittedDate, lastUpdatedDate, relevance)
            sort_order: 정렬 순서 (ascending, descending)

        Returns:
            논문 정보 리스트
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "search_query": query,
                    "start": 0,
                    "max_results": max_results,
                    "sortBy": sort_by,
                    "sortOrder": sort_order,
                }

                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()

                # XML 파싱
                papers = self._parse_arxiv_response(response.text)
                return papers

        except httpx.HTTPStatusError as e:
            print(f"❌ arXiv API 오류: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"❌ arXiv 데이터 수집 실패: {e}")
            return []

    def _parse_arxiv_response(self, xml_text: str) -> List[Dict[str, Any]]:
        """
        arXiv XML 응답 파싱

        Args:
            xml_text: XML 응답 텍스트

        Returns:
            논문 정보 리스트
        """
        papers = []

        try:
            # XML 네임스페이스
            ns = {
                "atom": "http://www.w3.org/2005/Atom",
                "arxiv": "http://arxiv.org/schemas/atom",
            }

            root = ET.fromstring(xml_text)

            for entry in root.findall("atom:entry", ns):
                # 기본 정보
                title = entry.find("atom:title", ns)
                title = title.text.strip().replace("\n", " ") if title is not None else ""

                summary = entry.find("atom:summary", ns)
                summary = (
                    summary.text.strip().replace("\n", " ") if summary is not None else ""
                )

                # arXiv ID 추출
                arxiv_id_elem = entry.find("atom:id", ns)
                arxiv_id = ""
                if arxiv_id_elem is not None:
                    arxiv_id = arxiv_id_elem.text.split("/")[-1]  # URL에서 ID만 추출

                # 저자 리스트
                authors = []
                for author in entry.findall("atom:author", ns):
                    name = author.find("atom:name", ns)
                    if name is not None:
                        authors.append(name.text)

                # 발표일
                published = entry.find("atom:published", ns)
                published_date = None
                if published is not None:
                    try:
                        published_date = datetime.fromisoformat(
                            published.text.replace("Z", "+00:00")
                        )
                    except Exception:
                        pass

                # 업데이트일
                updated = entry.find("atom:updated", ns)
                updated_date = None
                if updated is not None:
                    try:
                        updated_date = datetime.fromisoformat(
                            updated.text.replace("Z", "+00:00")
                        )
                    except Exception:
                        pass

                # 카테고리
                categories = []
                for category in entry.findall("atom:category", ns):
                    term = category.get("term")
                    if term:
                        categories.append(term)

                # PDF 링크
                pdf_url = f"http://arxiv.org/pdf/{arxiv_id}.pdf"
                arxiv_url = f"http://arxiv.org/abs/{arxiv_id}"

                # Comment (논문 페이지 수, 컨퍼런스 등)
                comment_elem = entry.find("arxiv:comment", ns)
                comment = comment_elem.text if comment_elem is not None else None

                # Journal reference
                journal_elem = entry.find("arxiv:journal_ref", ns)
                journal_ref = journal_elem.text if journal_elem is not None else None

                paper_info = {
                    "arxiv_id": arxiv_id,
                    "title": title,
                    "authors": authors,
                    "abstract": summary,
                    "categories": categories,
                    "published_date": published_date,
                    "updated_date": updated_date,
                    "pdf_url": pdf_url,
                    "arxiv_url": arxiv_url,
                    "comment": comment,
                    "journal_ref": journal_ref,
                }

                papers.append(paper_info)

        except Exception as e:
            print(f"❌ XML 파싱 실패: {e}")
            return []

        return papers

    async def search_recent_papers(
        self, days: int = 7, max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """
        최근 N일 내 AI 논문 검색

        Args:
            days: 최근 며칠
            max_results: 최대 결과 수

        Returns:
            논문 정보 리스트
        """
        # AI 관련 주요 카테고리
        # cs.AI: Artificial Intelligence
        # cs.LG: Machine Learning
        # cs.CL: Computation and Language (NLP)
        # cs.CV: Computer Vision
        # cs.NE: Neural and Evolutionary Computing
        query = "cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV OR cat:cs.NE"

        return await self.search_ai_papers(
            query=query,
            max_results=max_results,
            sort_by="submittedDate",
            sort_order="descending",
        )

    async def save_papers_to_db(
        self, papers: List[Dict[str, Any]], db: AsyncSession
    ) -> int:
        """
        논문 정보를 데이터베이스에 저장

        Args:
            papers: 논문 정보 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 논문 수
        """
        saved_count = 0

        for paper_data in papers:
            try:
                # 이미 존재하는지 확인
                result = await db.execute(
                    select(AIPaper).where(AIPaper.arxiv_id == paper_data["arxiv_id"])
                )
                existing_paper = result.scalar_one_or_none()

                if existing_paper:
                    # 업데이트 (업데이트 날짜 등)
                    if paper_data.get("updated_date"):
                        existing_paper.updated_date = paper_data["updated_date"]
                    existing_paper.is_trending = True
                else:
                    # 새로 추가
                    new_paper = AIPaper(
                        arxiv_id=paper_data["arxiv_id"],
                        title=paper_data.get("title", ""),
                        authors=paper_data.get("authors", []),
                        abstract=paper_data.get("abstract"),
                        categories=paper_data.get("categories", []),
                        published_date=paper_data.get("published_date"),
                        updated_date=paper_data.get("updated_date"),
                        pdf_url=paper_data.get("pdf_url"),
                        arxiv_url=paper_data.get("arxiv_url"),
                        comment=paper_data.get("comment"),
                        journal_ref=paper_data.get("journal_ref"),
                        is_trending=True,
                    )
                    db.add(new_paper)
                    saved_count += 1

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(f"❌ 논문 저장 실패 ({paper_data.get('arxiv_id')}): {e}")

        return saved_count

    async def get_papers(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        trending_only: bool = False,
        category: Optional[str] = None,
    ) -> List[AIPaper]:
        """
        데이터베이스에서 논문 목록 가져오기

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 개수
            limit: 가져올 개수
            trending_only: 트렌딩 논문만 가져올지 여부
            category: 카테고리 필터 (cs.AI, cs.LG 등)

        Returns:
            논문 목록
        """
        query = select(AIPaper)

        if trending_only:
            query = query.where(AIPaper.is_trending == True)

        if category:
            # JSON 배열에 카테고리 포함 여부 확인 (PostgreSQL JSON 쿼리)
            query = query.where(AIPaper.categories.contains([category]))

        query = (
            query.order_by(desc(AIPaper.published_date)).offset(skip).limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_paper_by_arxiv_id(
        self, db: AsyncSession, arxiv_id: str
    ) -> Optional[AIPaper]:
        """
        arXiv ID로 논문 가져오기

        Args:
            db: 데이터베이스 세션
            arxiv_id: arXiv ID

        Returns:
            논문 객체 또는 None
        """
        result = await db.execute(
            select(AIPaper).where(AIPaper.arxiv_id == arxiv_id)
        )
        return result.scalar_one_or_none()
