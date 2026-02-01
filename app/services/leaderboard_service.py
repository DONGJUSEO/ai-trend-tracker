"""AI Leaderboard 데이터 수집 서비스"""
import httpx
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.leaderboard import AILeaderboard


class LeaderboardService:
    async def fetch_sample_leaderboards(self) -> List[Dict[str, Any]]:
        """샘플 리더보드 데이터"""
        return [
            {
                "model_name": "GPT-4 Turbo",
                "leaderboard_source": "Open LLM Leaderboard",
                "rank": 1,
                "scores": {"MMLU": 86.4, "GSM8K": 92.0, "HumanEval": 87.2},
                "organization": "OpenAI",
                "model_size": "Unknown",
                "model_type": "Closed",
                "is_trending": True,
                "strengths": ["Reasoning", "Math", "Code"],
            },
            {
                "model_name": "Claude 3 Opus",
                "leaderboard_source": "Chatbot Arena",
                "rank": 2,
                "scores": {"MMLU": 86.8, "GSM8K": 90.7, "HumanEval": 84.9},
                "organization": "Anthropic",
                "model_size": "Unknown",
                "model_type": "Closed",
                "is_trending": True,
                "strengths": ["Analysis", "Writing", "Safety"],
            },
        ]

    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        saved = 0
        for item in items:
            url = f"https://huggingface.co/{item.get('model_name', '').replace(' ', '-')}"
            item['huggingface_url'] = url
            result = await db.execute(select(AILeaderboard).where(AILeaderboard.huggingface_url == url))
            if not result.scalar_one_or_none():
                db.add(AILeaderboard(**item))
                saved += 1
        await db.commit()
        return saved
