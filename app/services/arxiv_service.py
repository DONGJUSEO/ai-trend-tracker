"""arXiv API 서비스"""
import re
import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.paper import AIPaper
from app.schemas.paper import AIPaperCreate
from app.db_compat import has_archive_column, has_columns
from app.services.ai_summary_service import AISummaryService


class ArxivService:
    """arXiv API 서비스 (API 키 불필요)"""

    BASE_URL = "https://export.arxiv.org/api/query"

    # Conference detection regex from ChatGPT deep research (2026-02)
    CONFERENCE_REGEX = re.compile(
        r"(?:accepted|published|to appear)\s+(?:at|in)\s+"
        r"(NeurIPS|ICML|ICLR|CVPR|ACL|EMNLP|AAAI|IJCAI|NAACL|ECCV|ICCV|KDD|SIGIR|WSDM|INTERSPEECH|COLING)"
        r"\s*(\d{4})?",
        flags=re.IGNORECASE,
    )

    # Topic classification rules (v4.0 — 18 topics)
    TOPIC_RULES = {
        "LLM": {
            "primary_categories": ["cs.CL"],
            "title_keywords": ["large language model", "LLM", "GPT", "BERT", "instruction tuning",
                             "in-context learning", "chain-of-thought", "prompt", "fine-tuning"],
        },
        "NLP": {
            "primary_categories": ["cs.CL"],
            "title_keywords": ["translation", "NLP", "text generation", "sentiment", "named entity",
                             "question answering", "summarization", "dialogue", "tokenization"],
        },
        "CV": {
            "primary_categories": ["cs.CV"],
            "title_keywords": ["image classification", "object detection", "segmentation", "computer vision",
                             "CNN", "YOLO", "pose estimation", "3D reconstruction"],
        },
        "Diffusion/생성": {
            "primary_categories": ["cs.CV"],
            "title_keywords": ["diffusion", "stable diffusion", "image generation", "text-to-image",
                             "GAN", "generative", "DALL-E", "midjourney", "video generation"],
        },
        "멀티모달": {
            "primary_categories": ["cs.CV", "cs.CL"],
            "title_keywords": ["multimodal", "vision-language", "image-text", "audio-visual", "CLIP",
                             "cross-modal", "VLM"],
        },
        "AI 에이전트": {
            "primary_categories": ["cs.AI"],
            "title_keywords": ["agent", "tool use", "planning", "autonomous", "agentic",
                             "multi-agent", "reasoning", "function calling"],
        },
        "RAG": {
            "primary_categories": ["cs.IR", "cs.CL"],
            "title_keywords": ["retrieval-augmented", "RAG", "retrieval", "vector database",
                             "knowledge retrieval", "document qa"],
        },
        "ML": {
            "primary_categories": ["cs.LG"],
            "title_keywords": ["machine learning", "classification", "regression", "clustering",
                             "supervised", "unsupervised", "optimization", "ensemble"],
        },
        "강화학습": {
            "primary_categories": ["cs.RO"],
            "title_keywords": ["reinforcement learning", "policy gradient", "Q-learning", "actor-critic",
                             "deep RL", "DQN", "reward", "RLHF"],
        },
        "로보틱스": {
            "primary_categories": ["cs.RO"],
            "title_keywords": ["robot", "manipulation", "navigation", "control", "locomotion",
                             "sim-to-real", "embodied"],
        },
        "GNN": {
            "primary_categories": ["cs.LG"],
            "title_keywords": ["graph neural", "GNN", "graph transformer", "node classification",
                             "knowledge graph", "link prediction"],
        },
        "음성/오디오": {
            "primary_categories": ["cs.SD", "eess.AS"],
            "title_keywords": ["speech", "text-to-speech", "TTS", "ASR", "voice", "audio",
                             "music generation", "speech recognition"],
        },
        "시계열": {
            "primary_categories": ["cs.LG"],
            "title_keywords": ["time series", "forecasting", "temporal", "anomaly detection",
                             "sequential", "autoregressive"],
        },
        "추천시스템": {
            "primary_categories": ["cs.IR"],
            "title_keywords": ["recommendation", "collaborative filtering", "user preference",
                             "click-through", "ranking"],
        },
        "AI 안전/정렬": {
            "primary_categories": ["cs.AI"],
            "title_keywords": ["alignment", "safety", "red teaming", "jailbreak", "guardrail",
                             "bias", "fairness", "toxicity", "hallucination"],
        },
        "효율화": {
            "primary_categories": ["cs.LG"],
            "title_keywords": ["quantization", "pruning", "distillation", "efficient", "compression",
                             "ONNX", "TensorRT", "edge AI", "on-device"],
        },
        "의료AI": {
            "primary_categories": ["cs.AI"],
            "title_keywords": ["medical", "clinical", "healthcare", "radiology", "pathology",
                             "drug discovery", "biomedical", "EHR"],
        },
        "자율주행": {
            "primary_categories": ["cs.RO", "cs.CV"],
            "title_keywords": ["autonomous driving", "self-driving", "LiDAR", "point cloud",
                             "trajectory prediction", "vehicle"],
        },
    }

    # Pipeline tag Korean mapping from ChatGPT deep research (2026-02)
    PIPELINE_TAG_KO = {
        "text-generation": "텍스트 생성",
        "text-to-image": "이미지 생성",
        "text-classification": "텍스트 분류",
        "fill-mask": "단어 채우기",
        "translation": "번역",
        "speech-to-text": "음성 텍스트 변환",
        "text-to-speech": "텍스트 음성 변환",
        "image-classification": "이미지 분류",
        "object-detection": "객체 탐지",
        "image-segmentation": "이미지 분할",
        "question-answering": "질의 응답",
        "summarization": "요약",
        "audio-classification": "오디오 분류",
        "text-to-video": "텍스트-투-비디오",
    }

    @staticmethod
    async def _has_paper_extra_columns(db: AsyncSession) -> bool:
        """구버전 DB 호환: ai_papers 확장 컬럼 존재 여부 확인."""
        found = await has_columns(
            db,
            "ai_papers",
            ["topic", "conference_name", "conference_year"],
        )
        found = {column for column, exists in found.items() if exists}
        return {"topic", "conference_name", "conference_year"}.issubset(found)

    @classmethod
    def extract_conference(cls, comment: str) -> Optional[Dict[str, str]]:
        """arXiv comment에서 학회 정보 추출"""
        if not comment:
            return None
        match = cls.CONFERENCE_REGEX.search(comment)
        if match:
            return {"conference_name": match.group(1), "year": match.group(2) or None}
        return None

    # Topics to check by keyword first (before category-based fallback)
    _KEYWORD_PRIORITY_TOPICS = [
        "멀티모달", "LLM", "AI 에이전트", "RAG", "Diffusion/생성",
        "AI 안전/정렬", "효율화", "의료AI", "자율주행",
    ]

    @classmethod
    def classify_topic(cls, title: str, categories: List[str]) -> str:
        """논문 제목과 카테고리로 주제 분류 (18 topics)"""
        title_lower = title.lower()

        # 1. 키워드 우선 토픽 (특화된 토픽을 먼저 매칭)
        for topic in cls._KEYWORD_PRIORITY_TOPICS:
            rules = cls.TOPIC_RULES.get(topic, {})
            if any(kw in title_lower for kw in rules.get("title_keywords", [])):
                return topic

        # 2. 카테고리 기반 분류
        for topic, rules in cls.TOPIC_RULES.items():
            if topic in cls._KEYWORD_PRIORITY_TOPICS:
                continue
            for cat in categories:
                if cat in rules["primary_categories"]:
                    return topic

        # 3. 키워드 기반 분류 (카테고리 매칭 실패 시)
        for topic, rules in cls.TOPIC_RULES.items():
            if any(kw in title_lower for kw in rules.get("title_keywords", [])):
                return topic

        return "ML"  # default

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

                # 주제 분류 + 학회 정보 추출
                topic = self.classify_topic(title=title, categories=categories)
                conf_info = self.extract_conference(comment=comment or "")
                conference_name = conf_info["conference_name"] if conf_info else None
                conference_year = None
                if conf_info and conf_info.get("year"):
                    try:
                        conference_year = int(conf_info["year"])
                    except ValueError:
                        conference_year = None

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
                    "topic": topic,
                    "conference_name": conference_name,
                    "conference_year": conference_year,
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
        ai_service = AISummaryService()
        column_flags = await has_columns(
            db,
            "ai_papers",
            [
                "topic",
                "conference_name",
                "conference_year",
                "is_archived",
                "archived_at",
            ],
        )
        has_extra_columns = (
            column_flags["topic"]
            and column_flags["conference_name"]
            and column_flags["conference_year"]
        )
        has_archive_columns = (
            column_flags["is_archived"] and column_flags["archived_at"]
        )

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
                    if has_extra_columns:
                        if hasattr(existing_paper, "topic"):
                            existing_paper.topic = paper_data.get("topic")
                        if hasattr(existing_paper, "conference_name"):
                                existing_paper.conference_name = paper_data.get("conference_name")
                        if hasattr(existing_paper, "conference_year"):
                            existing_paper.conference_year = paper_data.get("conference_year")
                    # 기존 논문에 한글 요약이 없으면 생성
                    if ai_service.model and not getattr(existing_paper, "summary", None):
                        summary_data = await ai_service.summarize_paper(
                            title=existing_paper.title,
                            abstract=existing_paper.abstract,
                            authors=existing_paper.authors or [],
                            categories=existing_paper.categories or [],
                        )
                        if summary_data.get("summary"):
                            existing_paper.summary = summary_data["summary"]
                        if summary_data.get("keywords"):
                            existing_paper.keywords = summary_data["keywords"]
                    existing_paper.is_trending = True
                    if has_archive_columns:
                        existing_paper.is_archived = False
                        existing_paper.archived_at = None
                else:
                    # Gemini 한글 요약 생성
                    summary_data = None
                    if ai_service.model:
                        summary_data = await ai_service.summarize_paper(
                            title=paper_data.get("title", ""),
                            abstract=paper_data.get("abstract"),
                            authors=paper_data.get("authors", []),
                            categories=paper_data.get("categories", []),
                        )

                    # 새로 추가
                    paper_payload = {
                        "arxiv_id": paper_data["arxiv_id"],
                        "title": paper_data.get("title", ""),
                        "authors": paper_data.get("authors", []),
                        "abstract": paper_data.get("abstract"),
                        "categories": paper_data.get("categories", []),
                        "published_date": paper_data.get("published_date"),
                        "updated_date": paper_data.get("updated_date"),
                        "pdf_url": paper_data.get("pdf_url"),
                        "arxiv_url": paper_data.get("arxiv_url"),
                        "comment": paper_data.get("comment"),
                        "journal_ref": paper_data.get("journal_ref"),
                        "summary": (summary_data or {}).get("summary"),
                        "keywords": (summary_data or {}).get("keywords", []),
                        "is_trending": True,
                    }
                    if has_archive_columns:
                        paper_payload.update(
                            {
                                "is_archived": False,
                                "archived_at": None,
                            }
                        )
                    if has_extra_columns:
                        paper_payload.update(
                            {
                                "topic": paper_data.get("topic"),
                                "conference_name": paper_data.get("conference_name"),
                                "conference_year": paper_data.get("conference_year"),
                            }
                        )
                    new_paper = AIPaper(**paper_payload)
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
        include_archived: bool = False,
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

        supports_archive = await has_archive_column(db, "ai_papers")
        if not include_archived and supports_archive:
            query = query.where(AIPaper.is_archived == False)

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
