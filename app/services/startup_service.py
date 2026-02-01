from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.startup import AIStartup

class StartupService:
    async def fetch_sample_startups(self) -> List[Dict]:
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
        }]
    
    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
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
