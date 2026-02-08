"""AI 뉴스/블로그 RSS 피드 서비스"""
import httpx
import feedparser
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from difflib import SequenceMatcher
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.news import AINews
from app.schemas.news import AINewsCreate
from app.db_compat import has_archive_column, has_columns


class NewsService:
    """AI 뉴스 RSS 피드 서비스"""

    # AI 관련 주요 RSS 피드 소스
    # Phase 2: 한국 뉴스 소스 우선 배치
    # Updated based on Gemini deep research (2026-02): ZDNet Korea RSS deprecated, added confirmed active feeds
    # RSS feeds validated by ChatGPT deep research (2026-02)
    RSS_FEEDS = {
        # ── 한국 AI 뉴스 소스 (우선) ──────────────────────
        "전자신문": "https://rss.etnews.com/Section901.xml",
        "전자신문 AI": "http://rss.etnews.com/04046.xml",  # AI-specific (~80% AI)
        "AI타임스": "https://www.aitimes.com/rss/allArticle.xml",
        "블로터": "https://www.bloter.net/feed",
        "데일리안": "https://www.dailian.co.kr/rss/all.xml",
        "한국경제 IT": "https://www.hankyung.com/feed/it",
        "매일경제 과학기술": "https://www.mk.co.kr/rss/30500001/",
        # ── 글로벌 AI 뉴스 소스 ────────────────────────────
        "TechCrunch AI": "https://techcrunch.com/category/artificial-intelligence/feed/",  # Fixed: /category/ not /tag/
        "VentureBeat AI": "https://venturebeat.com/category/ai/feed/",
        "MIT Technology Review AI": "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        "The Verge AI": "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
        "AI News": "https://www.artificialintelligence-news.com/feed/",
        "OpenAI Blog": "https://openai.com/news/rss.xml",  # Fixed: moved from /blog/rss/ to /news/rss.xml
        "Google AI Blog": "https://blog.google/technology/ai/rss/",
        # ── 신규 피드 (ChatGPT deep research 추천) ────────
        "Hugging Face Blog": "https://huggingface.co/blog/feed.xml",
        "NVIDIA Blog": "https://blogs.nvidia.com/feed/",
        "Google DeepMind": "https://deepmind.google/blog/rss.xml",
        "Microsoft Research": "https://www.microsoft.com/en-us/research/feed/",
        "Allen AI (AI2)": "https://blog.allenai.org/feed",
    }

    @staticmethod
    def _normalize_title(title: str) -> str:
        """중복 제거를 위한 제목 정규화."""
        if not title:
            return ""
        normalized = title.lower().strip()
        normalized = re.sub(r"\[[^\]]+\]|\([^)]+\)", " ", normalized)
        normalized = re.sub(r"[^a-z0-9가-힣\s]", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized

    @staticmethod
    def _is_similar_title(a: str, b: str, threshold: float = 0.88) -> bool:
        """정규화된 제목 유사도 비교."""
        if not a or not b:
            return False
        if a == b:
            return True
        return SequenceMatcher(None, a, b).ratio() >= threshold

    async def fetch_rss_feed(self, feed_url: str, source_name: str) -> List[Dict[str, Any]]:
        """
        RSS 피드에서 뉴스 가져오기

        Args:
            feed_url: RSS 피드 URL
            source_name: 출처 이름

        Returns:
            뉴스 아이템 리스트
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(feed_url)
                response.raise_for_status()

                # feedparser로 RSS 파싱
                feed = feedparser.parse(response.text)

                articles = []
                for entry in feed.entries[:10]:  # 최대 10개씩
                    # 발행일 파싱
                    published_date = None
                    if hasattr(entry, "published_parsed") and entry.published_parsed:
                        try:
                            published_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                        except Exception:
                            pass
                    elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                        try:
                            published_date = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                        except Exception:
                            pass

                    # 이미지 URL 추출
                    image_url = None
                    if hasattr(entry, "media_content") and entry.media_content:
                        image_url = entry.media_content[0].get("url")
                    elif hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
                        image_url = entry.media_thumbnail[0].get("url")

                    # 저자 추출
                    author = None
                    if hasattr(entry, "author"):
                        author = entry.author
                    elif hasattr(entry, "authors") and entry.authors:
                        author = entry.authors[0].get("name")

                    # 태그 추출
                    tags = []
                    if hasattr(entry, "tags"):
                        tags = [tag.term for tag in entry.tags if hasattr(tag, "term")]

                    article = {
                        "url": entry.link,
                        "title": entry.title if hasattr(entry, "title") else "",
                        "author": author,
                        "source": source_name,
                        "source_url": feed.feed.link if hasattr(feed.feed, "link") else "",
                        "published_date": published_date,
                        "content": entry.description if hasattr(entry, "description") else None,
                        "excerpt": entry.summary if hasattr(entry, "summary") else None,
                        "image_url": image_url,
                        "tags": tags,
                    }

                    articles.append(article)

                print(f"✅ {source_name}: {len(articles)}개 뉴스 수집")
                return articles

        except httpx.HTTPStatusError as e:
            print(f"❌ {source_name} RSS 피드 오류: {e.response.status_code}")
            return []
        except Exception as e:
            print(f"❌ {source_name} 수집 실패: {e}")
            return []

    async def fetch_all_feeds(self) -> List[Dict[str, Any]]:
        """
        모든 RSS 피드에서 뉴스 수집

        Returns:
            전체 뉴스 아이템 리스트
        """
        all_articles = []

        for source_name, feed_url in self.RSS_FEEDS.items():
            articles = await self.fetch_rss_feed(feed_url, source_name)
            all_articles.extend(articles)

        return all_articles

    async def save_news_to_db(
        self, articles: List[Dict[str, Any]], db: AsyncSession
    ) -> int:
        """
        뉴스를 데이터베이스에 저장

        Args:
            articles: 뉴스 아이템 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 뉴스 수
        """
        saved_count = 0
        column_flags = await has_columns(
            db,
            "ai_news",
            ["is_archived", "archived_at"],
        )
        has_archive_columns = (
            column_flags["is_archived"] and column_flags["archived_at"]
        )

        for article_data in articles:
            try:
                # 이미 존재하는지 확인
                result = await db.execute(
                    select(AINews).where(AINews.url == article_data["url"])
                )
                existing_news = result.scalar_one_or_none()

                if existing_news:
                    # 업데이트 (트렌딩 플래그)
                    existing_news.is_trending = True
                    if has_archive_columns:
                        existing_news.is_archived = False
                        existing_news.archived_at = None
                else:
                    # 제목 유사도 기반 중복 제거 (동일 소스 최근 데이터 기준)
                    title = article_data.get("title", "")
                    normalized_title = self._normalize_title(title)
                    source = article_data.get("source")
                    if normalized_title and source:
                        recent = await db.execute(
                            select(AINews.title)
                            .where(AINews.source == source)
                            .order_by(desc(AINews.published_date))
                            .limit(80)
                        )
                        is_duplicate = False
                        for recent_title in recent.scalars().all():
                            if self._is_similar_title(
                                normalized_title,
                                self._normalize_title(recent_title or ""),
                            ):
                                is_duplicate = True
                                break
                        if is_duplicate:
                            continue

                    # 새로 추가
                    new_news = AINews(
                        url=article_data["url"],
                        title=article_data.get("title", ""),
                        author=article_data.get("author"),
                        source=article_data.get("source"),
                        source_url=article_data.get("source_url"),
                        published_date=article_data.get("published_date"),
                        content=article_data.get("content"),
                        excerpt=article_data.get("excerpt"),
                        image_url=article_data.get("image_url"),
                        tags=article_data.get("tags", []),
                        is_trending=True,
                    )
                    db.add(new_news)
                    saved_count += 1

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(f"❌ 뉴스 저장 실패 ({article_data.get('url')}): {e}")

        return saved_count

    async def get_news(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        trending_only: bool = False,
        source: Optional[str] = None,
        include_archived: bool = False,
    ) -> List[AINews]:
        """
        데이터베이스에서 뉴스 목록 가져오기

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 개수
            limit: 가져올 개수
            trending_only: 트렌딩 뉴스만 가져올지 여부
            source: 출처 필터

        Returns:
            뉴스 목록
        """
        query = select(AINews)

        supports_archive = await has_archive_column(db, "ai_news")
        if not include_archived and supports_archive:
            query = query.where(AINews.is_archived == False)

        if trending_only:
            query = query.where(AINews.is_trending == True)

        if source:
            query = query.where(AINews.source == source)

        query = (
            query.order_by(desc(AINews.published_date)).offset(skip).limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_news_by_id(
        self, db: AsyncSession, news_id: int
    ) -> Optional[AINews]:
        """
        ID로 뉴스 가져오기

        Args:
            db: 데이터베이스 세션
            news_id: 뉴스 ID

        Returns:
            뉴스 객체 또는 None
        """
        result = await db.execute(select(AINews).where(AINews.id == news_id))
        return result.scalar_one_or_none()

    def get_available_sources(self) -> List[str]:
        """
        사용 가능한 뉴스 소스 목록

        Returns:
            소스 이름 리스트
        """
        return list(self.RSS_FEEDS.keys())
