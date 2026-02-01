"""AI 요약 서비스 (Gemini API 사용)"""
import json
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

        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            print("⚠️  Gemini API 키가 없습니다. 요약 기능이 비활성화됩니다.")
            self.model = None

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
        if not self.model:
            return {
                "summary": None,
                "key_features": [],
                "use_cases": None,
            }

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

        try:
            # Gemini API 호출
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # JSON 파싱
            # 마크다운 코드 블록 제거
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            return {
                "summary": result.get("summary"),
                "key_features": result.get("key_features", []),
                "use_cases": result.get("use_cases"),
            }

        except Exception as e:
            print(f"❌ AI 요약 생성 실패: {e}")
            return {
                "summary": None,
                "key_features": [],
                "use_cases": None,
            }

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
        if not self.model:
            return {
                "summary": None,
                "keywords": [],
                "key_points": [],
            }

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

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # 마크다운 제거
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            return {
                "summary": result.get("summary"),
                "keywords": result.get("keywords", []),
                "key_points": result.get("key_points", []),
            }

        except Exception as e:
            print(f"❌ AI 요약 생성 실패: {e}")
            return {
                "summary": None,
                "keywords": [],
                "key_points": [],
            }

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
        if not self.model:
            return {
                "summary": None,
                "keywords": [],
                "key_contributions": [],
            }

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

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # 마크다운 제거
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            return {
                "summary": result.get("summary"),
                "keywords": result.get("keywords", []),
                "key_contributions": result.get("key_contributions", []),
            }

        except Exception as e:
            print(f"❌ AI 요약 생성 실패: {e}")
            return {
                "summary": None,
                "keywords": [],
                "key_contributions": [],
            }

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
        if not self.model:
            return {
                "summary": None,
                "keywords": [],
                "key_points": [],
            }

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

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # 마크다운 제거
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            return {
                "summary": result.get("summary"),
                "keywords": result.get("keywords", []),
                "key_points": result.get("key_points", []),
            }

        except Exception as e:
            print(f"❌ AI 요약 생성 실패: {e}")
            return {
                "summary": None,
                "keywords": [],
                "key_points": [],
            }

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
        if not self.model:
            return {
                "summary": None,
                "keywords": [],
                "use_cases": [],
            }

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

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # 마크다운 제거
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            return {
                "summary": result.get("summary"),
                "keywords": result.get("keywords", []),
                "use_cases": result.get("use_cases", []),
            }

        except Exception as e:
            print(f"❌ AI 요약 생성 실패: {e}")
            return {
                "summary": None,
                "keywords": [],
                "use_cases": [],
            }
