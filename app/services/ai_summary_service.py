"""AI 요약 서비스 (Gemini API 사용)"""
import json
import os
import re
from typing import Dict, Any, Optional

import google.generativeai as genai

from app.config import get_settings

settings = get_settings()


class AISummaryService:
    """AI 요약 서비스 (Google Gemini)"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: Gemini API 키 (없으면 settings에서 가져옴)
        """
        self.api_key = api_key or getattr(settings, "gemini_api_key", "")
        self.model_name = os.getenv(
            "GEMINI_MODEL",
            getattr(settings, "gemini_model", "gemini-2.0-flash"),
        )

        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            print("⚠️  Gemini API 키가 없습니다. 요약 기능이 비활성화됩니다.")
            self.model = None

    @staticmethod
    def _clean_json_text(text: str) -> str:
        """Gemini 응답에서 JSON 파싱 가능한 문자열만 추출."""
        if not text:
            return ""

        stripped = text.strip()
        if stripped.startswith("```json"):
            stripped = stripped[7:]
        elif stripped.startswith("```"):
            stripped = stripped[3:]
        if stripped.endswith("```"):
            stripped = stripped[:-3]
        stripped = stripped.strip()

        # 코드블록 외 텍스트가 섞일 수 있어 JSON object 구간만 추출
        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        return match.group(0) if match else stripped

    async def _generate_json_summary(
        self,
        prompt: str,
        default: Dict[str, Any],
        list_fields: Optional[list] = None,
    ) -> Dict[str, Any]:
        """프롬프트 기반 공통 요약 호출 + JSON 파싱."""
        if not self.model:
            return default

        list_fields = list_fields or []
        try:
            response = self.model.generate_content(prompt)
            result_text = self._clean_json_text(getattr(response, "text", "") or "")
            parsed = json.loads(result_text)

            normalized = {}
            for key, value in default.items():
                raw_value = parsed.get(key, value)
                if key in list_fields:
                    normalized[key] = raw_value if isinstance(raw_value, list) else value
                else:
                    normalized[key] = raw_value
            return normalized
        except Exception as e:
            print(f"❌ AI 요약 생성 실패: {e}")
            return default

    async def summarize_huggingface_model(
        self,
        model_name: str,
        description: Optional[str],
        task: Optional[str],
        tags: list,
    ) -> Dict[str, Any]:
        """
        Hugging Face 모델 정보를 한글로 요약

        Args:
            model_name: 모델 이름
            description: 모델 설명
            task: 태스크 유형
            tags: 태그 리스트

        Returns:
            {
                "summary": "한글 요약",
                "key_features": ["특징1", "특징2", ...],
                "use_cases": "사용 사례"
            }
        """
        default = {"summary": None, "key_features": [], "use_cases": None}
        if not self.model:
            return default

        # 프롬프트 구성
        prompt = f"""
다음은 Hugging Face에서 가져온 AI 모델 정보입니다.
이 정보를 바탕으로 한국어 사용자를 위한 요약을 작성해주세요.

**모델 이름**: {model_name}
**태스크**: {task or "알 수 없음"}
**태그**: {", ".join(tags) if tags else "없음"}
**설명**: {description or "설명 없음"}

아래 형식으로 JSON 응답을 작성해주세요:
{{
    "summary": "모델에 대한 간단한 한글 요약 (2-3문장)",
    "key_features": ["주요 특징 1", "주요 특징 2", "주요 특징 3"],
    "use_cases": "이 모델의 주요 사용 사례 (1-2문장)"
}}

주의사항:
- summary는 기술적이지 않게, 일반인도 이해할 수 있도록 작성
- key_features는 최대 5개까지
- use_cases는 구체적인 예시 포함
- 모든 내용은 한글로 작성
- JSON 형식만 출력 (다른 텍스트 없이)
"""

        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["key_features"],
        )

    async def summarize_youtube_video(
        self,
        title: str,
        description: Optional[str],
        tags: list,
    ) -> Dict[str, Any]:
        """
        YouTube 영상 정보를 한글로 요약

        Args:
            title: 영상 제목
            description: 영상 설명
            tags: 태그 리스트

        Returns:
            {
                "summary": "한글 요약",
                "keywords": ["키워드1", "키워드2", ...],
                "key_points": ["핵심 포인트1", "핵심 포인트2", ...]
            }
        """
        default = {"summary": None, "keywords": [], "key_points": []}
        if not self.model:
            return default

        prompt = f"""
다음은 AI 관련 YouTube 영상 정보입니다.
이 정보를 바탕으로 한국어 사용자를 위한 요약을 작성해주세요.

**제목**: {title}
**태그**: {", ".join(tags) if tags else "없음"}
**설명**: {description or "설명 없음"}

아래 형식으로 JSON 응답을 작성해주세요:
{{
    "summary": "영상 내용 한글 요약 (2-3문장)",
    "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
    "key_points": ["핵심 내용 1", "핵심 내용 2", "핵심 내용 3"]
}}

주의사항:
- summary는 영상의 주제와 핵심 메시지 위주로
- keywords는 AI/기술 용어 중심으로 최대 5개
- key_points는 영상에서 다루는 핵심 포인트, 최대 5개
- 모든 내용은 한글로 작성
- JSON 형식만 출력
"""

        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "key_points"],
        )

    async def summarize_paper(
        self,
        title: str,
        abstract: Optional[str],
        authors: list,
        categories: list,
    ) -> Dict[str, Any]:
        """
        AI 논문 정보를 한글로 요약

        Args:
            title: 논문 제목
            abstract: 논문 초록
            authors: 저자 리스트
            categories: 카테고리 리스트

        Returns:
            {
                "summary": "한글 요약",
                "keywords": [\"키워드1\", \"키워드2\", ...],
                "key_contributions": [\"주요 기여1\", \"주요 기여2\", ...]
            }
        """
        default = {"summary": None, "keywords": [], "key_contributions": []}
        if not self.model:
            return default

        prompt = f"""
다음은 arXiv에 게시된 AI 관련 논문 정보입니다.
이 정보를 바탕으로 한국어 사용자를 위한 요약을 작성해주세요.

**제목**: {title}
**저자**: {", ".join(authors) if authors else "알 수 없음"}
**카테고리**: {", ".join(categories) if categories else "없음"}
**초록**: {abstract or "초록 없음"}

아래 형식으로 JSON 응답을 작성해주세요:
{{
    "summary": "논문 내용 한글 요약 (2-3문장, 일반인도 이해할 수 있게)",
    "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
    "key_contributions": ["주요 기여 1", "주요 기여 2", "주요 기여 3"]
}}

주의사항:
- summary는 논문의 핵심 아이디어와 방법론 위주로
- keywords는 AI/기술 용어 중심으로 최대 5개
- key_contributions는 이 논문의 주요 기여점, 최대 5개
- 모든 내용은 한글로 작성
- JSON 형식만 출력
"""

        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "key_contributions"],
        )

    async def summarize_news(
        self,
        title: str,
        content: Optional[str],
        source: Optional[str],
    ) -> Dict[str, Any]:
        """
        AI 뉴스/블로그 포스트를 한글로 요약

        Args:
            title: 뉴스 제목
            content: 뉴스 본문 또는 발췌문
            source: 출처

        Returns:
            {
                "summary": "한글 요약",
                "keywords": [\"키워드1\", \"키워드2\", ...],
                "key_points": [\"핵심 내용1\", \"핵심 내용2\", ...]
            }
        """
        default = {"summary": None, "keywords": [], "key_points": []}
        if not self.model:
            return default

        prompt = f"""
다음은 AI 관련 뉴스 또는 블로그 포스트입니다.
이 정보를 바탕으로 한국어 사용자를 위한 요약을 작성해주세요.

**제목**: {title}
**출처**: {source or "알 수 없음"}
**내용**: {content or "내용 없음"}

아래 형식으로 JSON 응답을 작성해주세요:
{{
    "summary": "뉴스 내용 한글 요약 (2-3문장)",
    "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
    "key_points": ["핵심 내용 1", "핵심 내용 2", "핵심 내용 3"]
}}

주의사항:
- summary는 뉴스의 핵심 내용과 의미 위주로
- keywords는 AI/기술 용어 및 주요 인물/회사 이름 중심으로 최대 5개
- key_points는 뉴스의 핵심 요점, 최대 5개
- 모든 내용은 한글로 작성
- JSON 형식만 출력
"""

        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "key_points"],
        )

    async def summarize_github_project(
        self,
        repo_name: str,
        description: Optional[str],
        language: Optional[str],
        topics: list,
    ) -> Dict[str, Any]:
        """
        GitHub 프로젝트를 한글로 요약

        Args:
            repo_name: 레포지토리 이름
            description: 프로젝트 설명
            language: 주 프로그래밍 언어
            topics: 토픽 태그

        Returns:
            {
                "summary": "한글 요약",
                "keywords": ["키워드1", "키워드2", ...],
                "use_cases": ["사용 사례1", "사용 사례2", ...]
            }
        """
        default = {"summary": None, "keywords": [], "use_cases": []}
        if not self.model:
            return default

        prompt = f"""
다음은 GitHub의 AI/ML 관련 오픈소스 프로젝트입니다.
이 정보를 바탕으로 한국어 사용자를 위한 요약을 작성해주세요.

**프로젝트**: {repo_name}
**언어**: {language or "알 수 없음"}
**토픽**: {", ".join(topics) if topics else "없음"}
**설명**: {description or "설명 없음"}

아래 형식으로 JSON 응답을 작성해주세요:
{{
    "summary": "프로젝트 한글 요약 (2-3문장, 일반인도 이해할 수 있게)",
    "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
    "use_cases": ["사용 사례 1", "사용 사례 2", "사용 사례 3"]
}}

주의사항:
- summary는 프로젝트의 목적과 핵심 기능 위주로
- keywords는 AI/기술 용어 중심으로 최대 5개
- use_cases는 이 프로젝트의 실제 활용 사례, 최대 5개
- 모든 내용은 한글로 작성
- JSON 형식만 출력
"""

        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "use_cases"],
        )

    async def summarize_policy(
        self,
        title: str,
        description: Optional[str],
        policy_type: Optional[str],
        impact_areas: list,
    ) -> Dict[str, Any]:
        """AI 정책 정보를 한글로 요약."""
        default = {"summary": None, "keywords": [], "key_points": []}
        if not self.model:
            return default

        prompt = f"""
다음은 AI 정책/규제 정보입니다.
한국어 사용자에게 이해하기 쉽게 요약해주세요.

**제목**: {title}
**정책 유형**: {policy_type or "알 수 없음"}
**영향 영역**: {", ".join(impact_areas) if impact_areas else "없음"}
**설명**: {description or "설명 없음"}

아래 JSON 형식으로만 응답하세요:
{{
  "summary": "정책 핵심 요약 (2-3문장)",
  "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
  "key_points": ["핵심 포인트1", "핵심 포인트2", "핵심 포인트3"]
}}
"""
        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "key_points"],
        )

    async def summarize_conference(
        self,
        name: str,
        description: Optional[str],
        topics: list,
    ) -> Dict[str, Any]:
        """AI 컨퍼런스 정보를 한글로 요약."""
        default = {"summary": None, "keywords": [], "highlights": []}
        if not self.model:
            return default

        prompt = f"""
다음은 AI 컨퍼런스 정보입니다.
한국어 사용자용으로 핵심 내용을 요약해주세요.

**행사명**: {name}
**주요 주제**: {", ".join(topics) if topics else "없음"}
**설명**: {description or "설명 없음"}

아래 JSON 형식으로만 응답하세요:
{{
  "summary": "행사 핵심 요약 (2-3문장)",
  "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
  "highlights": ["하이라이트1", "하이라이트2", "하이라이트3"]
}}
"""
        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "highlights"],
        )

    async def summarize_ai_tool(
        self,
        name: str,
        description: Optional[str],
        category: Optional[str],
        use_cases: list,
    ) -> Dict[str, Any]:
        """AI 도구/플랫폼 정보를 한글로 요약."""
        default = {"summary": None, "keywords": [], "best_for": []}
        if not self.model:
            return default

        prompt = f"""
다음은 AI 도구/플랫폼 정보입니다.
한국어 사용자에게 핵심만 명확히 전달되도록 요약해주세요.

**도구명**: {name}
**카테고리**: {category or "알 수 없음"}
**주요 사용 사례**: {", ".join(use_cases) if use_cases else "없음"}
**설명**: {description or "설명 없음"}

아래 JSON 형식으로만 응답하세요:
{{
  "summary": "도구 핵심 요약 (2-3문장)",
  "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
  "best_for": ["추천 사용처1", "추천 사용처2", "추천 사용처3"]
}}
"""
        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "best_for"],
        )

    async def summarize_job(
        self,
        title: str,
        company: Optional[str],
        description: Optional[str],
        skills: list,
    ) -> Dict[str, Any]:
        """AI 채용 공고를 한글로 요약."""
        default = {"summary": None, "keywords": [], "key_points": []}
        if not self.model:
            return default

        prompt = f"""
다음은 AI 관련 채용 공고 정보입니다.
지원자가 빠르게 이해할 수 있도록 한국어로 요약해주세요.

**직무명**: {title}
**회사명**: {company or "알 수 없음"}
**요구 스킬**: {", ".join(skills) if skills else "없음"}
**설명**: {description or "설명 없음"}

아래 JSON 형식으로만 응답하세요:
{{
  "summary": "채용 공고 핵심 요약 (2-3문장)",
  "keywords": ["핵심 키워드1", "핵심 키워드2", "핵심 키워드3"],
  "key_points": ["핵심 요구사항1", "핵심 요구사항2", "핵심 요구사항3"]
}}
"""
        return await self._generate_json_summary(
            prompt=prompt,
            default=default,
            list_fields=["keywords", "key_points"],
        )
