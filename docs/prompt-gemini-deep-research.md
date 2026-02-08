# Gemini 딥 리서치 프롬프트

> 목적: AI봄(AI Trend Tracker) 앱의 백엔드 데이터 품질 향상을 위한 한국 중심 데이터 수집
> 사용 방법: Gemini에서 "딥 리서치" 모드로 아래 전체를 붙여넣기

---

## 프롬프트 시작

나는 **"AI봄"**이라는 AI 트렌드 추적 웹 앱을 개발 중이야. FastAPI 백엔드 + Next.js 프론트엔드로 구성되어 있고, 9개 카테고리(HuggingFace, YouTube, 논문, 뉴스, GitHub, 컨퍼런스, AI 플랫폼, 채용, 정책)의 데이터를 자동 수집해서 한국 AI 개발자/기획자에게 보여주는 서비스야.

**2026년 2월 기준** 최신 데이터가 필요해. 아래 7개 섹션 전부 답해줘. 모든 결과는 **JSON 형태**로 정리해줘.

---

## 1. YouTube AI 채널 검증 (가장 중요)

현재 우리 앱에 등록된 채널 목록이야. 각 채널의 **정확한 YouTube 채널 ID** (UC로 시작하는 24자리)를 찾아줘.

### 한국 채널 (12개 - 현재 등록됨)
| 핸들 | 표시명 |
|------|--------|
| @jocoding | 조코딩 |
| @teddynote | 테디노트 |
| @bbanghyong | 빵형의 개발도상국 |
| @nadocoding | 나도코딩 |
| @nomadcoders | 노마드 코더 |
| @undeal | 안될공학 |
| @ITSub | 잇섭 |
| @visionbear | 비전곰 |
| @aitalktalk | AI톡톡 |
| @deepdive_kr | 딥다이브 |
| @eo_studio | EO |
| @syukaworld | 슈카월드 |

### 해외 채널 (13개 - 현재 등록됨)
| 핸들 | 표시명 |
|------|--------|
| @3blue1brown | 3Blue1Brown |
| @TwoMinutePapers | Two Minute Papers |
| @sentdex | Sentdex |
| @WesRoth | Wes Roth |
| @matthew_berman | Matthew Berman |
| @AndrejKarpathy | Andrej Karpathy |
| @YannicKilcher | Yannic Kilcher |
| @aiexplained | AI Explained |
| @DavidShapiroAutomator | David Shapiro |
| @krishnaik06 | Krish Naik |
| @RobertMilesAI | Robert Miles |
| @lexfridman | Lex Fridman |
| @DeepMind | Google DeepMind |

### 요청 사항

**각 채널별로 아래 JSON 형태로 답해줘:**
```json
{
  "handle": "@jocoding",
  "channel_id": "UCxxxxxxxxxxxxxxxxxxxxxx",
  "channel_name": "조코딩 JoCoding",
  "subscriber_count": "약 120만",
  "language": "ko",
  "content_focus": "AI 코딩 튜토리얼, 생성AI 활용법",
  "last_upload_date": "2026-02-XX",
  "is_active": true,
  "verified": true
}
```

**추가로 아래 채널들도 검증해줘** (앱에 추가 예정):

한국 추가 후보:
- @codefactory (코드팩토리) - Flutter/백엔드 + AI
- @maboroshi (생활코딩) - 코딩 교육
- @FireshipTech (Fireship 한국어 번역 있는지)

해외 추가 후보:
- @Fireship
- @maboroshi (Matt Wolfe)
- @TheAIGRID

**마지막으로, 위 목록에 없는 AI 유튜버를 추천해줘:**
- 한국 AI 유튜버 5명 추가 추천 (구독자 1만 이상, 최근 3개월 이내 활동, AI/ML 콘텐츠 비율 50% 이상)
- 해외 AI 유튜버 5명 추가 추천 (구독자 5만 이상, 최근 3개월 이내 활동)

각 추천 채널도 위와 동일한 JSON 형태로.

---

## 2. 한국 AI 뉴스 RSS 피드 검증

현재 등록된 RSS 피드 13개의 **2026년 2월 현재 작동 여부**를 확인해줘.

