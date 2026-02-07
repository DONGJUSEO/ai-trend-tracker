"""AI Tool 데이터 수집 서비스

# TODO (Phase 2): AI Tools -> AI Platforms 리네이밍 예정
# - 이 파일: ai_tool_service.py -> ai_platform_service.py
# - 클래스명: AIToolService -> AIPlatformService
# - 모델: AITool -> AIPlatform (DB 마이그레이션 필요)
# - API 경로: /api/v1/tools -> /api/v1/platforms
# - 기존 import를 유지하면서 단계적으로 전환할 것
"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.ai_tool import AITool
from app.config import get_settings


class AIToolService:
    """AI Tool 데이터 수집 및 관리

    TODO (Phase 2): AIPlatformService로 리네이밍 예정
    - AI Tool -> AI Platform 으로 개념 확장
    - 기존 API 호환성 유지하면서 전환
    """

    # AI Platform categories (updated from Gemini deep research 2026-02)
    TOOL_CATEGORIES = [
        "LLM/Chatbot",
        "Image/Video",
        "Audio/Music",
        "Code",
        "Productivity",
        "Data Analysis",
        "Text/Writing",
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(get_settings(), "product_hunt_api_key", "")

    async def fetch_trending_tools(self, max_results: int = 30) -> List[Dict[str, Any]]:
        """
        트렌딩 AI 도구 수집 (간단한 하드코딩된 목록으로 시작)

        실제 구현에서는 Product Hunt API 또는 웹 스크래핑 사용

        Args:
            max_results: 최대 결과 수

        Returns:
            AI 도구 정보 리스트
        """
        # Comprehensive AI platform data from Gemini deep research (2026-02)
        sample_tools = [
            # ── LLM/Chatbot ──────────────────────────────────
            {
                "tool_name": "ChatGPT",
                "tagline": "Conversational AI assistant by OpenAI",
                "description": "AI-powered chat for writing, coding, research, and multimodal tasks. Supports GPT-4o, o1, and custom GPTs.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-200/mo",
                "free_tier_available": True,
                "website": "https://chat.openai.com",
                "rating": 4.9,
                "upvotes": 55000,
                "is_trending": True,
                "use_cases": ["Writing", "Coding", "Research", "Image Analysis"],
                "supported_platforms": ["Web", "iOS", "Android", "macOS", "Windows"],
            },
            {
                "tool_name": "Claude",
                "tagline": "Anthropic's thoughtful AI assistant",
                "description": "Advanced AI assistant with strong reasoning, long context (200K tokens), and code analysis. Known for safety and helpfulness.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-200/mo",
                "free_tier_available": True,
                "website": "https://claude.ai",
                "rating": 4.8,
                "upvotes": 42000,
                "is_trending": True,
                "use_cases": ["Writing", "Coding", "Analysis", "Research"],
                "supported_platforms": ["Web", "iOS", "Android", "API"],
            },
            {
                "tool_name": "Gemini",
                "tagline": "Google's multimodal AI model",
                "description": "Google DeepMind's most capable AI model with native multimodal understanding, deep research, and Google ecosystem integration.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-20/mo",
                "free_tier_available": True,
                "website": "https://gemini.google.com",
                "rating": 4.7,
                "upvotes": 38000,
                "is_trending": True,
                "use_cases": ["Research", "Writing", "Coding", "Multimodal"],
                "supported_platforms": ["Web", "iOS", "Android", "API"],
            },
            {
                "tool_name": "Perplexity",
                "tagline": "AI-powered answer engine",
                "description": "AI search engine that provides cited, real-time answers by combining LLM reasoning with web search.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-20/mo",
                "free_tier_available": True,
                "website": "https://www.perplexity.ai",
                "rating": 4.7,
                "upvotes": 30000,
                "is_trending": True,
                "use_cases": ["Research", "Fact-checking", "Academic"],
                "supported_platforms": ["Web", "iOS", "Android", "Chrome Extension"],
            },
            {
                "tool_name": "Grok",
                "tagline": "xAI's real-time AI assistant",
                "description": "AI chatbot by xAI with real-time X (Twitter) data access, humor, and unfiltered responses.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-40/mo",
                "free_tier_available": True,
                "website": "https://grok.x.ai",
                "rating": 4.3,
                "upvotes": 18000,
                "is_trending": True,
                "use_cases": ["News", "Social Media Analysis", "Research"],
                "supported_platforms": ["Web", "X App"],
            },
            {
                "tool_name": "HyperCLOVA X",
                "tagline": "NAVER's Korean-optimized AI",
                "description": "NAVER's large language model optimized for Korean language understanding and generation with enterprise features.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-30/mo",
                "free_tier_available": True,
                "website": "https://clova-x.naver.com",
                "rating": 4.4,
                "upvotes": 12000,
                "is_trending": True,
                "use_cases": ["Korean NLP", "Enterprise", "Search"],
                "supported_platforms": ["Web", "API", "NAVER Ecosystem"],
            },
            {
                "tool_name": "Llama",
                "tagline": "Meta's open-source LLM family",
                "description": "Meta's open-source large language models (Llama 3.x). Free for research and commercial use with strong multilingual support.",
                "category": "LLM/Chatbot",
                "pricing_model": "Free",
                "price_range": "Free (self-hosted)",
                "free_tier_available": True,
                "website": "https://llama.meta.com",
                "rating": 4.6,
                "upvotes": 35000,
                "is_trending": True,
                "use_cases": ["Research", "Self-hosting", "Fine-tuning"],
                "supported_platforms": ["Self-hosted", "Cloud APIs", "Hugging Face"],
            },
            {
                "tool_name": "Mistral",
                "tagline": "European open-weight AI models",
                "description": "French AI company offering efficient, open-weight models with strong reasoning. Includes Mistral Large and Mixtral MoE models.",
                "category": "LLM/Chatbot",
                "pricing_model": "Freemium",
                "price_range": "$0-40/mo",
                "free_tier_available": True,
                "website": "https://mistral.ai",
                "rating": 4.5,
                "upvotes": 22000,
                "is_trending": True,
                "use_cases": ["Coding", "Multilingual", "Enterprise"],
                "supported_platforms": ["API", "Self-hosted", "Le Chat"],
            },
            # ── Image/Video Generation ───────────────────────
            {
                "tool_name": "Midjourney",
                "tagline": "AI art generation platform",
                "description": "Leading AI image generator known for artistic quality and photorealism. Version 7 with advanced style controls.",
                "category": "Image/Video",
                "pricing_model": "Paid",
                "price_range": "$10-120/mo",
                "free_tier_available": False,
                "website": "https://www.midjourney.com",
                "rating": 4.8,
                "upvotes": 45000,
                "is_trending": True,
                "use_cases": ["Art", "Design", "Marketing", "Concept Art"],
                "supported_platforms": ["Web", "Discord"],
            },
            {
                "tool_name": "Runway",
                "tagline": "AI-powered creative video suite",
                "description": "Professional AI video generation and editing platform with Gen-3 Alpha. Text-to-video, image-to-video, and video editing tools.",
                "category": "Image/Video",
                "pricing_model": "Freemium",
                "price_range": "$0-100/mo",
                "free_tier_available": True,
                "website": "https://runwayml.com",
                "rating": 4.6,
                "upvotes": 28000,
                "is_trending": True,
                "use_cases": ["Video Production", "Film", "Marketing", "VFX"],
                "supported_platforms": ["Web", "API"],
            },
            {
                "tool_name": "Sora",
                "tagline": "OpenAI's text-to-video model",
                "description": "OpenAI's video generation model capable of creating realistic, high-fidelity videos from text descriptions up to 1 minute.",
                "category": "Image/Video",
                "pricing_model": "Paid",
                "price_range": "$20-200/mo (via ChatGPT Plus/Pro)",
                "free_tier_available": False,
                "website": "https://sora.com",
                "rating": 4.5,
                "upvotes": 40000,
                "is_trending": True,
                "use_cases": ["Video Generation", "Storytelling", "Advertising"],
                "supported_platforms": ["Web"],
            },
            {
                "tool_name": "Stable Diffusion",
                "tagline": "Open-source image generation",
                "description": "Open-source image generation model by Stability AI. Highly customizable with LoRA, ControlNet, and community fine-tunes.",
                "category": "Image/Video",
                "pricing_model": "Free",
                "price_range": "Free (self-hosted) / $10-20/mo (hosted)",
                "free_tier_available": True,
                "website": "https://stability.ai",
                "rating": 4.6,
                "upvotes": 32000,
                "is_trending": True,
                "use_cases": ["Art", "Design", "Research", "Customization"],
                "supported_platforms": ["Self-hosted", "Web", "API", "ComfyUI"],
            },
            {
                "tool_name": "Pika Labs",
                "tagline": "AI video creation made simple",
                "description": "User-friendly AI video generation platform for creating and editing videos with text and image prompts.",
                "category": "Image/Video",
                "pricing_model": "Freemium",
                "price_range": "$0-60/mo",
                "free_tier_available": True,
                "website": "https://pika.art",
                "rating": 4.4,
                "upvotes": 18000,
                "is_trending": True,
                "use_cases": ["Video Creation", "Social Media", "Clips"],
                "supported_platforms": ["Web", "Discord"],
            },
            {
                "tool_name": "Leonardo.ai",
                "tagline": "AI image generation for creatives",
                "description": "AI-powered creative platform for generating production-quality visual assets with fine-tuned models and real-time canvas.",
                "category": "Image/Video",
                "pricing_model": "Freemium",
                "price_range": "$0-60/mo",
                "free_tier_available": True,
                "website": "https://leonardo.ai",
                "rating": 4.5,
                "upvotes": 20000,
                "is_trending": True,
                "use_cases": ["Game Assets", "Marketing", "Design"],
                "supported_platforms": ["Web", "API"],
            },
            {
                "tool_name": "Google Veo",
                "tagline": "Google DeepMind's video generation",
                "description": "Google's most capable video generation model with high-fidelity output, cinematic controls, and integration with Gemini.",
                "category": "Image/Video",
                "pricing_model": "Freemium",
                "price_range": "$0-20/mo (via Gemini)",
                "free_tier_available": True,
                "website": "https://deepmind.google/technologies/veo/",
                "rating": 4.4,
                "upvotes": 15000,
                "is_trending": True,
                "use_cases": ["Video Generation", "Advertising", "Content Creation"],
                "supported_platforms": ["Web", "API", "Vertex AI"],
            },
            # ── Audio/Music ──────────────────────────────────
            {
                "tool_name": "Suno",
                "tagline": "AI music generation platform",
                "description": "Create full songs with vocals, lyrics, and instruments from text prompts. Supports multiple genres and styles.",
                "category": "Audio/Music",
                "pricing_model": "Freemium",
                "price_range": "$0-30/mo",
                "free_tier_available": True,
                "website": "https://suno.com",
                "rating": 4.6,
                "upvotes": 25000,
                "is_trending": True,
                "use_cases": ["Music Production", "Content Creation", "Podcasting"],
                "supported_platforms": ["Web", "API"],
            },
            {
                "tool_name": "Udio",
                "tagline": "AI music creation tool",
                "description": "AI-powered music generation with high-fidelity audio, vocal synthesis, and genre-spanning capabilities.",
                "category": "Audio/Music",
                "pricing_model": "Freemium",
                "price_range": "$0-30/mo",
                "free_tier_available": True,
                "website": "https://www.udio.com",
                "rating": 4.5,
                "upvotes": 16000,
                "is_trending": True,
                "use_cases": ["Music Production", "Soundtrack", "Creative"],
                "supported_platforms": ["Web"],
            },
            {
                "tool_name": "ElevenLabs",
                "tagline": "AI voice synthesis and cloning",
                "description": "Advanced AI voice generation with natural-sounding speech, voice cloning, multilingual support, and audio dubbing.",
                "category": "Audio/Music",
                "pricing_model": "Freemium",
                "price_range": "$0-99/mo",
                "free_tier_available": True,
                "website": "https://elevenlabs.io",
                "rating": 4.7,
                "upvotes": 30000,
                "is_trending": True,
                "use_cases": ["Voiceover", "Audiobook", "Dubbing", "Podcast"],
                "supported_platforms": ["Web", "API", "Plugin"],
            },
            # ── Code Assistant ───────────────────────────────
            {
                "tool_name": "GitHub Copilot",
                "tagline": "AI pair programmer",
                "description": "AI-powered code completion, chat, and suggestions directly in your IDE. Supports all major languages with contextual awareness.",
                "category": "Code",
                "pricing_model": "Freemium",
                "price_range": "$0-39/mo",
                "free_tier_available": True,
                "website": "https://github.com/features/copilot",
                "rating": 4.7,
                "upvotes": 35000,
                "is_trending": True,
                "use_cases": ["Coding", "Code Review", "Documentation"],
                "supported_platforms": ["VS Code", "JetBrains", "Vim", "Xcode"],
            },
            {
                "tool_name": "Cursor",
                "tagline": "AI-first code editor",
                "description": "AI-native code editor built on VS Code with deep codebase understanding, multi-file editing, and natural language coding.",
                "category": "Code",
                "pricing_model": "Freemium",
                "price_range": "$0-40/mo",
                "free_tier_available": True,
                "website": "https://cursor.com",
                "rating": 4.8,
                "upvotes": 32000,
                "is_trending": True,
                "use_cases": ["Coding", "Refactoring", "Debugging"],
                "supported_platforms": ["macOS", "Windows", "Linux"],
            },
            {
                "tool_name": "Replit",
                "tagline": "AI-powered collaborative coding platform",
                "description": "Cloud-based IDE with AI assistant for building, deploying, and hosting applications. Supports 50+ languages with instant deployment.",
                "category": "Code",
                "pricing_model": "Freemium",
                "price_range": "$0-25/mo",
                "free_tier_available": True,
                "website": "https://replit.com",
                "rating": 4.5,
                "upvotes": 20000,
                "is_trending": True,
                "use_cases": ["Prototyping", "Education", "Deployment"],
                "supported_platforms": ["Web", "Mobile"],
            },
            # ── Productivity ─────────────────────────────────
            {
                "tool_name": "Notion AI",
                "tagline": "AI-powered workspace assistant",
                "description": "AI integrated into Notion workspace for writing, summarizing, brainstorming, and automating tasks across docs, wikis, and projects.",
                "category": "Productivity",
                "pricing_model": "Paid",
                "price_range": "$10/mo (add-on)",
                "free_tier_available": False,
                "website": "https://www.notion.so/product/ai",
                "rating": 4.5,
                "upvotes": 22000,
                "is_trending": True,
                "use_cases": ["Writing", "Project Management", "Knowledge Base"],
                "supported_platforms": ["Web", "macOS", "Windows", "iOS", "Android"],
            },
        ]

        print(f"📦 Fetching trending AI platforms ({len(sample_tools)} platforms from research data)...")
        return sample_tools[:max_results]

    async def save_to_db(self, tools: List[Dict[str, Any]], db: AsyncSession) -> int:
        """
        AI 도구 정보를 데이터베이스에 저장

        Args:
            tools: AI 도구 정보 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 항목 수
        """
        saved_count = 0

        for tool_data in tools:
            try:
                # 중복 확인 (웹사이트 URL 기준)
                website = tool_data.get("website")
                if not website:
                    continue

                result = await db.execute(
                    select(AITool).where(AITool.website == website)
                )
                existing = result.scalar_one_or_none()

                if existing:
                    # 기존 항목 업데이트
                    for key, value in tool_data.items():
                        if hasattr(existing, key) and value is not None:
                            setattr(existing, key, value)
                    print(f"📝 Updated: {tool_data.get('tool_name', 'Unknown')}")
                else:
                    # 새 항목 생성
                    new_tool = AITool(**tool_data)
                    db.add(new_tool)
                    saved_count += 1
                    print(f"✨ Created: {tool_data.get('tool_name', 'Unknown')}")

                await db.commit()

            except Exception as e:
                await db.rollback()
                print(f"❌ Error saving AI tool: {e}")
                continue

        return saved_count

    async def get_tools(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        trending_only: bool = False,
    ) -> List[AITool]:
        """
        데이터베이스에서 AI 도구 목록 조회

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 항목 수
            limit: 반환할 최대 항목 수
            category: 카테고리 필터
            trending_only: 트렌딩 도구만 조회

        Returns:
            AI 도구 목록
        """
        query = select(AITool)

        if category:
            query = query.where(AITool.category == category)

        if trending_only:
            query = query.where(AITool.is_trending == True)

        query = query.order_by(desc(AITool.upvotes)).offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()
