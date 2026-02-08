# Gemini 딥 리서치 통합 프롬프트

> AI봄(AI Trend Tracker) 앱 — 한국 데이터 + 기술 구현 + 해외 데이터 통합
> Gemini "딥 리서치" 모드로 아래 전체를 붙여넣기

---

나는 **"AI봄"**이라는 AI 트렌드 추적 웹 앱을 개발 중이야.

**기술 스택:**
- 백엔드: FastAPI + SQLAlchemy async + PostgreSQL + Redis 캐시
- 프론트엔드: Next.js 14 App Router + TypeScript + Tailwind CSS + Framer Motion
- 디자인: Glassmorphism (다크 #0f0a0a, 라이트 #faf8f6)
- 배포: Railway (백엔드) + Vercel (프론트엔드)

9개 카테고리(HuggingFace, YouTube, 논문, 뉴스, GitHub, 컨퍼런스, AI 플랫폼, 채용, 정책)의 데이터를 자동 수집해서 한국 AI 개발자/기획자에게 보여주는 서비스야.

**2026년 2월 기준** 최신 데이터가 필요해. 아래 **10개 섹션** 전부 답해줘. 모든 결과는 **JSON 형태**로 정리해줘.

---

## 1. YouTube AI 채널 검증 (가장 중요)

각 채널의 **정확한 YouTube 채널 ID** (UC로 시작하는 24자리)를 찾아줘.

### 한국 채널 (12개 - 현재 등록됨)
@jocoding(조코딩), @teddynote(테디노트), @bbanghyong(빵형의 개발도상국), @nadocoding(나도코딩), @nomadcoders(노마드코더), @undeal(안될공학), @ITSub(잇섭), @visionbear(비전곰), @aitalktalk(AI톡톡), @deepdive_kr(딥다이브), @eo_studio(EO), @syukaworld(슈카월드)

### 해외 채널 (13개 - 현재 등록됨)
@3blue1brown, @TwoMinutePapers, @sentdex, @WesRoth, @matthew_berman, @AndrejKarpathy, @YannicKilcher, @aiexplained, @DavidShapiroAutomator, @krishnaik06, @RobertMilesAI, @lexfridman, @DeepMind

### 추가 후보 검증 (6개)
한국: @codefactory(코드팩토리), @codingangtv(생활코딩)
해외: @Fireship, @maboroshi(Matt Wolfe), @TheAIGRID, @samaboroshi(Sam Witteveen)

**각 채널 JSON:**
```json
{
  "handle": "@jocoding",
  "channel_id": "UCxxxxxxxxxxxxxxxxxxxxxx",
  "channel_name": "조코딩 JoCoding",
  "subscriber_count": "약 120만",
  "language": "ko",
  "content_focus": "AI 코딩 튜토리얼, 생성AI 활용법",
  "last_upload_date": "2026-02-XX",
  "is_active": true
}
```

**추가 추천:** 한국 AI 유튜버 5명 + 해외 AI 유튜버 5명 (위 목록과 중복 불가, 최근 3개월 활동, 구독자 한국 1만+/해외 5만+)

---

## 2. AI 뉴스 RSS 피드 검증 + 추천

### 현재 등록된 14개 피드
```
1. https://rss.etnews.com/Section901.xml          (전자신문 IT)
2. http://rss.etnews.com/04046.xml                 (전자신문 AI)
3. https://www.aitimes.com/rss/allArticle.xml      (AI타임스)
4. https://www.bloter.net/feed                      (블로터)
5. https://www.dailian.co.kr/rss/all.xml           (데일리안)
6. https://www.hankyung.com/feed/it                 (한국경제 IT)
7. https://www.mk.co.kr/rss/30500001/              (매일경제 과학기술)
8. https://techcrunch.com/tag/artificial-intelligence/feed/
9. https://venturebeat.com/category/ai/feed/
10. https://www.technologyreview.com/topic/artificial-intelligence/feed
11. https://www.theverge.com/ai-artificial-intelligence/rss/index.xml
12. https://www.artificialintelligence-news.com/feed/
13. https://openai.com/blog/rss/
14. https://blog.google/technology/ai/rss/
```

**각 피드 JSON:**
```json
{
  "id": 1,
  "source_name": "전자신문 IT",
  "rss_url": "https://rss.etnews.com/Section901.xml",
  "status": "active",
  "feed_format": "RSS 2.0",
  "available_fields": ["title", "link", "description", "pubDate", "author"],
  "has_full_content": false,
  "has_images": true,
  "last_article_date": "2026-02-07",
  "ai_content_ratio": "약 15%",
  "article_frequency": "하루 5-10건",
  "notes": ""
}
```
status: "active" | "inactive" | "url_changed" | "discontinued"

**추가 추천:**
- 한국 AI 뉴스 RSS 5개 (AI 비율 높은 것 우선: ZDNet Korea, IT조선, 디지털투데이, 인공지능신문 등)
- 해외 AI 블로그 RSS 5개 (Hugging Face blog, Anthropic blog, Meta AI blog, Stability AI blog 등 - 실제 RSS URL 확인)

---

## 3. 2026년 AI 컨퍼런스 일정

### 현재 등록된 6개 (날짜 재확인)
| 학회 | 시작일 | 종료일 | 장소 |
|------|--------|--------|------|
| AAAI 2026 | 2026-01-20 | 2026-01-27 | Singapore |
| ICLR 2026 | 2026-04-23 | 2026-04-27 | Rio de Janeiro, Brazil |
| CVPR 2026 | 2026-06-03 | 2026-06-07 | Denver, CO, USA |
| ICML 2026 | 2026-07-06 | 2026-07-11 | Seoul, South Korea |
| KDD 2026 | 2026-08-09 | 2026-08-13 | Jeju, South Korea |
| NeurIPS 2026 | 2026-12-06 | 2026-12-12 | Sydney, Australia |

### 추가 학회 (국제 10개 + 한국 6개)
**국제:** ACL, EMNLP, NAACL, COLING, ECCV(짝수년), IJCAI, INTERSPEECH, SIGIR, WSDM, AISTATS
**한국:** KCC 2026, KCSE 2026, AI Korea 2026, Google I/O Extended Seoul, DEVIEW(NAVER), if(kakao)

**각 학회 JSON:**
```json
{
  "name": "ACL 2026",
  "full_name": "Annual Meeting of the Association for Computational Linguistics",
  "start_date": "2026-MM-DD",
  "end_date": "2026-MM-DD",
  "location": "City, Country",
  "submission_deadline": "2026-MM-DD",
  "tier": "A*",
  "topics": ["NLP", "Computational Linguistics"],
  "website": "https://...",
  "estimated": false
}
```
`estimated`: 공식 확인=false, 과거 패턴 추정=true

---

## 4. 한국 AI 정책 현황 (2025-2026)

### 4.1 AI 기본법
```json
{
  "title": "인공지능 산업 육성 및 신뢰 기반 조성에 관한 법률",
  "short_name": "AI 기본법",
  "status": "Enacted",
  "enacted_date": "2025-01-09",
  "effective_date": "2026-01-22",
  "country": "South Korea",
  "description_ko": "200자 이내",
  "key_provisions": ["조항1", "조항2", "조항3", "조항4", "조항5"],
  "impact_areas": ["산업 육성", "윤리", "안전", "개인정보"],
  "source_url": "법제처 URL",
  "summary": "300자 이내 한국어 요약"
}
```

### 4.2 한국 정부 AI 정책 5개 이상
과기정통부, 개인정보보호위원회, NIA 등에서 발표한 정책/가이드라인. 같은 JSON 형태.

### 4.3 해외 주요 정책 4개
- EU AI Act (2026년 시행 단계)
- 미국 AI 행정명령/정책 (트럼프 행정부 포함)
- 중국 생성형 AI 관리법
- 일본 AI 전략 2026

### 4.4 정책 RSS 피드
과기정통부(msit.go.kr), 개인정보보호위원회(pipc.go.kr), NIA(nia.or.kr), 법제처(moleg.go.kr), 국회 의안정보시스템의 RSS URL 확인.
```json
{
  "organization": "과학기술정보통신부",
  "rss_url": "https://...",
  "status": "active|not_available",
  "alternative": "RSS 없으면 대안 URL"
}
```

---

## 5. 채용 API 조사 (한국 + 해외)

### 한국: 원티드, 사람인, 워크넷(공공데이터포털), 점핏, 로켓펀치
### 해외: RemoteOK, Adzuna, Arbeitnow, LinkedIn

**각 플랫폼 JSON:**
```json
{
  "platform": "원티드",
  "api_available": true,
  "api_docs_url": "https://...",
  "auth_method": "API Key / OAuth / None",
  "ai_search_params": {"keyword": "AI", "category": "개발"},
  "rate_limit": "100 req/hour",
  "response_format": "JSON",
  "geographic_coverage": ["KR"],
  "salary_data": true,
  "free_tier": true,
  "python_example": "httpx 코드 3-5줄",
  "notes": "제한사항 등"
}
```

특히 RemoteOK API(https://remoteok.com/api)는 현재 사용 중인데: rate limit, AI/ML 태그 목록, 페이지네이션 방법, 응답 필드를 상세히 알려줘.

---

## 6. AI 플랫폼 최신 현황 (2026년 2월)

20개 플랫폼의 최신 정보:
ChatGPT, Claude, Gemini, Grok, Perplexity, HyperCLOVA X, Llama, Mistral, Midjourney, Runway, Sora, Stable Diffusion, ElevenLabs, Suno, GitHub Copilot, Cursor, Replit, Notion AI, Pika Labs, Leonardo.ai

**각 플랫폼 JSON:**
```json
{
  "name": "ChatGPT",
  "company": "OpenAI",
  "latest_version": "GPT-5.3 / o3",
  "pricing": {
    "free": "무료 (GPT-4o mini)",
    "plus": "$20/월",
    "pro": "$200/월"
  },
  "new_features_2026": ["기능1", "기능2"],
  "korean_support": "full|partial|none",
  "category": "LLM/Chatbot",
  "website": "https://chat.openai.com",
  "last_major_update": "2026-MM-DD",
  "rating": 4.9,
  "description_ko": "50자 설명",
  "key_features_ko": ["멀티모달", "코드 인터프리터"]
}
```

---

## 7. GitHub 검색 전략 최적화

현재 8개 토픽으로 검색 중: machine-learning, artificial-intelligence, deep-learning, neural-network, pytorch, tensorflow, llm, transformers

### 7.1 2026 트렌드 반영 추가 GitHub 토픽 10개
```json
{
  "topic": "rag",
  "description": "Retrieval-Augmented Generation",
  "github_repos_count": "약 5,000개",
  "trend": "급상승",
  "recommend_priority": "high"
}
```

### 7.2 카테고리별 최적 검색 쿼리
우리 프론트엔드 탭: LLM/NLP, CV, MLOps, AI Agents, 기타
각 카테고리별로 GitHub Search API `q` 파라미터 최적화 쿼리 2개씩 만들어줘:
```json
{
  "category": "LLM/NLP",
  "queries": [
    {
      "q": "topic:llm stars:>50 pushed:>2025-11-01",
      "sort": "stars",
      "description": "LLM repos with recent activity"
    }
  ]
}
```

### 7.3 Star Velocity (트렌딩 감지)
GitHub API에는 별 증가 속도를 직접 알 수 있는 엔드포인트가 없어. 트렌딩 레포를 감지하는 **최선의 방법**을 알려줘:
- periodic snapshots vs GitHub Events API vs 써드파티 API
- Python 구현 전략 (5줄 이내 핵심 로직)

---

## 8. arXiv 논문 수집 고도화

현재 쿼리: `cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV OR cat:cs.NE`

### 8.1 추가 arXiv 카테고리 5개 추천
```json
{
  "category_id": "cs.RO",
  "category_name": "Robotics",
  "relevance": "embodied AI 트렌드",
  "monthly_papers": "약 200편",
  "recommend_priority": "high"
}
```

### 8.2 학회 논문 감지 regex
arXiv `comment` 필드에서 "Accepted at NeurIPS 2026" 같은 정보를 추출하는 **Python regex 패턴**을 설계해줘:
```json
{
  "patterns": [
    {
      "regex": "정규식 패턴",
      "flags": "IGNORECASE",
      "example_match": "Accepted at NeurIPS 2026",
      "extracts": {"conference": "NeurIPS", "year": "2026"}
    }
  ],
  "python_function": "def extract_conference(comment: str) -> dict | None: ..."
}
```
감지할 학회: NeurIPS, ICML, ICLR, CVPR, ACL, EMNLP, AAAI, IJCAI, NAACL, ECCV, ICCV, KDD, SIGIR, INTERSPEECH, COLING

### 8.3 논문 주제 분류 룰
프론트엔드 탭(NLP, CV, ML, 강화학습, 멀티모달)에 맞는 키워드 분류 규칙:
```json
{
  "category": "NLP",
  "primary_arxiv_categories": ["cs.CL"],
  "title_keywords": ["language model", "translation", "NLP", "text generation"],
  "abstract_keywords": ["transformer", "BERT", "GPT", "tokenization"]
}
```

### 8.4 트렌딩 논문 감지
arXiv에서 "핫한" 논문을 찾는 방법:
- Semantic Scholar API (인용 속도)
- Papers With Code 연동
- Hugging Face Papers 페이지
각각의 API URL, 인증 방법, 활용 방안을 알려줘.

---

## 9. HuggingFace 수집 전략

### 9.1 HF API 추가 활용
현재 `/api/models`에서 downloads/lastModified 정렬만 사용 중.
- `sort=trending` 파라미터가 존재하는지?
- Spaces API (트렌딩 데모 추적)?
- Datasets API?
- 어떤 추가 파라미터가 유용한지?

### 9.2 pipeline_tag → 한국어 매핑
HuggingFace가 지원하는 **모든 pipeline_tag 값** (30개+)을 한국어로 매핑해줘:
```json
[
  {"pipeline_tag": "text-generation", "display_ko": "텍스트 생성", "display_en": "Text Generation"},
  {"pipeline_tag": "text-to-image", "display_ko": "이미지 생성", "display_en": "Text to Image"},
  ...
]
```

---

## 10. 배포 + 스케줄링 가이드

### 10.1 데이터 수집 스케줄링
9개 카테고리의 **권장 수집 주기**와 이유:
```json
{
  "huggingface": {"interval": "6h", "reason": "모델 순위 변동 느림"},
  "youtube": {"interval": "?", "reason": "?"},
  "arxiv": {"interval": "?", "reason": "?"},
  "news": {"interval": "?", "reason": "?"},
  "github": {"interval": "?", "reason": "?"},
  "conferences": {"interval": "?", "reason": "?"},
  "tools": {"interval": "?", "reason": "?"},
  "jobs": {"interval": "?", "reason": "?"},
  "policies": {"interval": "?", "reason": "?"}
}
```

### 10.2 APScheduler 설정
FastAPI + APScheduler로 백그라운드 수집을 스케줄링하는 **Python 코드 예시** (10줄 이내)와 권장 설정.

### 10.3 Railway 배포 최적화
- 1GB RAM에서 uvicorn worker 수
- PostgreSQL 커넥션 풀 설정
- Redis 캐시 TTL 전략
- 월 비용 예상 (Hobby vs Pro)

---

## 출력 형식

```
## 1. YouTube 채널 검증
### 1.1 한국 채널 (12개)
[JSON 배열]
### 1.2 해외 채널 (13개)
[JSON 배열]
### 1.3 추가 후보 (6개)
[JSON 배열]
### 1.4 신규 추천 (10개)
[JSON 배열]

## 2. RSS 피드
### 2.1 기존 14개 검증
[JSON 배열]
### 2.2 한국 추천 5개
[JSON 배열]
### 2.3 해외 추천 5개
[JSON 배열]

## 3. 컨퍼런스
### 3.1 기존 6개 재확인
[JSON 배열]
### 3.2 국제 추가 (10개)
[JSON 배열]
### 3.3 한국 추가 (6개)
[JSON 배열]

## 4. 정책
### 4.1 AI 기본법
[JSON]
### 4.2 한국 정부 정책
[JSON 배열]
### 4.3 해외 정책
[JSON 배열]
### 4.4 정책 RSS
[JSON 배열]

## 5. 채용 API
### 5.1 한국 플랫폼
[JSON 배열]
### 5.2 해외 플랫폼
[JSON 배열]

## 6. AI 플랫폼 현황
[JSON 배열 - 20개]

## 7. GitHub 전략
### 7.1 추가 토픽 10개
[JSON 배열]
### 7.2 카테고리별 쿼리
[JSON 배열]
### 7.3 Star Velocity 전략
[JSON]

## 8. arXiv 고도화
### 8.1 추가 카테고리
[JSON 배열]
### 8.2 학회 감지 regex
[JSON]
### 8.3 주제 분류 룰
[JSON 배열]
### 8.4 트렌딩 감지
[JSON]

## 9. HuggingFace
### 9.1 API 추가 활용
[JSON]
### 9.2 pipeline_tag 매핑
[JSON 배열]

## 10. 배포/스케줄링
### 10.1 수집 주기
[JSON]
### 10.2 APScheduler 코드
[코드]
### 10.3 Railway 설정
[JSON]
```

**중요:**
- 모든 JSON은 유효하고 파싱 가능해야 함
- 확실하지 않은 데이터는 `"estimated": true` 또는 `"confidence": "low"` 표시
- 2026년 2월 기준 최신 상태로 답변
- Python 코드 예시가 요청된 곳은 실제 동작하는 코드로

감사합니다!