### 한국 소스 (7개)
| # | 소스명 | URL |
|---|--------|-----|
| 1 | 전자신문 | https://rss.etnews.com/Section901.xml |
| 2 | 전자신문 AI | http://rss.etnews.com/04046.xml |
| 3 | AI타임스 | https://www.aitimes.com/rss/allArticle.xml |
| 4 | 블로터 | https://www.bloter.net/feed |
| 5 | 데일리안 | https://www.dailian.co.kr/rss/all.xml |
| 6 | 한국경제 IT | https://www.hankyung.com/feed/it |
| 7 | 매일경제 과학기술 | https://www.mk.co.kr/rss/30500001/ |

### 해외 소스 (6개)
| # | 소스명 | URL |
|---|--------|-----|
| 8 | TechCrunch AI | https://techcrunch.com/tag/artificial-intelligence/feed/ |
| 9 | VentureBeat AI | https://venturebeat.com/category/ai/feed/ |
| 10 | MIT Tech Review AI | https://www.technologyreview.com/topic/artificial-intelligence/feed |
| 11 | The Verge AI | https://www.theverge.com/ai-artificial-intelligence/rss/index.xml |
| 12 | AI News | https://www.artificialintelligence-news.com/feed/ |
| 13 | OpenAI Blog | https://openai.com/blog/rss/ |
| 14 | Google AI Blog | https://blog.google/technology/ai/rss/ |

**각 피드별로 아래 JSON 형태로 답해줘:**
```json
{
  "source_name": "전자신문",
  "rss_url": "https://rss.etnews.com/Section901.xml",
  "status": "active",
  "last_article_date": "2026-02-07",
  "ai_content_ratio": "약 15% (전체 IT뉴스 중 AI 비율)",
  "article_frequency": "하루 5-10건",
  "notes": "정상 작동, AI 전용 피드는 04046.xml이 더 적합"
}
```

status 값: "active" | "inactive" | "url_changed" | "discontinued"
url_changed인 경우 새 URL도 알려줘.

**추가로 한국 AI 뉴스 RSS 5개를 새로 추천해줘:**
- AI 관련 비율이 높은 것 우선
- 예시 후보: ZDNet Korea, 조선비즈 IT, IT조선, 디지털투데이, 인공지능신문, AI타임즈(aitimes.kr 아닌 다른 곳)
- 각각 RSS URL + 작동 여부 + AI 콘텐츠 비율

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

위 6개의 **날짜가 정확한지** 재확인하고, 틀린 게 있으면 수정해줘.

### 추가로 아래 학회들의 2026년 일정을 찾아줘

**NLP/언어:**
- ACL 2026
- EMNLP 2026
- NAACL 2026
- COLING 2026

**비전:**
- ECCV 2026 (짝수년만 개최)
- ICCV 2026 (홀수년만 개최 - 없을 수 있음)

**기타 AI:**
- IJCAI 2026
- INTERSPEECH 2026
- SIGIR 2026
- WSDM 2026

**한국 행사:**
- KCC 2026 (한국컴퓨터종합학술대회)
- KCSE 2026 (한국소프트웨어공학학술대회)
- AI Korea 2026
- Google I/O Extended Seoul 2026
- DEVIEW 2026 (NAVER)
- if(kakao) 2026

**각 학회별 JSON 형태:**
```json
{
  "name": "ACL 2026",
  "full_name": "Annual Meeting of the Association for Computational Linguistics",
  "start_date": "2026-MM-DD",
  "end_date": "2026-MM-DD",
  "location": "City, Country",
  "venue": "Convention Center Name",
  "submission_deadline": "2026-MM-DD",
  "notification_date": "2026-MM-DD",
  "tier": "A*",
  "topics": ["NLP", "Computational Linguistics", "Machine Translation"],
  "website": "https://...",
  "estimated": false,
  "notes": "confirmed from official website / estimated based on past patterns"
}
```

`estimated` 필드: 공식 발표된 날짜면 false, 과거 패턴 기반 추정이면 true

---

## 4. 한국 AI 정책 현황 (2025-2026)

