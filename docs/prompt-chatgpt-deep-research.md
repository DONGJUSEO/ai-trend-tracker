# ChatGPT 딥 리서치 프롬프트

> 목적: AI봄(AI Trend Tracker) 앱의 프론트엔드/백엔드 기술 구현 가이드 + 해외 데이터 검증
> 사용 방법: ChatGPT에서 "Deep Research" 모드로 아래 전체를 붙여넣기

---

## 프롬프트 시작

I'm building **"AI봄" (AI Bom)** — a production-grade AI Trend Tracker web application targeting Korean AI developers and product managers.

**Tech Stack:**
- Backend: FastAPI + SQLAlchemy async + PostgreSQL + Redis cache
- Frontend: Next.js 14 App Router + TypeScript + Tailwind CSS + Framer Motion
- Design: Glassmorphism (dark primary: #0f0a0a, light: #faf8f6)
- Deployment: Railway (backend) + Vercel (frontend)

The app tracks 9 categories of AI data: HuggingFace models, YouTube videos, arXiv papers, AI news, GitHub projects, conferences, AI platforms/tools, job trends, and AI policies.

I need deep research on **6 sections** below. All results should be in **JSON format** that I can directly use in Python/TypeScript code.

---

## 1. RSS Feed Technical Validation

I have 14 RSS feeds configured. For each feed, I need you to:
1. **Verify the URL works** (HTTP 200, valid XML/RSS)
2. Check if the **feed structure** is standard RSS 2.0 or Atom
3. Identify the **actual fields** available (title, link, description, pubDate, author, category, media:content, etc.)

### Current Feeds

**Korean Sources:**
```
1. https://rss.etnews.com/Section901.xml          (전자신문 IT)
2. http://rss.etnews.com/04046.xml                 (전자신문 AI섹션)
3. https://www.aitimes.com/rss/allArticle.xml      (AI타임스)
4. https://www.bloter.net/feed                      (블로터)
5. https://www.dailian.co.kr/rss/all.xml           (데일리안)
6. https://www.hankyung.com/feed/it                 (한국경제 IT)
7. https://www.mk.co.kr/rss/30500001/              (매일경제 과학기술)
```

**International Sources:**
```
8.  https://techcrunch.com/tag/artificial-intelligence/feed/
9.  https://venturebeat.com/category/ai/feed/
10. https://www.technologyreview.com/topic/artificial-intelligence/feed
11. https://www.theverge.com/ai-artificial-intelligence/rss/index.xml
12. https://www.artificialintelligence-news.com/feed/
13. https://openai.com/blog/rss/
14. https://blog.google/technology/ai/rss/
```

**For each feed, return:**
```json
{
  "id": 1,
  "source_name": "전자신문 IT",
  "url": "https://rss.etnews.com/Section901.xml",
  "status": "active",
  "feed_format": "RSS 2.0",
  "encoding": "UTF-8",
  "available_fields": ["title", "link", "description", "pubDate", "author", "category"],
  "has_full_content": false,
  "has_images": true,
  "image_field": "media:content",
  "update_frequency": "hourly",
  "items_per_fetch": 20,
  "ai_relevance": "mixed (general IT, ~15% AI)",
  "notes": "Works fine, but http:// version of #2 is better for AI-specific content"
}
```

**Additionally, recommend 5 NEW international AI-focused RSS feeds:**
- Prioritize feeds with high AI content ratio (>80%)
- Include: Hugging Face blog, Anthropic blog, Meta AI blog, Stability AI blog, etc.
- Check if they have actual RSS/Atom feeds

---

## 2. GitHub Search Strategy Optimization

Currently searching with 8 topics: `machine-learning`, `artificial-intelligence`, `deep-learning`, `neural-network`, `pytorch`, `tensorflow`, `llm`, `transformers`

**Problem:** This misses many trending 2026 AI repos because:
- Topic-based search only finds repos that explicitly tag themselves
- Many hot repos use newer topic names (rag, agents, multimodal, etc.)
- star count threshold (>100) filters out brand new trending repos

### Research Request

**2.1 Optimal GitHub Search Queries for 2026 AI Trends**

Design 10 optimized GitHub API search queries that would find the most relevant AI repos in 2026. Consider:
- `q` parameter syntax (topic:, language:, stars:, pushed:, created:)
- Combination of topics + keywords in description
- Category-based grouping for our frontend tabs: LLM/NLP, CV, MLOps, AI Agents, Audio/Speech, Other

```json
{
  "category": "LLM/NLP",
  "queries": [
    {
      "q": "topic:llm stars:>50 pushed:>2025-11-01",
      "sort": "stars",
      "description": "LLM repos with recent activity",
      "expected_results": "200-500 repos"
    },
    {
      "q": "topic:rag OR topic:retrieval-augmented-generation stars:>20 pushed:>2025-11-01",
      "sort": "updated",
      "description": "RAG-specific repos, lower star threshold for newer repos"
    }
  ]
}
```

**2.2 Star Velocity Detection**

How to detect repos with rapid star growth (trending signal)?
- GitHub API doesn't provide historical star data
- What's the best approach? (starred_at API? periodic snapshots?)
- Provide a Python implementation strategy

```json
{
  "approach": "periodic_snapshots",
  "description": "Store star count on each collection, compute delta",
  "implementation": "Python code outline",
  "api_endpoint": "GET /repos/{owner}/{repo}",
  "fields_to_track": ["stargazers_count", "forks_count", "open_issues_count"],
  "velocity_formula": "(current_stars - previous_stars) / days_between_collections",
  "code_example": "..."
}
```

**2.3 Trending Repos Discovery**

Since GitHub doesn't have an official trending API, what are the best alternative approaches?
- GitHub trending page scraping?
- Third-party APIs? (gh-trending-api, etc.)
- GitHub Events API analysis?

---

## 3. arXiv Paper Collection Enhancement

Current query: `cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV OR cat:cs.NE`

### Research Request

**3.1 Conference Paper Detection**

Many arXiv papers include conference acceptance info in the `comment` field, like:
- "Accepted at NeurIPS 2026"
- "Published in ICML 2026"
- "To appear at ACL 2026"

Design a **regex pattern set** that reliably extracts conference info:
```json
{
  "patterns": [
    {
      "regex": "(?:accepted|published|to appear)\\s+(?:at|in)\\s+(NeurIPS|ICML|ICLR|CVPR|ACL|EMNLP|AAAI|IJCAI|NAACL|ECCV|ICCV|KDD|SIGIR|WSDM|INTERSPEECH|COLING)\\s*(\\d{4})?",
      "flags": "IGNORECASE",
      "group_1": "conference_name",
      "group_2": "year",
      "example_match": "Accepted at NeurIPS 2026"
    }
  ],
  "python_function": "def extract_conference(comment: str) -> Optional[dict]: ..."
}
```

**3.2 Topic Classification**

For our frontend tabs (NLP, CV, ML, 강화학습, 멀티모달), design a keyword-based classifier:
```json
{
  "category": "NLP",
  "primary_arxiv_categories": ["cs.CL"],
  "title_keywords": ["language model", "translation", "NLP", "text generation", "sentiment", "named entity", "question answering", "summarization", "dialogue"],
  "abstract_keywords": ["transformer", "BERT", "GPT", "tokenization", "embedding"]
}
```

**3.3 Trending Paper Detection**

How to identify "hot" papers on arXiv?
- Semantic Scholar API for citation velocity?
- Papers With Code integration?
- Hugging Face Papers page?

Provide implementation approach with API details.

---

## 4. RemoteOK + International Job API Guide

Currently using RemoteOK API (https://remoteok.com/api) for job data.

### Research Request

**4.1 RemoteOK API Deep Dive**
```json
{
  "base_url": "https://remoteok.com/api",
  "auth": "None required",
  "rate_limit": "?? requests per minute",
  "response_format": "JSON array",
  "ai_ml_tags": ["machine-learning", "ai", "data-science", "nlp", "computer-vision"],
  "available_fields": ["id", "company", "position", "tags", "location", "salary_min", "salary_max", "description", "url", "date"],
  "filtering_tips": "How to filter for AI/ML jobs specifically",
  "pagination": "How pagination works",
  "python_example": "Complete working httpx code"
}
```

**4.2 Alternative International Job APIs**
Research these job data sources for AI/ML positions:
- **Adzuna API** - availability, auth, AI job search
- **The Muse API** - availability, tech job categories
- **Arbeitnow API** - remote jobs, AI filtering
- **LinkedIn Job Postings** - any public API or data source?
- **Indeed API** - current status (was deprecated?)
- **Glassdoor API** - current availability

For each:
```json
{
  "platform": "Adzuna",
  "api_url": "https://...",
  "api_available": true,
  "auth_method": "API Key (free tier available)",
  "ai_search_capability": "keyword search + category filter",
  "geographic_coverage": ["US", "UK", "EU", "KR"],
  "rate_limit": "250 req/day (free)",
  "response_format": "JSON",
  "salary_data": true,
  "free_tier": true,
  "python_example": "httpx code snippet",
  "notes": "Best for: international job market data, salary benchmarks"
}
```

---

## 5. HuggingFace Collection Strategy Enhancement

Currently collecting top models by downloads and last modified date.

### Research Request

**5.1 HuggingFace API Capabilities**

What additional HF API endpoints could improve our data quality?
```json
{
  "endpoint": "/api/models",
  "useful_params": {
    "sort": ["downloads", "likes", "lastModified", "trending"],
    "filter": "pipeline_tag (text-generation, image-to-text, etc.)",
    "search": "Free text search in model name/description",
    "author": "Filter by organization (meta-llama, google, etc.)",
    "limit": "Max items per request"
  },
  "trending_endpoint": "Does HF have a specific trending/hot models endpoint?",
  "spaces_api": "Can we also track trending Spaces (demos)?",
  "datasets_api": "Should we track trending datasets too?"
}
```

**5.2 Model Category Mapping**

Map HuggingFace `pipeline_tag` values to our Korean display categories:
```json
[
  {
    "pipeline_tag": "text-generation",
    "display_ko": "텍스트 생성",
    "display_en": "Text Generation",
    "icon": "type describing icon",
    "popular_models": ["meta-llama/Llama-3", "mistralai/Mistral-7B"]
  },
  {
    "pipeline_tag": "text-to-image",
    "display_ko": "이미지 생성",
    "display_en": "Text to Image"
  }
]
```

Include ALL pipeline_tag values that HuggingFace currently supports (there are 30+).

---

## 6. Production Deployment Checklist

### 6.1 Railway Backend Optimization
```json
{
  "recommended_config": {
    "python_version": "3.11+",
    "workers": "How many uvicorn workers for 1GB RAM?",
    "database": "PostgreSQL (Railway addon) vs external",
    "redis": "Railway Redis addon config",
    "env_vars": ["list of required env vars"],
    "health_check": "/health endpoint config",
    "auto_deploy": "GitHub branch integration"
  },
  "cost_estimate": {
    "hobby": "$5/month - specs and limitations",
    "pro": "$20/month - specs and limitations"
  },
  "performance_tips": [
    "Connection pooling settings",
    "Redis cache TTL strategy",
    "Background task scheduling (APScheduler config)"
  ]
}
```

### 6.2 Vercel Frontend Optimization
```json
{
  "recommended_config": {
    "framework": "Next.js 14",
    "build_command": "next build",
    "output_directory": ".next",
    "env_vars": ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_API_KEY"],
    "rewrites": "API proxy config if needed",
    "edge_config": "Edge runtime for API routes?"
  },
  "performance": {
    "image_optimization": "next/image config for external images",
    "font_optimization": "next/font setup for Inter + Noto Sans KR",
    "bundle_analysis": "How to analyze and reduce JS bundle size",
    "cache_headers": "Recommended cache-control headers"
  },
  "seo": {
    "metadata": "Dynamic metadata for each category page",
    "sitemap": "Auto-generated sitemap config",
    "robots": "robots.txt recommendations"
  }
}
```

### 6.3 Data Collection Scheduling
```json
{
  "recommended_schedule": {
    "huggingface": {"interval": "6h", "reason": "Model rankings change slowly"},
    "youtube": {"interval": "4h", "reason": "New videos posted throughout day"},
    "arxiv": {"interval": "12h", "reason": "Daily batch updates"},
    "news": {"interval": "1h", "reason": "Breaking news cycle"},
    "github": {"interval": "6h", "reason": "Star velocity tracking"},
    "conferences": {"interval": "24h", "reason": "Dates rarely change"},
    "tools": {"interval": "7d", "reason": "Platform updates are infrequent"},
    "jobs": {"interval": "6h", "reason": "Job postings change frequently"},
    "policies": {"interval": "24h", "reason": "Policy changes are rare"}
  },
  "implementation": {
    "library": "APScheduler recommended config",
    "cron_expressions": "For each category",
    "error_handling": "Retry strategy",
    "monitoring": "How to track collection health"
  }
}
```

---

## Output Format

Please organize all results by section number with clear JSON blocks:

```
## 1. RSS Feed Validation
### 1.1 Existing Feeds (14)
[JSON array]
### 1.2 New Recommendations (5)
[JSON array]

## 2. GitHub Strategy
### 2.1 Optimized Queries (10)
[JSON array]
### 2.2 Star Velocity Implementation
[JSON]
### 2.3 Trending Discovery
[JSON]

## 3. arXiv Enhancement
### 3.1 Conference Detection Regex
[JSON]
### 3.2 Topic Classification Rules
[JSON array]
### 3.3 Trending Paper Detection
[JSON]

## 4. Job APIs
### 4.1 RemoteOK Deep Dive
[JSON]
### 4.2 Alternative APIs
[JSON array]

## 5. HuggingFace Enhancement
### 5.1 API Capabilities
[JSON]
### 5.2 Pipeline Tag Mapping
[JSON array]

## 6. Deployment
### 6.1 Railway Config
[JSON]
### 6.2 Vercel Config
[JSON]
### 6.3 Collection Schedule
[JSON]
```

**Important:**
- All JSON must be valid and parseable
- For uncertain data, add `"confidence": "high|medium|low"`
- Include working code examples where requested
- Focus on **2026 current state** — many APIs have changed since 2024

Thank you!
