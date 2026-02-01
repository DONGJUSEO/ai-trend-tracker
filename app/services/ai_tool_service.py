"""AI Tool 데이터 수집 서비스"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.ai_tool import AITool
from app.config import settings


class AIToolService:
    """AI Tool 데이터 수집 및 관리"""

    # Simplified data source - will use web scraping or simple API
    TOOL_CATEGORIES = [
        "Image Generation",
        "Text/Writing",
        "Code Assistant",
        "Video Creation",
        "Audio/Music",
        "Data Analysis",
        "Chatbot",
        "Productivity",
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "product_hunt_api_key", "")

    async def fetch_trending_tools(self, max_results: int = 30) -> List[Dict[str, Any]]:
        """
        트렌딩 AI 도구 수집 (간단한 하드코딩된 목록으로 시작)

        실제 구현에서는 Product Hunt API 또는 웹 스크래핑 사용

        Args:
            max_results: 최대 결과 수

        Returns:
            AI 도구 정보 리스트
        """
        # 샘플 데이터 - 실제로는 API 또는 스크래핑으로 대체
        sample_tools = [
            {
                "tool_name": "Midjourney",
                "tagline": "AI art generation platform",
                "description": "Create stunning AI-generated images from text prompts",
                "category": "Image Generation",
                "pricing_model": "Freemium",
                "price_range": "$10-60/mo",
                "free_tier_available": False,
                "website": "https://www.midjourney.com",
                "rating": 4.8,
                "upvotes": 15000,
                "is_trending": True,
                "use_cases": ["Art", "Design", "Marketing"],
                "supported_platforms": ["Web", "Discord"],
            },
            {
                "tool_name": "ChatGPT",
                "tagline": "Conversational AI assistant",
                "description": "AI-powered chat for writing, coding, and more",
                "category": "Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-20/mo",
                "free_tier_available": True,
                "website": "https://chat.openai.com",
                "rating": 4.9,
                "upvotes": 50000,
                "is_trending": True,
                "use_cases": ["Writing", "Coding", "Research"],
                "supported_platforms": ["Web", "iOS", "Android"],
            },
            {
                "tool_name": "GitHub Copilot",
                "tagline": "AI pair programmer",
                "description": "AI code completion and suggestions in your IDE",
                "category": "Code Assistant",
                "pricing_model": "Paid",
                "price_range": "$10/mo",
                "free_tier_available": False,
                "website": "https://github.com/features/copilot",
                "rating": 4.7,
                "upvotes": 25000,
                "is_trending": True,
                "use_cases": ["Coding", "Development"],
                "supported_platforms": ["VS Code", "JetBrains", "Vim"],
            },
        ]

        print(f"📦 Fetching trending AI tools (sample data)...")
        return sample_tools[:max_results]

    async def save_to_db(self, tools: List[Dict[str, Any]], db: AsyncSession) -> int:
        """
        AI 도구 정보를 데이터베이스에 저장

        Args:
            tools: AI 도구 정보 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 항목 수
        """
        saved_count = 0

        for tool_data in tools:
            try:
                # 중복 확인 (웹사이트 URL 기준)
                website = tool_data.get("website")
                if not website:
                    continue

                result = await db.execute(
                    select(AITool).where(AITool.website == website)
                )
                existing = result.scalar_one_or_none()

                if existing:
                    # 기존 항목 업데이트
                    for key, value in tool_data.items():
                        if hasattr(existing, key) and value is not None:
                            setattr(existing, key, value)
                    print(f"📝 Updated: {tool_data.get('tool_name', 'Unknown')}")
                else:
                    # 새 항목 생성
                    new_tool = AITool(**tool_data)
                    db.add(new_tool)
                    saved_count += 1
                    print(f"✨ Created: {tool_data.get('tool_name', 'Unknown')}")

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(f"❌ Error saving AI tool: {e}")
                continue

        return saved_count

    async def get_tools(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        trending_only: bool = False,
    ) -> List[AITool]:
        """
        데이터베이스에서 AI 도구 목록 조회

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 항목 수
            limit: 반환할 최대 항목 수
            category: 카테고리 필터
            trending_only: 트렌딩 도구만 조회

        Returns:
            AI 도구 목록
        """
        query = select(AITool)

        if category:
            query = query.where(AITool.category == category)

        if trending_only:
            query = query.where(AITool.is_trending == True)

        query = query.order_by(desc(AITool.upvotes)).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()
