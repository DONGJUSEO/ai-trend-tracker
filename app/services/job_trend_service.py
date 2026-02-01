from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.job_trend import AIJobTrend

class JobTrendService:
    async def fetch_sample_jobs(self) -> List[Dict]:
        return [{
            "job_title": "Senior ML Engineer",
            "company_name": "OpenAI",
            "location": "San Francisco, CA",
            "is_remote": True,
            "salary_min": 200000,
            "salary_max": 300000,
            "required_skills": ["Python", "PyTorch", "Transformers"],
            "job_url": "https://openai.com/careers/ml-engineer",
            "is_trending": True,
        }]
    
    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        saved = 0
        for item in items:
            url = item.get('job_url')
            if url:
                result = await db.execute(select(AIJobTrend).where(AIJobTrend.job_url == url))
                if not result.scalar_one_or_none():
                    db.add(AIJobTrend(**item))
                    saved += 1
        await db.commit()
        return saved
