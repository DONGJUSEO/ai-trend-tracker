from app.services.keyword_extraction_service import KeywordExtractionService


def test_extract_keywords_fallback_basic_terms():
    service = KeywordExtractionService()
    keywords = service.extract_keywords(
        "RAG 기반 LLM 에이전트 구축 with LangChain and Vector DB",
        top_k=8,
    )

    assert isinstance(keywords, list)
    assert keywords
    normalized = " ".join(keyword.lower() for keyword in keywords)
    assert ("rag" in normalized) or ("llm" in normalized)


def test_extract_trending_keywords_counts():
    service = KeywordExtractionService()
    ranked = service.extract_trending_keywords(
        [
            "AI Agent orchestration with LangGraph",
            "RAG pipeline using Vector DB and retriever",
            "LLM fine-tuning with LoRA",
        ],
        top_k=5,
        per_text_limit=5,
    )

    assert isinstance(ranked, list)
    assert ranked
    keyword, count = ranked[0]
    assert isinstance(keyword, str)
    assert isinstance(count, int)
    assert count >= 1

