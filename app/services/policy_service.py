"""AI 정책 및 규제 데이터 수집 서비스"""
import re
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import feedparser
from datetime import datetime

from app.models.policy import AIPolicy
from app.services.ai_summary_service import AISummaryService


class PolicyService:
    """AI 정책 서비스"""

    # Curated AI policy data from Gemini deep research (2026-02)
    CURATED_POLICIES = [
        # ── 한국 ──
        {
            "title": "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법 (AI 기본법)",
            "policy_type": "Legislation",
            "country": "South Korea",
            "status": "Enacted",
            "description": "2026년 1월 22일 시행. 고영향 AI(의료·채용·대출 등) 관리 의무화, 생성형 AI 워터마크 표시 의무(제31조), "
                           "인공지능안전연구소 설립, AI 사업자의 이용자 고지 의무. EU AI Act와 유사한 위험 기반 접근이나 "
                           "처벌 수위는 상대적으로 낮음(최대 3천만원 과태료). 법률 제20676호.",
            "source_url": "https://www.law.go.kr/법령/인공지능발전과신뢰기반조성등에관한기본법",
            "impact_areas": ["Healthcare", "Finance", "Hiring", "Public Services"],
            "is_trending": True,
        },
        {
            "title": "2025년 개인정보보호위원회 주요 정책 추진계획",
            "policy_type": "Guideline",
            "country": "South Korea",
            "status": "Active",
            "description": "AI 개발에 원본 데이터 활용을 허용하는 'AI 특례' 마련, 비정형 데이터(텍스트·이미지 등)의 "
                           "가명처리 가이드라인 고도화, 마이데이터 전 분야 확산. 2025년 1월 13일 발표.",
            "source_url": "https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do",
            "impact_areas": ["Privacy", "Data Protection", "AI Development"],
            "is_trending": True,
        },
        {
            "title": "인공지능 투명성 확보 안내 지침",
            "policy_type": "Guideline",
            "country": "South Korea",
            "status": "Active",
            "description": "AI 기본법 시행(2026-01-22)에 맞춘 사업자용 가이드. 워터마크 기술 표준 및 표시 방법 제시. "
                           "과학기술정보통신부 발표.",
            "source_url": "https://www.msit.go.kr",
            "impact_areas": ["Transparency", "Watermarking", "Compliance"],
            "is_trending": True,
        },
        # ── EU ──
        {
            "title": "EU AI Act",
            "policy_type": "Regulation",
            "country": "European Union",
            "status": "Enacted",
            "description": "세계 최초의 포괄적 AI 규제법. 2024년 8월 발효, 2026년 8월 고위험 AI 의무 전면 시행 예정. "
                           "위험 수준별 4단계(금지·고위험·제한·최소) 분류. 위반 시 최대 3,500만 유로 또는 전 세계 매출 7% 과징금.",
            "source_url": "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
            "impact_areas": ["Healthcare", "Finance", "Public Services", "Law Enforcement"],
            "is_trending": True,
        },
        # ── 미국 ──
        {
            "title": "US Executive Order on Safe, Secure, and Trustworthy AI",
            "policy_type": "Executive Order",
            "country": "United States",
            "status": "Active",
            "description": "바이든 행정부의 AI 행정명령(2023-10). 이중 사용 AI 모델의 안전 테스트 보고 의무, "
                           "AI 생성 콘텐츠 워터마크 표준 개발, 연방 정부 AI 사용 가이드라인 수립.",
            "source_url": "https://www.whitehouse.gov/ai",
            "impact_areas": ["Security", "Privacy", "Innovation", "National Security"],
            "is_trending": True,
        },
        # ── 중국 ──
        {
            "title": "생성형 인공지능 서비스 관리 잠행 방법",
            "policy_type": "Regulation",
            "country": "China",
            "status": "Active",
            "description": "2023년 8월 시행. 생성형 AI 서비스 제공 시 사전 등록(알고리즘 비안) 의무, "
                           "사회주의 핵심 가치 준수, 학습 데이터 적법성 보장 요구.",
            "source_url": "http://www.cac.gov.cn",
            "impact_areas": ["Content Moderation", "Data Governance", "Social Stability"],
            "is_trending": True,
        },
    ]

    def __init__(self):
        self.rss_feeds = {
            # Global
            "AI News": "https://www.artificialintelligence-news.com/feed/",
            "OECD AI Observatory": "https://oecd.ai/en/feed",
            "Brookings AI": "https://www.brookings.edu/topic/artificial-intelligence/feed/",
            # Korea
            "과기정통부": "https://www.msit.go.kr/bbs/list.do?sCode=user&mId=113&mPid=238&bbsSeqNo=94&nttSeqNo=&pageIndex=1&searchOpt=ALL&searchTxt=인공지능",
        }

    @staticmethod
    def _strip_html(text: str) -> str:
        """HTML 태그 제거 + 엔티티 디코딩."""
        if not text:
            return ""
        import html
        cleaned = re.sub(r"<[^>]+>", " ", text)
        cleaned = html.unescape(cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @staticmethod
    def _is_korean_policy(country: str) -> bool:
        normalized = (country or "").strip().lower()
        return normalized in {"south korea", "korea", "kr", "한국", "대한민국"}

    async def fetch_policy_news(self, max_results: int = 20) -> List[Dict]:
        """RSS 피드에서 AI 정책 뉴스 수집"""
        policies = []

        try:
            for source_name, feed_url in self.rss_feeds.items():
                try:
                    feed = feedparser.parse(feed_url)

                    for entry in feed.entries[:max_results]:
                        title = entry.get("title", "")
                        description = entry.get("summary", entry.get("description", ""))

                        # AI policy 관련 키워드 필터링
                        policy_keywords = ["regulation", "policy", "law", "act", "bill", "governance",
                                         "compliance", "framework", "legislation", "eu ai act"]

                        title_lower = title.lower()
                        desc_lower = description.lower()

                        is_policy_related = any(keyword in title_lower or keyword in desc_lower
                                               for keyword in policy_keywords)

                        if not is_policy_related:
                            continue

                        # 영향 영역 추출
                        impact_areas = self._extract_impact_areas(description)

                        policies.append({
                            "title": self._strip_html(title),
                            "policy_type": "News",
                            "country": "Global",
                            "status": "Proposed",
                            "description": self._strip_html(description)[:500],
                            "source_url": entry.get("link", ""),
                            "impact_areas": impact_areas,
                            "is_trending": True,
                        })

                        if len(policies) >= max_results:
                            break

                except Exception as e:
                    print(f"  ⚠️ {source_name} RSS 에러: {e}")
                    continue

            print(f"  ✅ {len(policies)}개 AI 정책 뉴스 수집")

        except Exception as e:
            print(f"  ❌ Policy RSS 에러: {e}")
            return await self.fetch_sample_policies()

        # Always include curated policies alongside RSS-fetched ones
        curated = await self.fetch_sample_policies()
        return curated + policies

    def _extract_impact_areas(self, text: str) -> List[str]:
        """텍스트에서 영향 영역 추출"""
        areas = {
            "Healthcare": ["health", "medical", "hospital", "patient"],
            "Finance": ["bank", "finance", "financial", "trading"],
            "Education": ["education", "school", "university", "learning"],
            "Transportation": ["autonomous", "vehicle", "transport", "driving"],
            "Privacy": ["privacy", "data protection", "gdpr", "personal data"],
            "Security": ["security", "defense", "military", "surveillance"],
        }

        text_lower = text.lower()
        found_areas = []

        for area, keywords in areas.items():
            if any(keyword in text_lower for keyword in keywords):
                found_areas.append(area)

        return found_areas[:5] if found_areas else ["General"]

    async def fetch_sample_policies(self) -> List[Dict]:
        """Gemini deep research 기반 큐레이션 정책 데이터 반환"""
        print(f"📦 Loading {len(self.CURATED_POLICIES)} curated AI policies from research data")
        return self.CURATED_POLICIES

    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        """데이터베이스에 저장"""
        saved = 0
        ai_service = AISummaryService()
        for item in items:
            # HTML 태그 제거
            if item.get("description"):
                item["description"] = self._strip_html(item["description"])
            if item.get("title"):
                item["title"] = self._strip_html(item["title"])
            url = item.get('source_url')
            country = item.get("country", "")

            # 해외 정책은 저장 시점에 한국어 요약 생성
            if ai_service.model and (not self._is_korean_policy(country)) and not item.get("summary"):
                summary_data = await ai_service.summarize_policy(
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    policy_type=item.get("policy_type"),
                    impact_areas=item.get("impact_areas", []) or [],
                )
                if summary_data.get("summary"):
                    item["summary"] = summary_data["summary"]
                if summary_data.get("keywords"):
                    item["keywords"] = summary_data["keywords"]

            if url:
                result = await db.execute(select(AIPolicy).where(AIPolicy.source_url == url))
                existing = result.scalar_one_or_none()
                if not existing:
                    db.add(AIPolicy(**item))
                    saved += 1
                else:
                    for key, value in item.items():
                        if hasattr(existing, key) and value is not None:
                            setattr(existing, key, value)

                    if existing.title:
                        existing.title = self._strip_html(existing.title)
                    if existing.description:
                        existing.description = self._strip_html(existing.description)

                    if (
                        ai_service.model
                        and (not self._is_korean_policy(existing.country or ""))
                        and not existing.summary
                    ):
                        summary_data = await ai_service.summarize_policy(
                            title=existing.title,
                            description=existing.description or "",
                            policy_type=existing.policy_type,
                            impact_areas=existing.impact_areas or [],
                        )
                        if summary_data.get("summary"):
                            existing.summary = summary_data["summary"]
                        if summary_data.get("keywords"):
                            existing.keywords = summary_data["keywords"]
        await db.commit()
        return saved
