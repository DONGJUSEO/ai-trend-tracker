from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.policy import AIPolicy

class PolicyService:
    async def fetch_sample_policies(self) -> List[Dict]:
        return [{
            "title": "EU AI Act",
            "policy_type": "Regulation",
            "country": "European Union",
            "status": "Enacted",
            "description": "Comprehensive AI regulation framework",
            "source_url": "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
            "impact_areas": ["Healthcare", "Finance", "Public Services"],
            "is_trending": True,
        }]
    
    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
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
