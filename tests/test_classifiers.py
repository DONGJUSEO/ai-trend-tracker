"""분류기 단위 테스트.

F-1 #4: News 토픽 분류, Job 카테고리 분류, Paper 토픽 분류.
"""


class TestNewsTopicClassifier:
    """News 카테고리 자동분류 테스트."""

    def test_policy_classification(self):
        from app.services.news_service import NewsService

        result = NewsService.classify_news_topic(
            "EU AI Act 최종안 통과, 규제 강화",
            "유럽연합이 AI 기본법을 통과시켰다. 새 법안은 고위험 AI에 대한 가이드라인을 포함한다."
        )
        assert result == "정책"

    def test_company_classification(self):
        from app.services.news_service import NewsService

        result = NewsService.classify_news_topic(
            "OpenAI, 시리즈B 투자 유치",
            "OpenAI가 67억 달러 투자를 유치했다. 기업가치는 1570억 달러로 평가된다."
        )
        assert result == "기업동향"

    def test_tech_classification(self):
        from app.services.news_service import NewsService

        result = NewsService.classify_news_topic(
            "새로운 Transformer 아키텍처 논문 발표",
            "연구팀이 기존 벤치마크를 뛰어넘는 새 알고리즘을 제안했다."
        )
        assert result == "기술발전"

    def test_product_classification(self):
        from app.services.news_service import NewsService

        result = NewsService.classify_news_topic(
            "GPT-5 출시, 새로운 모델 공개",
            "OpenAI가 GPT-5를 출시했다. 새 버전은 멀티모달 기능이 강화되었다."
        )
        assert result == "제품출시"

    def test_default_classification(self):
        from app.services.news_service import NewsService

        result = NewsService.classify_news_topic("AI", "")
        assert result == "AI 일반"


class TestJobCategoryClassifier:
    """Job 카테고리 분류 테스트."""

    def test_llm_role(self):
        from app.services.job_trend_service import JobTrendService

        svc = JobTrendService()
        result = svc.classify_role_category(
            "NLP Engineer", "Work on language model fine-tuning", ["python", "llm"]
        )
        assert result == "llm"

    def test_prompt_engineer_role(self):
        from app.services.job_trend_service import JobTrendService

        svc = JobTrendService()
        result = svc.classify_role_category(
            "Prompt Engineer", "Design and optimize prompts", ["prompt design"]
        )
        assert result == "prompt_engineer"

    def test_default_ai_sw(self):
        from app.services.job_trend_service import JobTrendService

        svc = JobTrendService()
        result = svc.classify_role_category(
            "Software Engineer", "General engineering work", ["python"]
        )
        assert result == "ai_sw"


class TestPaperTopicClassifier:
    """Paper 토픽 분류 테스트."""

    def test_llm_topic(self):
        from app.services.arxiv_service import ArxivService

        svc = ArxivService()
        result = svc.classify_topic(
            "Large Language Model Scaling Laws",
            ["cs.CL"],
        )
        assert result == "LLM"

    def test_cv_topic(self):
        from app.services.arxiv_service import ArxivService

        svc = ArxivService()
        result = svc.classify_topic(
            "Image Segmentation with Vision Transformers",
            ["cs.CV"],
        )
        assert result == "CV"
