"""AI 스타트업 및 투자 데이터 수집 서비스"""
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import feedparser
import re

from app.models.startup import AIStartup


class StartupService:
    """AI 스타트업 서비스"""

    def __init__(self):
        self.rss_feeds = {
            "TechCrunch": "https://techcrunch.com/tag/artificial-intelligence/feed/",
        }

    async def fetch_funding_news(self, max_results: int = 20) -> List[Dict]:
        """RSS 피드에서 AI 스타트업 펀딩 뉴스 수집"""
        startups = []

        try:
            for source_name, feed_url in self.rss_feeds.items():
                try:
                    feed = feedparser.parse(feed_url)

                    for entry in feed.entries[:max_results]:
                        title = entry.get("title", "")
                        description = entry.get("summary", entry.get("description", ""))

                        # 펀딩 관련 키워드 필터링
                        funding_keywords = ["raises", "funding", "investment", "series", "million", "billion",
                                          "investor", "venture", "round", "capital"]

                        title_lower = title.lower()
                        desc_lower = description.lower()

                        is_funding_related = any(keyword in title_lower or keyword in desc_lower
                                                for keyword in funding_keywords)

                        if not is_funding_related:
                            continue

                        # 회사명과 펀딩 정보 추출
                        company_name = self._extract_company_name(title)
                        funding_amount, funding_series = self._extract_funding_info(title + " " + description)

                        if not company_name:
                            continue

                        startups.append({
                            "company_name": company_name,
                            "description": description[:500],
                            "funding_amount": funding_amount,
                            "funding_series": funding_series,
                            "founders": [],
                            "investors": [],
                            "website": entry.get("link", ""),
                            "industry_tags": ["AI", "Startup"],
                            "is_trending": True,
                        })

                        if len(startups) >= max_results:
                            break

                except Exception as e:
                    print(f"  ⚠️ {source_name} RSS 에러: {e}")
                    continue

            print(f"  ✅ {len(startups)}개 AI 스타트업 뉴스 수집")

        except Exception as e:
            print(f"  ❌ Startup RSS 에러: {e}")
            return await self.fetch_sample_startups()

        return startups if startups else await self.fetch_sample_startups()

    def _extract_company_name(self, title: str) -> str:
        """제목에서 회사명 추출"""
        # 패턴: "Company raises $X" or "Company secures $X"
        patterns = [
            r'^([A-Z][A-Za-z0-9\s]+?)\s+(?:raises|secures|gets|lands|bags|scores)',
            r'^([A-Z][A-Za-z0-9\s]+?)\s+(?:closes|announces)',
        ]

        for pattern in patterns:
            match = re.search(pattern, title)
            if match:
                company = match.group(1).strip()
                # 일반적인 단어 제외
                if len(company) > 2 and company.lower() not in ['the', 'and', 'for', 'with']:
                    return company

        return ""

    def _extract_funding_info(self, text: str) -> tuple:
        """텍스트에서 펀딩 금액과 시리즈 추출"""
        funding_amount = None
        funding_series = "Undisclosed"

        # 펀딩 금액 추출 (million, billion)
        amount_patterns = [
            r'\$(\d+(?:\.\d+)?)\s*(?:million|M)',
            r'\$(\d+(?:\.\d+)?)\s*(?:billion|B)',
        ]

        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount = float(match.group(1))
                if 'billion' in pattern.lower() or 'B' in match.group(0):
                    funding_amount = int(amount * 1000000000)
                else:
                    funding_amount = int(amount * 1000000)
                break

        # 시리즈 추출
        series_patterns = [
            r'Series\s+([A-E])',
            r'([A-E])\s+round',
            r'Seed\s+round',
        ]

        for pattern in series_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if 'Seed' in match.group(0):
                    funding_series = "Seed"
                else:
                    funding_series = f"Series {match.group(1).upper()}"
                break

        return funding_amount, funding_series

    async def fetch_sample_startups(self) -> List[Dict]:
        """샘플 데이터 (백업용)"""
        return [{
            "company_name": "Anthropic",
            "description": "AI safety and research company",
            "funding_amount": 450000000,
            "funding_series": "Series C",
            "founders": ["Dario Amodei", "Daniela Amodei"],
            "investors": ["Google", "Spark Capital"],
            "website": "https://www.anthropic.com",
            "industry_tags": ["LLM", "Safety", "Enterprise"],
            "is_trending": True,
        }, {
            "company_name": "Mistral AI",
            "description": "Open-source LLM company",
            "funding_amount": 113000000,
            "funding_series": "Series A",
            "founders": ["Arthur Mensch"],
            "investors": ["Andreessen Horowitz"],
            "website": "https://mistral.ai",
            "industry_tags": ["LLM", "Open Source"],
            "is_trending": True,
        }]

    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        """데이터베이스에 저장"""
        saved = 0
        for item in items:
            url = item.get('website')
            if url:
                result = await db.execute(select(AIStartup).where(AIStartup.website == url))
                if not result.scalar_one_or_none():
                    db.add(AIStartup(**item))
                    saved += 1
        await db.commit()
        return saved