### 4.1 AI 기본법 상세
```json
{
  "title": "인공지능 산업 육성 및 신뢰 기반 조성에 관한 법률",
  "short_name": "AI 기본법",
  "status": "Enacted",
  "enacted_date": "2025-01-09",
  "effective_date": "2026-01-22",
  "country": "South Korea",
  "region": "한국",
  "description_ko": "200자 이내 핵심 내용 한국어 설명",
  "key_provisions": [
    "조항1: 내용",
    "조항2: 내용",
    "조항3: 내용",
    "조항4: 내용",
    "조항5: 내용"
  ],
  "impact_areas": ["산업 육성", "윤리", "안전", "개인정보"],
  "source_url": "법제처 또는 국회 URL",
  "summary": "300자 이내 한국어 요약"
}
```

### 4.2 한국 정부 AI 정책 (2025-2026) 5개 이상
과기정통부, 개인정보보호위원회, NIA, 디지털플랫폼정부 등에서 발표한 주요 AI 정책/가이드라인을 찾아줘.

각각 아래 JSON으로:
```json
{
  "title": "정책명",
  "organization": "과학기술정보통신부",
  "status": "Active",
  "announced_date": "2025-MM-DD",
  "effective_date": "2026-MM-DD",
  "country": "South Korea",
  "region": "한국",
  "policy_type": "가이드라인",
  "description_ko": "핵심 내용 200자 이내",
  "impact_areas": ["관련 분야"],
  "source_url": "출처 URL",
  "summary": "300자 이내 한국어 요약"
}
```

### 4.3 주요 해외 정책 (JSON 형태로 각각)
- **EU AI Act**: 2026년 2월 기준 시행 단계, 주요 규제 내용, 한국 기업 영향
- **미국**: Biden AI 행정명령 현황, 트럼프 행정부 AI 정책 변화 (2025-2026)
- **중국**: 생성형 AI 관리법, 딥페이크 규제, AI 산업 지원 정책
- **일본**: AI 전략 2026, 저작권법 AI 관련 개정

### 4.4 한국 정책 뉴스 RSS 피드
아래 사이트들의 **정확한 RSS/Atom 피드 URL**을 찾아줘:
- 과학기술정보통신부 (msit.go.kr)
- 개인정보보호위원회 (pipc.go.kr)
- 한국지능정보사회진흥원 NIA (nia.or.kr)
- 법제처 (moleg.go.kr) - 최신법령 RSS
- 국회 의안정보시스템 (likms.assembly.go.kr)

```json
{
  "organization": "과학기술정보통신부",
  "rss_url": "https://...",
  "status": "active|inactive|not_available",
  "notes": "RSS 없으면 대안 (뉴스룸 URL, API 등)"
}
```

---

## 5. 한국 AI 채용 API 조사

### 5.1 원티드 (wanted.co.kr)
- 공개 API 존재 여부
- API 문서 URL
- 인증 방식 (API Key, OAuth 등)
- AI/ML 직종 검색 파라미터
- Rate limit
- Python httpx 코드 예시

### 5.2 사람인 (saramin.co.kr)
- 오픈 API 문서 URL
- 인증 방식
- AI 키워드 검색 방법
- 응답 형태 (JSON/XML)
- Python httpx 코드 예시

### 5.3 공공데이터포털 워크넷 API
- 신청 URL (data.go.kr)
- AI/IT 직종 코드
- 검색 파라미터
- Python httpx 코드 예시

### 5.4 기타 한국 채용 소스
- 점핏 (jumpit.co.kr) - API 있는지
- 로켓펀치 (rocketpunch.com) - API 있는지
- LinkedIn Korea - AI 직종 검색

각각 JSON 형태로:
```json
{
  "platform": "원티드",
  "api_available": true,
  "api_docs_url": "https://...",
  "auth_method": "API Key / OAuth / None",
  "ai_search_params": {"keyword": "AI", "category": "개발"},
  "rate_limit": "100 req/hour",
  "response_format": "JSON",
  "python_example": "httpx 코드 5줄 이내",
  "notes": "제한사항 등"
}
```

---

## 6. AI 플랫폼 최신 현황 (2026년 2월)

현재 앱에 30개 플랫폼이 등록되어 있어. **각 플랫폼의 2026년 2월 기준 최신 정보**를 업데이트해줘.

특히 아래 정보가 필요해:

