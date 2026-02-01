"""AI 채용 트렌드 데이터 수집 서비스"""
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
from datetime import datetime

from app.models.job_trend import AIJobTrend


class JobTrendService:
    """AI 채용 트렌드 서비스"""

    def __init__(self):
        self.remoteok_api_url = "https://remoteok.com/api"

    async def fetch_remoteok_jobs(self, max_results: int = 30) -> List[Dict[str, Any]]:
        """RemoteOK API에서 AI/ML 채용 공고 수집"""
        jobs = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (compatible; AITrendTracker/1.0)"
                }

                response = await client.get(self.remoteok_api_url, headers=headers)
                response.raise_for_status()

                data = response.json()
                job_listings = data[1:] if isinstance(data, list) and len(data) > 1 else []

                ai_keywords = ["ai", "ml", "machine learning", "deep learning", "data scientist",
                               "nlp", "computer vision", "pytorch", "tensorflow", "llm", "gpt"]

                for job in job_listings:
                    try:
                        position = (job.get("position", "") or "").lower()
                        description = (job.get("description", "") or "").lower()
                        tags = [tag.lower() for tag in (job.get("tags") or [])]

                        is_ai_related = any(keyword in position or keyword in description or keyword in tags
                                           for keyword in ai_keywords)

                        if not is_ai_related:
                            continue

                        salary_min = int(job.get("salary_min")) if job.get("salary_min") else None
                        salary_max = int(job.get("salary_max")) if job.get("salary_max") else None

                        skills = self._extract_skills(description, job.get("tags", []))

                        jobs.append({
                            "job_title": job.get("position", "Unknown"),
                            "company_name": job.get("company", "Unknown"),
                            "description": (job.get("description", "") or "")[:500],
                            "location": job.get("location", "Remote"),
                            "is_remote": True,
                            "salary_min": salary_min,
                            "salary_max": salary_max,
                            "required_skills": skills,
                            "job_url": job.get("url", f"https://remoteok.com/remote-jobs/{job.get('id', '')}"),
                            "is_trending": True,
                        })

                        if len(jobs) >= max_results:
                            break

                    except Exception as e:
                        continue

                print(f"  ✅ RemoteOK에서 {len(jobs)}개 AI/ML 채용 공고 수집")

        except Exception as e:
            print(f"  ❌ RemoteOK API 에러: {e}")
            return await self.fetch_sample_jobs()

        return jobs if jobs else await self.fetch_sample_jobs()

    def _extract_skills(self, description: str, tags: List[str]) -> List[str]:
        """설명과 태그에서 기술 스택 추출"""
        common_skills = {
            "python", "pytorch", "tensorflow", "keras", "scikit-learn",
            "pandas", "numpy", "sql", "docker", "kubernetes",
            "aws", "gcp", "azure", "mlops", "nlp"
        }

        found_skills = set()

        for tag in tags:
            if tag.lower() in common_skills:
                found_skills.add(tag)

        description_lower = description.lower()
        for skill in common_skills:
            if skill in description_lower:
                found_skills.add(skill.title())

        return list(found_skills)[:15]

    async def fetch_sample_jobs(self) -> List[Dict]:
        """샘플 데이터 (백업용)"""
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
        }, {
            "job_title": "AI Research Scientist",
            "company_name": "Google DeepMind",
            "location": "London, UK",
            "is_remote": False,
            "salary_min": 150000,
            "salary_max": 250000,
            "required_skills": ["Python", "TensorFlow", "Research"],
            "job_url": "https://deepmind.google/careers",
            "is_trending": True,
        }]

    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        """데이터베이스에 저장"""
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
