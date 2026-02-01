"""Hugging Face 데이터 수집 서비스"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.models.huggingface import HuggingFaceModel

settings = get_settings()

# Hugging Face API 엔드포인트
HF_API_BASE = "https://huggingface.co/api"
HF_MODELS_ENDPOINT = f"{HF_API_BASE}/models"


class HuggingFaceService:
    """Hugging Face API 연동 서비스"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.huggingface_api_key
        self.headers = {}
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

    async def fetch_trending_models(
        self,
        limit: int = 20,
        task: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Hugging Face에서 트렌딩 모델 가져오기

        Args:
            limit: 가져올 모델 개수
            task: 태스크 필터 (예: text-generation, image-generation)

        Returns:
            모델 정보 리스트
        """
        params = {
            "sort": "downloads",
            "limit": limit,
        }

        if task:
            params["pipeline_tag"] = task

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    HF_MODELS_ENDPOINT,
                    params=params,
                    headers=self.headers,
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"❌ Hugging Face API 에러: {e}")
                return []

    async def fetch_recent_models(
        self,
        limit: int = 20,
        task: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Hugging Face에서 최신 모델 가져오기

        Args:
            limit: 가져올 모델 개수
            task: 태스크 필터

        Returns:
            모델 정보 리스트
        """
        params = {
            "sort": "lastModified",
            "limit": limit,
        }

        if task:
            params["pipeline_tag"] = task

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    HF_MODELS_ENDPOINT,
                    params=params,
                    headers=self.headers,
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"❌ Hugging Face API 에러: {e}")
                return []

    def parse_model_data(self, raw_model: Dict[str, Any]) -> Dict[str, Any]:
        """
        Hugging Face API 응답을 우리 모델 형식으로 변환

        Args:
            raw_model: HF API 원본 데이터

        Returns:
            변환된 모델 데이터
        """
        # 기본 정보
        model_id = raw_model.get("id", "")
        model_name = raw_model.get("cardData", {}).get("name") or model_id.split("/")[-1]
        author = raw_model.get("author") or model_id.split("/")[0]

        # 태스크 정보
        pipeline_tag = raw_model.get("pipeline_tag")
        tags = raw_model.get("tags", [])

        # 통계
        downloads = raw_model.get("downloads", 0)
        likes = raw_model.get("likes", 0)

        # 메타데이터
        library_name = raw_model.get("library_name")
        last_modified = raw_model.get("lastModified")
        if last_modified:
            try:
                last_modified = datetime.fromisoformat(last_modified.replace("Z", "+00:00"))
            except Exception:
                last_modified = None

        # URL
        url = f"https://huggingface.co/{model_id}"

        # 설명 (card에서 가져오기)
        description = None
        card_data = raw_model.get("cardData", {})
        if isinstance(card_data, dict):
            description = card_data.get("description") or card_data.get("summary")

        return {
            "model_id": model_id,
            "model_name": model_name,
            "author": author,
            "description": description,
            "task": pipeline_tag,
            "tags": tags,
            "library_name": library_name,
            "downloads": downloads,
            "likes": likes,
            "url": url,
            "last_modified": last_modified,
        }

    async def save_models_to_db(
        self,
        models_data: List[Dict[str, Any]],
        db: AsyncSession,
        is_trending: bool = False,
    ) -> int:
        """
        모델 데이터를 데이터베이스에 저장

        Args:
            models_data: 모델 데이터 리스트
            db: 데이터베이스 세션
            is_trending: 트렌딩 모델 여부

        Returns:
            저장된 모델 개수
        """
        saved_count = 0

        for model_data in models_data:
            parsed_data = self.parse_model_data(model_data)

            # 기존 모델 확인
            query = select(HuggingFaceModel).where(
                HuggingFaceModel.model_id == parsed_data["model_id"]
            )
            result = await db.execute(query)
            existing_model = result.scalar_one_or_none()

            if existing_model:
                # 업데이트
                for key, value in parsed_data.items():
                    setattr(existing_model, key, value)
                existing_model.is_trending = is_trending
                existing_model.collected_at = datetime.utcnow()
            else:
                # 새로 생성
                new_model = HuggingFaceModel(
                    **parsed_data,
                    is_trending=is_trending,
                )
                db.add(new_model)
                saved_count += 1

        await db.commit()
        return saved_count

    async def collect_trending_models(
        self,
        db: AsyncSession,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        트렌딩 모델 수집 및 저장

        Args:
            db: 데이터베이스 세션
            limit: 수집할 모델 개수

        Returns:
            수집 결과
        """
        print(f"🔍 Hugging Face 트렌딩 모델 {limit}개 수집 시작...")

        # 데이터 가져오기
        models_data = await self.fetch_trending_models(limit=limit)

        if not models_data:
            print("⚠️  가져온 모델이 없습니다.")
            return {"success": False, "count": 0}

        # 데이터베이스에 저장
        saved_count = await self.save_models_to_db(
            models_data,
            db,
            is_trending=True,
        )

        print(f"✅ {saved_count}개 신규 모델 저장 완료!")
        return {
            "success": True,
            "count": saved_count,
            "total_fetched": len(models_data),
        }

    async def collect_recent_models(
        self,
        db: AsyncSession,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        최신 모델 수집 및 저장

        Args:
            db: 데이터베이스 세션
            limit: 수집할 모델 개수

        Returns:
            수집 결과
        """
        print(f"🔍 Hugging Face 최신 모델 {limit}개 수집 시작...")

        # 데이터 가져오기
        models_data = await self.fetch_recent_models(limit=limit)

        if not models_data:
            print("⚠️  가져온 모델이 없습니다.")
            return {"success": False, "count": 0}

        # 데이터베이스에 저장
        saved_count = await self.save_models_to_db(models_data, db)

        print(f"✅ {saved_count}개 신규 모델 저장 완료!")
        return {
            "success": True,
            "count": saved_count,
            "total_fetched": len(models_data),
        }