### 주요 20개 플랫폼
ChatGPT, Claude, Gemini, Grok, Perplexity, HyperCLOVA X, Llama, Mistral, Midjourney, Runway, Sora, Stable Diffusion, ElevenLabs, Suno, GitHub Copilot, Cursor, Replit, Notion AI, Pika Labs, Leonardo.ai

**각 플랫폼 JSON:**
```json
{
  "name": "ChatGPT",
  "company": "OpenAI",
  "latest_version": "GPT-5.3 / o3",
  "pricing": {
    "free": "무료 (GPT-4o mini)",
    "plus": "$20/월 (GPT-4o, o3-mini)",
    "pro": "$200/월 (o3, 무제한)"
  },
  "new_features_2026": [
    "2026년에 추가된 주요 기능 1",
    "2026년에 추가된 주요 기능 2"
  ],
  "korean_support": "full",
  "monthly_active_users": "약 3억명",
  "category": "LLM/Chatbot",
  "website": "https://chat.openai.com",
  "last_major_update": "2026-MM-DD",
  "rating": 4.9,
  "description_ko": "GPT 시리즈 기반 AI 챗봇. 텍스트, 이미지, 코드 생성 지원.",
  "key_features_ko": ["멀티모달", "코드 인터프리터", "플러그인", "GPTs", "메모리"]
}
```

korean_support 값: "full" (한국어 완벽) | "partial" (기본 지원) | "none" (미지원)

---

## 7. 추가 데이터 품질 확인

### 7.1 arXiv 카테고리
현재 5개 카테고리(cs.AI, cs.LG, cs.CL, cs.CV, cs.NE)를 수집 중인데, AI 트렌드 추적에 **추가하면 좋을 arXiv 카테고리** 5개를 추천해줘:
```json
{
  "category_id": "cs.RO",
  "category_name": "Robotics",
  "relevance": "AI 로봇공학 논문, 최근 embodied AI 트렌드와 직결",
  "monthly_papers": "약 200편",
  "recommend_priority": "high"
}
```

### 7.2 GitHub 검색 키워드
현재 8개 토픽(machine-learning, artificial-intelligence, deep-learning, neural-network, pytorch, tensorflow, llm, transformers)으로 검색 중인데, **2026년 트렌드를 반영한 추가 키워드** 10개를 추천해줘:
```json
{
  "topic": "rag",
  "description": "Retrieval-Augmented Generation - LLM + 검색 결합",
  "github_repos_count": "약 5,000개",
  "trend": "급상승",
  "recommend_priority": "high"
}
```

---

## 출력 형식 요약

모든 결과를 **섹션별로 구분**해서 JSON 배열로 정리해줘.

```
## 1. YouTube 채널 검증 결과
### 1.1 한국 채널 (기존 12개)
[JSON 배열]
### 1.2 해외 채널 (기존 13개)
[JSON 배열]
### 1.3 추가 후보 검증
[JSON 배열]
### 1.4 신규 추천
[JSON 배열]

## 2. RSS 피드 검증 결과
### 2.1 기존 피드 (14개)
[JSON 배열]
### 2.2 신규 추천 (5개)
[JSON 배열]

## 3. 컨퍼런스 일정
### 3.1 기존 6개 검증
[JSON 배열]
### 3.2 추가 학회 (국제)
[JSON 배열]
### 3.3 추가 학회 (한국)
[JSON 배열]

## 4. 정책 데이터
### 4.1 AI 기본법
[JSON]
### 4.2 한국 정부 정책
[JSON 배열]
### 4.3 해외 주요 정책
[JSON 배열]
### 4.4 정책 RSS 피드
[JSON 배열]

## 5. 채용 API 조사
[JSON 배열]

## 6. AI 플랫폼 최신 현황
[JSON 배열]

## 7. 추가 데이터 품질
### 7.1 arXiv 카테고리 추천
[JSON 배열]
### 7.2 GitHub 키워드 추천
[JSON 배열]
```

이 데이터는 바로 Python 코드에 반영할 거라서, **JSON 형식이 정확**해야 해. 추측이 아닌 **확인된 사실** 위주로, 확실하지 않은 것은 `"estimated": true` 또는 `"confidence": "low"` 를 붙여줘.

감사합니다!
