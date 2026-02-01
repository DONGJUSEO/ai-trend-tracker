"""YouTube Data API 서비스"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.youtube import YouTubeVideo
from app.schemas.youtube import YouTubeVideoCreate
from app.config import get_settings

settings = get_settings()


class YouTubeService:
    """YouTube Data API v3 서비스"""

    BASE_URL = "https://www.googleapis.com/youtube/v3"

    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: YouTube Data API 키 (없으면 settings에서 가져옴)
        """
        self.api_key = api_key or getattr(settings, "youtube_api_key", "")

        if not self.api_key:
            print("⚠️  YouTube API 키가 없습니다. YouTube 데이터 수집이 비활성화됩니다.")

    async def search_ai_videos(
        self,
        query: str = "AI artificial intelligence",
        max_results: int = 20,
        order: str = "viewCount",
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
                    "relevanceLanguage": "en",
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
                video_details = await self._get_video_details(video_ids)

                return video_details

        except httpx.HTTPStatusError as e:
            print(f"❌ YouTube API 오류: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            print(f"❌ YouTube 데이터 수집 실패: {e}")
            return []

    async def _get_video_details(self, video_ids: List[str]) -> List[Dict[str, Any]]:
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

        for video_data in videos:
            try:
                # 이미 존재하는지 확인
                result = await db.execute(
                    select(YouTubeVideo).where(
                        YouTubeVideo.video_id == video_data["video_id"]
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
                    existing_video.is_trending = True
                else:
                    # 새로 추가
                    new_video = YouTubeVideo(
                        video_id=video_data["video_id"],
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

                search_response = await client.get(
                    f"{self.BASE_URL}/search", params=search_params
                )
                search_response.raise_for_status()
                search_data = search_response.json()

                if "items" not in search_data or not search_data["items"]:
                    return []

                # 2. 비디오 상세 정보 가져오기
                video_ids = [item["id"]["videoId"] for item in search_data["items"]]
                video_details = await self._get_video_details(video_ids)

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
