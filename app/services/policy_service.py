"""AI 정책 및 규제 데이터 수집 서비스"""
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import feedparser
from datetime import datetime

from app.models.policy import AIPolicy


class PolicyService:
    """AI 정책 서비스"""

    def __init__(self):
        self.rss_feeds = {
            "AI News": "https://www.artificialintelligence-news.com/feed/",
        }

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
                            "title": title,
                            "policy_type": "News",
                            "country": "Global",
                            "status": "Proposed",
                            "description": description[:500],
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

        return policies if policies else await self.fetch_sample_policies()

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
        """샘플 데이터 (백업용)"""
        return [{
            "title": "EU AI Act",
            "policy_type": "Regulation",
            "country": "European Union",
            "status": "Enacted",
            "description": "Comprehensive AI regulation framework",
            "source_url": "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
            "impact_areas": ["Healthcare", "Finance", "Public Services"],
            "is_trending": True,
        }, {
            "title": "US Executive Order on AI",
            "policy_type": "Executive Order",
            "country": "United States",
            "status": "Active",
            "description": "Safe, Secure, and Trustworthy AI",
            "source_url": "https://www.whitehouse.gov/ai",
            "impact_areas": ["Security", "Privacy", "Innovation"],
            "is_trending": True,
        }]

    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        """데이터베이스에 저장"""
        saved = 0
        for item in items:
            url = item.get('source_url')
            if url:
                result = await db.execute(select(AIPolicy).where(AIPolicy.source_url == url))
                if not result.scalar_one_or_none():
                    db.add(AIPolicy(**item))
                    saved += 1
        await db.commit()
        return saved
