"""External AI trending keyword aggregation service."""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
import re
import asyncio

import httpx

from app.cache import cache_get, cache_set


class ExternalTrendingKeywordService:
    """Aggregate AI trend keywords from external public sources."""

    CACHE_TTL_SECONDS = 6 * 60 * 60
    HF_URL = "https://huggingface.co/api/models"
    HN_URL = "https://hn.algolia.com/api/v1/search"
    PWC_URL = "https://paperswithcode.com/api/v1/papers/"

    AI_KEYWORDS = [
        "LLM",
        "GPT",
        "Claude",
        "Gemini",
        "Llama",
        "Mistral",
        "Qwen",
        "RAG",
        "Agent",
        "Agentic",
        "Multimodal",
        "Transformer",
        "Diffusion",
        "LoRA",
        "Fine-tuning",
        "RLHF",
        "DPO",
        "Vision",
        "NLP",
        "Speech",
        "TTS",
        "STT",
        "Embedding",
        "Vector DB",
        "LangChain",
        "LlamaIndex",
        "AutoGen",
        "CrewAI",
        "Tokenizer",
        "Quantization",
        "GGUF",
        "GPTQ",
        "AWQ",
        "Reasoning",
        "MoE",
        "Code Generation",
        "AI Safety",
        "Alignment",
        "Hallucination",
        "Benchmark",
        "MMLU",
        "HumanEval",
        "Open Source",
        "Frontier Model",
        "Robotics",
        "Humanoid",
        "Embodied AI",
        "World Model",
        "Inference",
        "Serving",
        "vLLM",
        "TensorRT",
        "ONNX",
        "MLOps",
        "Feature Store",
        "Model Registry",
        "Stable Diffusion",
        "FLUX",
        "DALL-E",
        "Sora",
        "Runway",
        "Whisper",
        "Suno",
        "ElevenLabs",
        "OpenAI",
        "Anthropic",
        "Google",
        "Meta",
        "Microsoft",
        "NVIDIA",
        "Deep Learning",
        "Reinforcement Learning",
        "Computer Vision",
        "Natural Language Processing",
        "Generative AI",
        "Foundation Model",
        "AI Act",
        "AI Regulation",
        "On-premise",
        "Edge AI",
    ]

    def __init__(self) -> None:
        self._keyword_map = {kw.lower(): kw for kw in self.AI_KEYWORDS}
        self._normalized_terms = sorted(
            self._keyword_map.keys(), key=len, reverse=True
        )

    async def get_keywords(self, limit: int = 50, force_refresh: bool = False) -> Dict[str, Any]:
        """Return merged keywords with weights and source metadata."""
        cache_key = f"dashboard:external_trending_keywords:{limit}"
        if not force_refresh:
            cached = await cache_get(cache_key)
            if cached is not None:
                return cached

        source_payloads = await self._collect_sources()
        counter: Counter[str] = Counter()
        sources_map: Dict[str, Set[str]] = defaultdict(set)

        for source_name, raw_keywords in source_payloads.items():
            for keyword in raw_keywords:
                canonical = self._canonicalize_keyword(keyword)
                if not canonical:
                    continue
                counter[canonical] += 1
                sources_map[canonical].add(source_name)

        if not counter:
            payload = {
                "keywords": [],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            await cache_set(cache_key, payload, ttl=self.CACHE_TTL_SECONDS)
            return payload

        max_count = max(counter.values())
        keywords = []
        for keyword, count in counter.most_common(limit):
            keywords.append(
                {
                    "keyword": keyword,
                    "count": count,
                    "weight": round(count / max_count, 3),
                    "sources": sorted(list(sources_map[keyword])),
                }
            )

        payload = {
            "keywords": keywords,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await cache_set(cache_key, payload, ttl=self.CACHE_TTL_SECONDS)
        return payload

    async def _collect_sources(self) -> Dict[str, List[str]]:
        async with httpx.AsyncClient(timeout=25.0) as client:
            hf_task = self._fetch_huggingface(client)
            hn_task = self._fetch_hackernews(client)
            pwc_task = self._fetch_paperswithcode(client)
            hf_keywords, hn_keywords, pwc_keywords = await asyncio.gather(
                hf_task, hn_task, pwc_task, return_exceptions=False
            )
            return {
                "huggingface": hf_keywords,
                "hackernews": hn_keywords,
                "paperswithcode": pwc_keywords,
            }

    async def _fetch_huggingface(self, client: httpx.AsyncClient) -> List[str]:
        keywords: List[str] = []
        try:
            response = await client.get(
                self.HF_URL,
                params={
                    "sort": "trendingScore",
                    "direction": -1,
                    "limit": 30,
                },
            )
            response.raise_for_status()
            items = response.json() if isinstance(response.json(), list) else []
            for item in items:
                pipeline_tag = item.get("pipeline_tag")
                if pipeline_tag:
                    keywords.extend(self._extract_keywords_from_text(str(pipeline_tag)))
                tags = item.get("tags", [])
                if isinstance(tags, list):
                    for tag in tags:
                        keywords.extend(self._extract_keywords_from_text(str(tag)))
        except Exception as e:
            print(f"⚠️ HF 키워드 수집 실패: {e}")
        return keywords

    async def _fetch_hackernews(self, client: httpx.AsyncClient) -> List[str]:
        keywords: List[str] = []
        try:
            response = await client.get(
                self.HN_URL,
                params={
                    "query": "AI OR LLM OR GPT",
                    "tags": "story",
                    "numericFilters": "points>30",
                    "hitsPerPage": 30,
                },
            )
            response.raise_for_status()
            data = response.json()
            hits = data.get("hits", []) if isinstance(data, dict) else []
            for hit in hits:
                title = hit.get("title", "")
                story_text = hit.get("story_text", "")
                text = f"{title} {story_text}"
                keywords.extend(self._extract_keywords_from_text(text))
        except Exception as e:
            print(f"⚠️ Hacker News 키워드 수집 실패: {e}")
        return keywords

    async def _fetch_paperswithcode(self, client: httpx.AsyncClient) -> List[str]:
        keywords: List[str] = []
        try:
            response = await client.get(
                self.PWC_URL,
                params={"ordering": "-date", "items_per_page": 20},
            )
            response.raise_for_status()
            data = response.json()
            items: List[Dict[str, Any]]
            if isinstance(data, dict):
                if isinstance(data.get("results"), list):
                    items = data["results"]
                elif isinstance(data.get("data"), list):
                    items = data["data"]
                else:
                    items = []
            else:
                items = []

            for item in items:
                title = item.get("title", "")
                abstract = item.get("abstract", "")
                text = f"{title} {abstract}"
                keywords.extend(self._extract_keywords_from_text(text))
        except Exception as e:
            print(f"⚠️ Papers With Code 키워드 수집 실패: {e}")
        return keywords

    def _extract_keywords_from_text(self, text: str) -> List[str]:
        if not text:
            return []
        lowered = text.lower()
        found: List[str] = []
        for term in self._normalized_terms:
            if " " in term or "-" in term:
                if term in lowered:
                    found.append(self._keyword_map[term])
                continue
            if re.search(rf"\b{re.escape(term)}\b", lowered):
                found.append(self._keyword_map[term])
        return found

    def _canonicalize_keyword(self, keyword: str) -> Optional[str]:
        if not keyword:
            return None
        normalized = keyword.strip().lower()
        if not normalized:
            return None

        if normalized in self._keyword_map:
            return self._keyword_map[normalized]

        compact = normalized.replace("_", " ").replace("-", " ")
        compact = re.sub(r"\s+", " ", compact).strip()
        if compact in self._keyword_map:
            return self._keyword_map[compact]

        # 약한 매칭: 후보 키워드가 문자열에 포함되면 canonical 사용
        for key in self._normalized_terms:
            if key in normalized or normalized in key:
                return self._keyword_map[key]
        return None
