"""AI 채용 트렌드 데이터 수집 서비스"""
from collections import Counter
from datetime import datetime
from typing import List, Dict, Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job_trend import AIJobTrend


class JobTrendService:
    """AI 채용 트렌드 서비스"""

    JOB_CATEGORIES: Dict[str, str] = {
        "backend": "백엔드 개발자",
        "frontend": "프론트엔드 개발자",
        "ai_sw": "AI SW 개발자",
        "data_scientist": "데이터 사이언티스트",
        "vision": "비전 전문가",
        "llm": "LLM 모델 전문가",
        "robotics": "로봇공학/휴머노이드 AI",
        "on_premise": "온프레미스 AI 모델 구축",
        "mlops": "MLOps 엔지니어",
        "research": "AI 리서처",
    }

    CATEGORY_KEYWORDS: Dict[str, List[str]] = {
        "backend": ["backend", "서버", "api", "fastapi", "django", "spring"],
        "frontend": ["frontend", "프론트엔드", "react", "vue", "next.js"],
        "ai_sw": ["ai engineer", "ai 개발", "ml engineer", "machine learning engineer"],
        "data_scientist": ["data scientist", "데이터 분석", "analytics", "statistical"],
        "vision": ["computer vision", "비전", "영상", "image", "detection", "segmentation"],
        "llm": ["llm", "nlp", "자연어", "language model", "gpt", "fine-tuning", "rlhf"],
        "robotics": ["robotics", "로봇", "humanoid", "휴머노이드", "ros", "embodied"],
        "on_premise": ["on-premise", "온프레미스", "edge", "배포", "inference", "serving"],
        "mlops": ["mlops", "devops", "kubernetes", "docker", "ci/cd", "파이프라인"],
        "research": ["research", "연구", "phd", "paper", "논문"],
    }

    AI_KEYWORDS = [
        "ai",
        "ml",
        "machine learning",
        "deep learning",
        "data scientist",
        "nlp",
        "computer vision",
        "pytorch",
        "tensorflow",
        "llm",
        "gpt",
    ]

    COMMON_SKILLS = {
        "python",
        "pytorch",
        "tensorflow",
        "keras",
        "scikit-learn",
        "pandas",
        "numpy",
        "sql",
        "docker",
        "kubernetes",
        "aws",
        "gcp",
        "azure",
        "mlops",
        "nlp",
        "langchain",
        "llamaindex",
        "fastapi",
        "spark",
    }

    def __init__(self):
        self.remoteok_api_url = "https://remoteok.com/api"

    @staticmethod
    def _normalize_skill(skill: str) -> str:
        raw = (skill or "").strip()
        if not raw:
            return ""
        mapping = {
            "mlops": "MLOps",
            "llm": "LLM",
            "nlp": "NLP",
            "sql": "SQL",
            "aws": "AWS",
            "gcp": "GCP",
        }
        lower = raw.lower()
        if lower in mapping:
            return mapping[lower]
        if len(raw) <= 3:
            return raw.upper()
        return raw.title()

    def classify_role_category(
        self,
        title: str,
        description: str,
        skills: List[str],
    ) -> str:
        text = " ".join([title or "", description or "", " ".join(skills or [])]).lower()
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                return category
        return "ai_sw"

    def _extract_skills(self, description: str, tags: List[str]) -> List[str]:
        """설명과 태그에서 기술 스택 추출."""
        found = set()
        for tag in tags or []:
            tag_lower = str(tag).lower().strip()
            if tag_lower in self.COMMON_SKILLS:
                found.add(self._normalize_skill(tag_lower))

        lowered = (description or "").lower()
        for skill in self.COMMON_SKILLS:
            if skill in lowered:
                found.add(self._normalize_skill(skill))
        return sorted(list(found))[:15]

    async def fetch_remoteok_jobs(self, max_results: int = 100) -> List[Dict[str, Any]]:
        """RemoteOK API에서 AI/ML 채용 공고 수집."""
        jobs: List[Dict[str, Any]] = []
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {"User-Agent": "Mozilla/5.0 (compatible; AITrendTracker/1.0)"}
                response = await client.get(self.remoteok_api_url, headers=headers)
                response.raise_for_status()

                data = response.json()
                job_listings = data[1:] if isinstance(data, list) and len(data) > 1 else []

                for job in job_listings:
                    position = (job.get("position", "") or "").lower()
                    description = (job.get("description", "") or "").lower()
                    tags = [str(tag).lower() for tag in (job.get("tags") or [])]

                    is_ai_related = any(
                        keyword in position or keyword in description or keyword in tags
                        for keyword in self.AI_KEYWORDS
                    )
                    if not is_ai_related:
                        continue

                    salary_min = int(job.get("salary_min")) if job.get("salary_min") else None
                    salary_max = int(job.get("salary_max")) if job.get("salary_max") else None
                    skills = self._extract_skills(description, job.get("tags", []))
                    role_category = self.classify_role_category(
                        title=job.get("position", ""),
                        description=job.get("description", ""),
                        skills=skills,
                    )

                    jobs.append(
                        {
                            "job_title": job.get("position", "Unknown"),
                            "company_name": job.get("company", "미공개"),
                            "description": (job.get("description", "") or "")[:1200],
                            "location": job.get("location", "Remote"),
                            "is_remote": True,
                            "salary_min": salary_min,
                            "salary_max": salary_max,
                            "required_skills": skills,
                            "job_url": job.get(
                                "url",
                                f"https://remoteok.com/remote-jobs/{job.get('id', '')}",
                            ),
                            "is_trending": True,
                            "role_category": role_category,
                            "posted_date": datetime.utcnow(),
                        }
                    )

                    if len(jobs) >= max_results:
                        break

            print(f"  ✅ RemoteOK에서 {len(jobs)}개 AI/ML 채용 공고 수집")
        except Exception as e:
            print(f"  ❌ RemoteOK API 에러: {e}")
            return await self.fetch_sample_jobs()

        return jobs if jobs else await self.fetch_sample_jobs()

    async def fetch_sample_jobs(self) -> List[Dict]:
        """샘플 데이터 (백업용)."""
        return [
            {
                "job_title": "Senior ML Engineer",
                "company_name": "OpenAI",
                "location": "San Francisco, CA",
                "is_remote": True,
                "salary_min": 200000,
                "salary_max": 300000,
                "required_skills": ["Python", "PyTorch", "Transformers"],
                "job_url": "https://openai.com/careers/ml-engineer",
                "is_trending": True,
                "role_category": "ai_sw",
            },
            {
                "job_title": "AI Research Scientist",
                "company_name": "Google DeepMind",
                "location": "London, UK",
                "is_remote": False,
                "salary_min": 150000,
                "salary_max": 250000,
                "required_skills": ["Python", "TensorFlow", "Research"],
                "job_url": "https://deepmind.google/careers",
                "is_trending": True,
                "role_category": "research",
            },
        ]

    async def get_trending_skills(self, db: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
        """DB 기준 트렌딩 스킬 빈도 집계."""
        result = await db.execute(
            select(AIJobTrend.required_skills).where(AIJobTrend.required_skills.isnot(None))
        )
        counter: Counter[str] = Counter()
        for row in result.scalars().all():
            if not isinstance(row, list):
                continue
            for skill in row:
                normalized = self._normalize_skill(str(skill))
                if normalized:
                    counter[normalized] += 1
        return [
            {"skill": skill, "count": count}
            for skill, count in counter.most_common(limit)
        ]

    async def save_to_db(self, items: List[Dict], db: AsyncSession) -> int:
        """데이터베이스에 저장."""
        saved = 0
        for item in items:
            url = item.get("job_url")
            if not url:
                continue

            role_category = item.get("role_category") or self.classify_role_category(
                title=item.get("job_title", ""),
                description=item.get("description", ""),
                skills=item.get("required_skills", []) or [],
            )
            payload = dict(item)
            payload.pop("role_category", None)  # DB 컬럼 미존재 환경 호환
            payload["company_name"] = payload.get("company_name") or "미공개"

            result = await db.execute(
                select(AIJobTrend).where(AIJobTrend.job_url == url)
            )
            existing = result.scalar_one_or_none()
            if existing:
                for key, value in payload.items():
                    if hasattr(existing, key) and value is not None:
                        setattr(existing, key, value)

                keywords = set(existing.keywords or [])
                keywords.add(self.JOB_CATEGORIES.get(role_category, role_category))
                existing.keywords = list(keywords)[:20]
                continue

            payload_keywords = payload.get("keywords") or []
            payload_keywords.append(self.JOB_CATEGORIES.get(role_category, role_category))
            payload["keywords"] = list(dict.fromkeys(payload_keywords))[:20]

            db.add(AIJobTrend(**payload))
            saved += 1

        await db.commit()
        return saved
