"""YouTube Data API 서비스"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.youtube import YouTubeVideo
from app.schemas.youtube import YouTubeVideoCreate
from app.config import get_settings
from app.db_compat import has_archive_column, has_columns

settings = get_settings()


class YouTubeService:
    """YouTube Data API v3 서비스"""

    BASE_URL = "https://www.googleapis.com/youtube/v3"

    # Curated AI YouTube channels (verified list, 2026-02)
    CURATED_CHANNELS = {
        # Korean AI YouTubers (14)
        "korean": [
            {"handle": "@jocoding", "channel_id": "UCQNE2JmbasNYbjGAcuBiRRg", "name": "조코딩", "category": "AI코딩교육", "language": "ko"},
            {"handle": "@teddynote", "channel_id": "UCt2wAAXgm87ACiqqnDIjOjg", "name": "테디노트", "category": "AI실습", "language": "ko"},
            {"handle": "@bbanghyong", "channel_id": "UC9PB9nKYVIvRzn9M9KDftbg", "name": "빵형의 개발도상국", "category": "AI개발", "language": "ko"},
            {"handle": "@codefactory", "channel_id": "UCdfcSGOM6-U6jP2fj8sL4yA", "name": "코드팩토리", "category": "개발교육", "language": "ko"},
            {"handle": "@nomadcoders", "channel_id": "UCUpJs89fSBXNolQGOYKn0YQ", "name": "노마드코더", "category": "개발교육", "language": "ko"},
            {"handle": "@aitalktalk", "channel_id": "UCxkickmF3xdJv7sU0hBERDQ", "name": "AI톡톡", "category": "AI뉴스", "language": "ko"},
            {"handle": "@undeal", "channel_id": "UCGx4_xr7cMATgEsOR-GwKJg", "name": "안될공학", "category": "과학기술", "language": "ko"},
            {"handle": "@deepdive_kr", "channel_id": "UC1JmT0jMpGOyGgW6_X23wew", "name": "딥다이브", "category": "AI심층분석", "language": "ko"},
            {"handle": "@eo_studio", "channel_id": "UCQ2DWm5Md16Dc3xRwwhVE7Q", "name": "EO", "category": "스타트업", "language": "ko"},
            {"handle": "@syukaworld", "channel_id": "UCsJ6RuBiTVWRX156FVbeaGg", "name": "슈카월드", "category": "경제IT", "language": "ko"},
            {"handle": "@nadocoding", "channel_id": "UC7iAOLiALt2rtMVAWWF4ZXg", "name": "나도코딩", "category": "코딩교육", "language": "ko"},
            {"handle": "@생활코딩", "channel_id": "UCvc8kv-i5fvFTJBFAk6n1SA", "name": "생활코딩", "category": "코딩교육", "language": "ko"},
            {"handle": "@ITSub", "channel_id": "UCF4Wxdo3inmxP-Y59wXDsFw", "name": "잇섭", "category": "IT리뷰", "language": "ko"},
            {"handle": "@codinghaneungeoni", "channel_id": "UCKY6lyoOHnP8Bnrs5dJoVHA", "name": "코딩하는거니", "category": "AI코딩", "language": "ko"},
        ],
        # International AI YouTubers (15)
        "international": [
            {"handle": "@TwoMinutePapers", "channel_id": "UCbfYPyITQ-7l4upoX8nvctg", "name": "Two Minute Papers", "category": "AI논문리뷰", "language": "en"},
            {"handle": "@YannicKilcher", "channel_id": "UCZHmQk67mSJgfCCTn7xBfew", "name": "Yannic Kilcher", "category": "AI논문심층", "language": "en"},
            {"handle": "@aiexplained", "channel_id": "UCNJ1Ymd5yFuUPtn21xtRbbw", "name": "AI Explained", "category": "AI분석", "language": "en"},
            {"handle": "@matthew_berman", "channel_id": "UCRI57CYakIZnJqnR-rN7TFg", "name": "Matthew Berman", "category": "AI리뷰", "language": "en"},
            {"handle": "@WesRoth", "channel_id": "UC_xGMsl6_HCu1MPyDZaLxSg", "name": "Wes Roth", "category": "AI뉴스", "language": "en"},
            {"handle": "@TheAIGRID", "channel_id": "UCwmhMQmRxLHj2BYjmOAkYNQ", "name": "TheAIGRID", "category": "AI뉴스", "language": "en"},
            {"handle": "@Fireship", "channel_id": "UCsBjURrPoezykLs9EqgamOA", "name": "Fireship", "category": "개발트렌드", "language": "en"},
            {"handle": "@AndrejKarpathy", "channel_id": "UCXUPKJO5MZQN11PqgIvyuvQ", "name": "Andrej Karpathy", "category": "AI교육", "language": "en"},
            {"handle": "@3blue1brown", "channel_id": "UCYO_jab_esuFRV4b17AJtAw", "name": "3Blue1Brown", "category": "수학/AI", "language": "en"},
            {"handle": "@sentdex", "channel_id": "UCfzlCWGWYyIQ0aLC5w48gBQ", "name": "Sentdex", "category": "파이썬ML", "language": "en"},
            {"handle": "@RobertMilesAI", "channel_id": "UCLB7AzTwc6VFZrBsO2ucBMg", "name": "Robert Miles", "category": "AI안전", "language": "en"},
            {"handle": "@MachineLearningStreetTalk", "channel_id": "UCMLtBahI5DMrt0NPvDSoIRQ", "name": "Machine Learning Street Talk", "category": "AI팟캐스트", "language": "en"},
            {"handle": "@samwitteveenai", "channel_id": "UCNmkycz3a2bAkLSoRdDBxPg", "name": "Sam Witteveen", "category": "LLM실습", "language": "en"},
            {"handle": "@DavesGarage", "channel_id": "UCNzszbnvQeFzObW0ghk0Ckw", "name": "Dave's Garage", "category": "테크토크", "language": "en"},
            {"handle": "@PromptEngineering", "channel_id": "UCDq7SjbgRKty5TgGafW8Clg", "name": "Prompt Engineering", "category": "프롬프트엔지니어링", "language": "en"},
        ],
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: YouTube Data API 키 (없으면 settings에서 가져옴)
        """
        self.api_key = api_key or getattr(settings, "youtube_api_key", "")

        if not self.api_key:
            print("⚠️  YouTube API 키가 없습니다. YouTube 데이터 수집이 비활성화됩니다.")

    @staticmethod
    def _extract_video_id(video_ref: Optional[str]) -> Optional[str]:
        """video_id/url 형태 입력에서 video_id를 정규화."""
        if not video_ref:
            return None
        ref = video_ref.strip()
        if re.fullmatch(r"[A-Za-z0-9_-]{11}", ref):
            return ref
        patterns = [
            r"(?:v=)([A-Za-z0-9_-]{11})",
            r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
            r"(?:shorts/)([A-Za-z0-9_-]{11})",
            r"(?:embed/)([A-Za-z0-9_-]{11})",
        ]
        for pattern in patterns:
            match = re.search(pattern, ref)
            if match:
                return match.group(1)
        return None

    @staticmethod
    def _normalize_channel_language(language: Optional[str], fallback: str = "en") -> str:
        """YouTube 언어 코드를 ko/en으로 정규화."""
        raw = (language or "").lower()
        if raw.startswith("ko"):
            return "ko"
        if raw.startswith("en"):
            return "en"
        return fallback

    @staticmethod
    def _fallback_language_from_video(video_data: Dict[str, Any]) -> str:
        text = " ".join(
            [
                video_data.get("channel_title", "") or "",
                video_data.get("title", "") or "",
            ]
        )
        if re.search(r"[가-힣]", text):
            return "ko"
        return "en"

    def _language_from_handle(self, handle: Optional[str]) -> Optional[str]:
        if not handle:
            return None
        for region, channels in self.CURATED_CHANNELS.items():
            for channel in channels:
                if channel.get("handle", "").lower() == handle.lower():
                    language = channel.get("language")
                    if language:
                        return language
                    return "ko" if region == "korean" else "en"
        return None

    async def search_ai_videos(
        self,
        query: str = "AI artificial intelligence",
        max_results: int = 20,
        order: str = "viewCount",
        relevance_language: str = "en",
    ) -> List[Dict[str, Any]]:
        """
        AI 관련 YouTube 비디오 검색

        Args:
            query: 검색 쿼리
            max_results: 최대 결과 수
            order: 정렬 기준 (date, rating, relevance, title, viewCount)

        Returns:
            비디오 정보 리스트
        """
        if not self.api_key:
            print("⚠️  YouTube API 키가 없어 데이터를 수집할 수 없습니다.")
            return []

        try:
            async with httpx.AsyncClient() as client:
                # 1. 비디오 검색
                search_params = {
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": max_results,
                    "order": order,
                    "relevanceLanguage": relevance_language,
                    "videoDuration": "medium",  # 4-20분 영상
                    "publishedAfter": self._get_recent_date(),
                    "key": self.api_key,
                }

                search_response = await client.get(
                    f"{self.BASE_URL}/search", params=search_params
                )
                search_response.raise_for_status()
                search_data = search_response.json()

                if "items" not in search_data or not search_data["items"]:
                    print("⚠️  검색 결과가 없습니다.")
                    return []

                # 2. 비디오 상세 정보 가져오기
                video_ids = [item["id"]["videoId"] for item in search_data["items"]]
                video_details = await self._get_video_details(
                    video_ids,
                    default_language=self._normalize_channel_language(
                        relevance_language, fallback="en"
                    ),
                )

                return video_details

        except httpx.HTTPStatusError as e:
            print(f"❌ YouTube API 오류: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"❌ YouTube 데이터 수집 실패: {e}")
            return []

    async def _get_video_details(
        self,
        video_ids: List[str],
        default_language: str = "en",
    ) -> List[Dict[str, Any]]:
        """
        비디오 상세 정보 가져오기

        Args:
            video_ids: 비디오 ID 리스트

        Returns:
            상세 정보 리스트
        """
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "part": "snippet,statistics,contentDetails",
                    "id": ",".join(video_ids),
                    "key": self.api_key,
                }

                response = await client.get(f"{self.BASE_URL}/videos", params=params)
                response.raise_for_status()
                data = response.json()

                videos = []
                for item in data.get("items", []):
                    snippet = item.get("snippet", {})
                    statistics = item.get("statistics", {})
                    content_details = item.get("contentDetails", {})

                    video_info = {
                        "video_id": item["id"],
                        "title": snippet.get("title", ""),
                        "channel_title": snippet.get("channelTitle", ""),
                        "channel_id": snippet.get("channelId", ""),
                        "channel_language": self._normalize_channel_language(
                            snippet.get("defaultLanguage")
                            or snippet.get("defaultAudioLanguage"),
                            fallback=default_language,
                        ),
                        "description": snippet.get("description", ""),
                        "published_at": snippet.get("publishedAt", ""),
                        "thumbnail_url": snippet.get("thumbnails", {})
                        .get("high", {})
                        .get("url", ""),
                        "view_count": int(statistics.get("viewCount", 0)),
                        "like_count": int(statistics.get("likeCount", 0)),
                        "comment_count": int(statistics.get("commentCount", 0)),
                        "duration": content_details.get("duration", ""),
                        "tags": snippet.get("tags", []),
                    }
                    videos.append(video_info)

                return videos

        except Exception as e:
            print(f"❌ 비디오 상세 정보 가져오기 실패: {e}")
            return []

    def _get_recent_date(self) -> str:
        """최근 30일 날짜를 RFC 3339 형식으로 반환"""
        from datetime import timedelta

        recent_date = datetime.utcnow() - timedelta(days=30)
        return recent_date.strftime("%Y-%m-%dT%H:%M:%SZ")

    async def save_videos_to_db(
        self, videos: List[Dict[str, Any]], db: AsyncSession
    ) -> int:
        """
        비디오 정보를 데이터베이스에 저장

        Args:
            videos: 비디오 정보 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 비디오 수
        """
        saved_count = 0
        column_flags = await has_columns(
            db,
            "youtube_videos",
            ["is_archived", "archived_at", "channel_language"],
        )
        has_archive_columns = (
            column_flags["is_archived"] and column_flags["archived_at"]
        )
        has_channel_language = column_flags["channel_language"]

        for video_data in videos:
            try:
                normalized_video_id = self._extract_video_id(video_data.get("video_id"))
                if not normalized_video_id:
                    normalized_video_id = self._extract_video_id(video_data.get("url"))
                if not normalized_video_id:
                    continue

                # 이미 존재하는지 확인
                result = await db.execute(
                    select(YouTubeVideo).where(
                        YouTubeVideo.video_id == normalized_video_id
                    )
                )
                existing_video = result.scalar_one_or_none()

                # published_at 파싱
                published_at = None
                if video_data.get("published_at"):
                    try:
                        published_at = datetime.fromisoformat(
                            video_data["published_at"].replace("Z", "+00:00")
                        )
                    except Exception:
                        pass

                if existing_video:
                    # 업데이트 (조회수, 좋아요 수 등)
                    existing_video.view_count = video_data.get("view_count", 0)
                    existing_video.like_count = video_data.get("like_count", 0)
                    existing_video.comment_count = video_data.get("comment_count", 0)
                    if has_channel_language:
                        existing_video.channel_language = self._normalize_channel_language(
                            video_data.get("channel_language"),
                            fallback=self._fallback_language_from_video(video_data),
                        )
                    existing_video.is_trending = True
                    if has_archive_columns:
                        existing_video.is_archived = False
                        existing_video.archived_at = None
                else:
                    # 동일 채널 + 동일 제목 + 동일 게시일 중복 방어
                    duplicate_query = select(YouTubeVideo).where(
                        YouTubeVideo.channel_id == video_data.get("channel_id"),
                        YouTubeVideo.title == video_data.get("title", ""),
                        YouTubeVideo.published_at == published_at,
                    )
                    duplicate_row = (await db.execute(duplicate_query)).scalar_one_or_none()
                    if duplicate_row:
                        duplicate_row.is_trending = True
                        if has_archive_columns:
                            duplicate_row.is_archived = False
                            duplicate_row.archived_at = None
                        await db.commit()
                        continue

                    # 새로 추가
                    payload = dict(
                        video_id=normalized_video_id,
                        title=video_data.get("title", ""),
                        channel_title=video_data.get("channel_title"),
                        channel_id=video_data.get("channel_id"),
                        description=video_data.get("description"),
                        published_at=published_at,
                        thumbnail_url=video_data.get("thumbnail_url"),
                        view_count=video_data.get("view_count", 0),
                        like_count=video_data.get("like_count", 0),
                        comment_count=video_data.get("comment_count", 0),
                        duration=video_data.get("duration"),
                        tags=video_data.get("tags", []),
                        is_trending=True,
                    )
                    if has_channel_language:
                        payload["channel_language"] = self._normalize_channel_language(
                            video_data.get("channel_language"),
                            fallback=self._fallback_language_from_video(video_data),
                        )
                    new_video = YouTubeVideo(**payload)
                    db.add(new_video)
                    saved_count += 1

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(f"❌ 비디오 저장 실패 ({video_data.get('video_id')}): {e}")

        return saved_count

    async def get_videos(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        trending_only: bool = False,
        include_archived: bool = False,
    ) -> List[YouTubeVideo]:
        """
        데이터베이스에서 비디오 목록 가져오기

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 개수
            limit: 가져올 개수
            trending_only: 트렌딩 비디오만 가져올지 여부

        Returns:
            비디오 목록
        """
        query = select(YouTubeVideo)

        supports_archive = await has_archive_column(db, "youtube_videos")
        if not include_archived and supports_archive:
            query = query.where(YouTubeVideo.is_archived == False)

        if trending_only:
            query = query.where(YouTubeVideo.is_trending == True)

        query = query.order_by(desc(YouTubeVideo.view_count)).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    async def get_video_by_id(
        self, db: AsyncSession, video_id: str
    ) -> Optional[YouTubeVideo]:
        """
        비디오 ID로 비디오 가져오기

        Args:
            db: 데이터베이스 세션
            video_id: YouTube 비디오 ID

        Returns:
            비디오 객체 또는 None
        """
        result = await db.execute(
            select(YouTubeVideo).where(YouTubeVideo.video_id == video_id)
        )
        return result.scalar_one_or_none()

    async def get_channel_videos(
        self,
        channel_id: str,
        max_results: int = 10,
        order: str = "date",
        relevance_language: Optional[str] = None,
        default_language: str = "en",
    ) -> List[Dict[str, Any]]:
        """
        특정 채널의 최신 비디오 가져오기

        Args:
            channel_id: YouTube 채널 ID
            max_results: 최대 결과 수
            order: 정렬 기준 (date, rating, relevance, title, viewCount)

        Returns:
            비디오 정보 리스트
        """
        if not self.api_key:
            print("⚠️  YouTube API 키가 없어 데이터를 수집할 수 없습니다.")
            return []

        try:
            async with httpx.AsyncClient() as client:
                # 1. 채널의 비디오 검색
                search_params = {
                    "part": "snippet",
                    "channelId": channel_id,
                    "type": "video",
                    "maxResults": max_results,
                    "order": order,
                    "publishedAfter": self._get_recent_date(),
                    "key": self.api_key,
                }
                if relevance_language:
                    search_params["relevanceLanguage"] = relevance_language

                search_response = await client.get(
                    f"{self.BASE_URL}/search", params=search_params
                )
                search_response.raise_for_status()
                search_data = search_response.json()

                if "items" not in search_data or not search_data["items"]:
                    return []

                # 2. 비디오 상세 정보 가져오기
                video_ids = [item["id"]["videoId"] for item in search_data["items"]]
                video_details = await self._get_video_details(
                    video_ids,
                    default_language=default_language,
                )

                return video_details

        except httpx.HTTPStatusError as e:
            print(f"❌ YouTube API 오류 (채널 {channel_id}): {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"❌ 채널 비디오 수집 실패 ({channel_id}): {e}")
            return []

    async def get_channel_info(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """
        채널 정보 가져오기 (구독자 수, 영상 수 등)

        Args:
            channel_id: YouTube 채널 ID

        Returns:
            채널 정보 딕셔너리
        """
        if not self.api_key:
            return None

        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "part": "snippet,statistics",
                    "id": channel_id,
                    "key": self.api_key,
                }

                response = await client.get(
                    f"{self.BASE_URL}/channels", params=params
                )
                response.raise_for_status()
                data = response.json()

                if "items" not in data or not data["items"]:
                    return None

                item = data["items"][0]
                snippet = item.get("snippet", {})
                statistics = item.get("statistics", {})

                return {
                    "channel_id": channel_id,
                    "channel_name": snippet.get("title", ""),
                    "description": snippet.get("description", ""),
                    "subscriber_count": int(statistics.get("subscriberCount", 0)),
                    "video_count": int(statistics.get("videoCount", 0)),
                }

        except Exception as e:
            print(f"❌ 채널 정보 가져오기 실패 ({channel_id}): {e}")
            return None

    def get_curated_channels(self, region: Optional[str] = None) -> Dict[str, Any]:
        """
        Gemini deep research로 선정된 큐레이션 AI 유튜브 채널 목록 반환

        Args:
            region: 지역 필터 ('korean', 'international', None=전체)

        Returns:
            큐레이션 채널 딕셔너리
        """
        if region and region in self.CURATED_CHANNELS:
            return {region: self.CURATED_CHANNELS[region]}
        return self.CURATED_CHANNELS

    async def fetch_channel_videos_by_handle(
        self,
        handle: str,
        max_results: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        YouTube 핸들(@handle)로 채널을 검색하고 최신 비디오를 가져오기

        Args:
            handle: YouTube 채널 핸들 (예: '@jocoding')
            max_results: 최대 결과 수

        Returns:
            비디오 정보 리스트
        """
        if not self.api_key:
            print("⚠️  YouTube API 키가 없어 데이터를 수집할 수 없습니다.")
            return []

        try:
            expected_language = self._language_from_handle(handle) or "en"
            async with httpx.AsyncClient() as client:
                # 1. 핸들로 채널 검색하여 채널 ID 확인
                search_params = {
                    "part": "snippet",
                    "q": handle,
                    "type": "channel",
                    "maxResults": 1,
                    "key": self.api_key,
                }

                search_response = await client.get(
                    f"{self.BASE_URL}/search", params=search_params
                )
                search_response.raise_for_status()
                search_data = search_response.json()

                if "items" not in search_data or not search_data["items"]:
                    print(f"⚠️  채널을 찾을 수 없습니다: {handle}")
                    return []

                channel_id = search_data["items"][0]["snippet"]["channelId"]

                # 2. 채널 ID로 최신 비디오 가져오기
                return await self.get_channel_videos(
                    channel_id=channel_id,
                    max_results=max_results,
                    order="date",
                    relevance_language=expected_language,
                    default_language=expected_language,
                )

        except httpx.HTTPStatusError as e:
            print(f"❌ YouTube API 오류 (핸들 {handle}): {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"❌ 핸들 기반 비디오 수집 실패 ({handle}): {e}")
            return []
