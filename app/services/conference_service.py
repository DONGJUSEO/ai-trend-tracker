"""AI Conference 데이터 수집 서비스"""
import httpx
import feedparser
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.conference import AIConference
from app.config import get_settings


class ConferenceService:
    """AI Conference 데이터 수집 및 관리"""

    # WikiCFP RSS feeds for AI-related conferences
    RSS_FEEDS = {
        "ai": "http://www.wikicfp.com/cfp/rss?cat=intelligence&t=c",
        "ml": "http://www.wikicfp.com/cfp/rss?cat=machine+learning&t=c",
        "cv": "http://www.wikicfp.com/cfp/rss?cat=computer+vision&t=c",
        "nlp": "http://www.wikicfp.com/cfp/rss?cat=natural+language&t=c",
    }

    # Well-known AI conferences
    MAJOR_CONFERENCES = {
        "NeurIPS": "A*",
        "ICML": "A*",
        "ICLR": "A*",
        "CVPR": "A*",
        "AAAI": "A*",
        "IJCAI": "A*",
        "ACL": "A*",
        "EMNLP": "A",
        "NAACL": "A",
        "ECCV": "A",
        "ICCV": "A*",
    }

    def __init__(self):
        pass

    async def fetch_wikicfp_conferences(self, max_results: int = 50) -> List[Dict[str, Any]]:
        """
        WikiCFP RSS 피드에서 AI 컨퍼런스 정보 수집

        Args:
            max_results: 최대 결과 수

        Returns:
            컨퍼런스 정보 리스트
        """
        all_conferences = []

        try:
            for category, feed_url in self.RSS_FEEDS.items():
                print(f"📡 Fetching conferences from WikiCFP ({category})...")

                # feedparser는 동기 라이브러리이므로 직접 사용
                feed = feedparser.parse(feed_url)

                for entry in feed.entries[:max_results]:
                    conference_data = self._parse_wikicfp_entry(entry, category)
                    if conference_data:
                        all_conferences.append(conference_data)

                print(f"✅ Fetched {len(feed.entries[:max_results])} entries from {category}")

        except Exception as e:
            print(f"❌ Error fetching WikiCFP conferences: {e}")

        return all_conferences[:max_results]

    def _parse_wikicfp_entry(self, entry: Any, category: str) -> Optional[Dict[str, Any]]:
        """
        WikiCFP RSS entry 파싱

        Args:
            entry: feedparser entry 객체
            category: 카테고리 (ai, ml, cv, nlp)

        Returns:
            파싱된 컨퍼런스 정보
        """
        try:
            title = entry.get("title", "")
            link = entry.get("link", "")
            description = entry.get("summary", "")

            # 제목에서 컨퍼런스 약어 추출 시도
            acronym = self._extract_acronym(title)

            # 날짜 정보 추출 (WikiCFP 형식 파싱 필요)
            # 예: "Submission Deadline: Jan 15, 2026"
            submission_deadline = self._extract_date_from_text(description, "submission")

            # 기본 정보 구성
            conference_data = {
                "conference_name": title,
                "conference_acronym": acronym,
                "website_url": link,
                "submission_deadline": submission_deadline,
                "topics": [category.upper()],
                "tier": self.MAJOR_CONFERENCES.get(acronym, "B") if acronym else "B",
                "is_upcoming": self._is_upcoming(submission_deadline),
            }

            return conference_data

        except Exception as e:
            print(f"⚠️ Error parsing WikiCFP entry: {e}")
            return None

    def _extract_acronym(self, title: str) -> Optional[str]:
        """제목에서 컨퍼런스 약어 추출"""
        import re

        # 괄호 안의 약어 찾기: "International Conference on XYZ (ICXYZ) 2026"
        match = re.search(r'\(([A-Z]+)\)', title)
        if match:
            return match.group(1)

        # 알려진 컨퍼런스명이 있는지 확인
        for conf_name in self.MAJOR_CONFERENCES.keys():
            if conf_name in title.upper():
                return conf_name

        return None

    def _extract_date_from_text(self, text: str, date_type: str = "submission") -> Optional[datetime]:
        """
        텍스트에서 날짜 추출

        Args:
            text: 파싱할 텍스트
            date_type: 날짜 유형 (submission, notification, start, end)

        Returns:
            추출된 datetime 객체
        """
        import re
        from dateutil import parser as date_parser

        try:
            # 날짜 패턴 찾기
            patterns = {
                "submission": r"(?:submission|deadline):\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
                "notification": r"notification:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
                "start": r"(?:start|conference):\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
            }

            pattern = patterns.get(date_type, patterns["submission"])
            match = re.search(pattern, text, re.IGNORECASE)

            if match:
                date_str = match.group(1)
                return date_parser.parse(date_str)

        except Exception as e:
            print(f"⚠️ Date parsing error: {e}")

        return None

    def _is_upcoming(self, deadline: Optional[datetime]) -> bool:
        """마감일이 다가오는 컨퍼런스인지 확인"""
        if not deadline:
            return False

        now = datetime.now()
        # 마감일이 현재로부터 6개월 이내면 upcoming
        return now < deadline < (now + timedelta(days=180))

    async def save_to_db(
        self, conferences: List[Dict[str, Any]], db: AsyncSession
    ) -> int:
        """
        컨퍼런스 정보를 데이터베이스에 저장

        Args:
            conferences: 컨퍼런스 정보 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 항목 수
        """
        saved_count = 0

        for conf_data in conferences:
            try:
                # 중복 확인 (URL 기준)
                website_url = conf_data.get("website_url")
                if not website_url:
                    continue

                result = await db.execute(
                    select(AIConference).where(AIConference.website_url == website_url)
                )
                existing = result.scalar_one_or_none()

                if existing:
                    # 기존 항목 업데이트
                    for key, value in conf_data.items():
                        if hasattr(existing, key) and value is not None:
                            setattr(existing, key, value)
                    print(f"📝 Updated: {conf_data.get('conference_name', 'Unknown')}")
                else:
                    # 새 항목 생성
                    new_conference = AIConference(**conf_data)
                    db.add(new_conference)
                    saved_count += 1
                    print(f"✨ Created: {conf_data.get('conference_name', 'Unknown')}")

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(f"❌ Error saving conference: {e}")
                continue

        return saved_count

    async def get_conferences(
        self, db: AsyncSession, skip: int = 0, limit: int = 20, upcoming_only: bool = False
    ) -> List[AIConference]:
        """
        데이터베이스에서 컨퍼런스 목록 조회

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 항목 수
            limit: 반환할 최대 항목 수
            upcoming_only: 다가오는 컨퍼런스만 조회

        Returns:
            컨퍼런스 목록
        """
        query = select(AIConference)

        if upcoming_only:
            query = query.where(AIConference.is_upcoming == True)

        query = query.order_by(desc(AIConference.submission_deadline)).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()
