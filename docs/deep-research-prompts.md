# AI Trend Tracker v2.0 - 딥 리서칭 프롬프트

## 프롬프트 1: Gemini용 (한국 데이터 + AI 서비스 중심)

아래 프롬프트를 Gemini Deep Research에 그대로 복사해서 사용하세요.

---

```
나는 "AI Trend Tracker"라는 AI 트렌드 큐레이션 웹서비스를 개발하고 있어. FastAPI(백엔드) + Next.js(프론트엔드) 기술 스택이야.
아래 6개 카테고리에 대해 최신 데이터를 조사해줘. 2025~2026년 기준으로 정확한 정보만 줘.

## 1. AI 유튜버 채널 목록 (한국 + 해외)

### 한국 AI/IT 유튜버 (최소 15명)
다음 유튜버들의 **YouTube 채널 ID**를 찾아줘 (UCxxxxxxx 형태):
- 코드팩토리, 노마드코더, 조코딩, 테크과학, 생활코딩, 나도코딩

추가로 한국에서 AI/머신러닝/딥러닝/IT 트렌드를 다루는 유명 유튜버를 **최소 10명 더** 찾아줘.
각 유튜버마다 아래 정보를 표 형태로 정리해줘:
- 채널명 (한국어)
- YouTube 채널 ID (UC로 시작하는 고유 ID)
- 구독자 수 (대략적)
- 주요 콘텐츠 (AI뉴스, 코딩교육, 논문리뷰, 기술트렌드 등)
- 업로드 빈도 (주1회, 주2-3회 등)

### 해외 AI 유튜버 (최소 15명)
다음 채널들의 YouTube 채널 ID를 찾아줘:
- Fireship, Two Minute Papers, Yannic Kilcher, AI Explained

추가로 영어권에서 AI/ML을 다루는 유명 유튜버를 **최소 10명 더** 찾아줘:
- 채널명
- YouTube 채널 ID
- 구독자 수
- 주요 콘텐츠 유형
- 업로드 빈도

**중요**: 채널 ID는 YouTube 채널 URL에서 확인 가능해 (youtube.com/channel/UCxxxxxx). 정확한 ID를 찾아줘.

## 2. 주요 AI 플랫폼 & 서비스 상세 정보 (2025-2026년 기준)

아래 AI 서비스들의 **최신 정보**를 구조화된 표로 정리해줘:

### 대상 서비스 (최소 20개):
ChatGPT, Gemini, Claude, Grok, Perplexity AI, Microsoft Copilot, NotebookLM,
Midjourney, DALL-E 3, Stable Diffusion, Runway ML, Suno AI, ElevenLabs,
GitHub Copilot, Cursor AI, Replit AI, Hugging Face, Replicate,
Meta AI, Apple Intelligence, Samsung Galaxy AI, 뤼튼(Wrtn), AskUp

각 서비스별 정보:
| 항목 | 내용 |
|------|------|
| 서비스명 | (한글 + 영문) |
| 운영사 | |
| 공식 URL | |
| 최신 모델명 | (예: GPT-4o, Gemini 2.0 Flash 등) |
| 주요 기능 | (3-5개 bullet point) |
| 카테고리 | (챗봇/이미지생성/코드/음성/영상/생산성/검색) |
| 가격 (무료 플랜) | |
| 가격 (유료 플랜) | |
| 지원 플랫폼 | (Web, iOS, Android, API 등) |
| 한국어 지원 여부 | (O/X/부분) |
| 주요 업데이트 (2025) | |

## 3. 2026년 AI/ML 주요 학회 & 컨퍼런스 일정

다음 학회들의 **2026년 일정**을 찾아줘:

### Tier A* (최상위):
NeurIPS 2026, ICML 2026, ICLR 2026, CVPR 2026, AAAI 2026, IJCAI 2026, ACL 2026

### Tier A:
EMNLP 2026, NAACL 2026, ECCV 2026, ICCV 2026, SIGKDD 2026, WWW 2026,
COLING 2026, INTERSPEECH 2026

### 한국 관련 (국내 개최 또는 한국 참여 많은 학회):
KCSE 2026, 한국정보과학회 학술대회, KCC 2026

각 학회별:
| 항목 | 내용 |
|------|------|
| 학회명 (약어) | |
| 정식 명칭 | |
| 개최 일정 | (YYYY-MM-DD ~ YYYY-MM-DD) |
| 개최 장소 | |
| 논문 제출 마감일 | |
| 결과 발표일 | |
| Tier | (A*/A/B) |
| 웹사이트 URL | |
| 주요 분야 | (CV, NLP, ML, Robotics 등) |

**참고**: 아직 2026년 일정이 확정되지 않은 학회는 "미확정"이라고 표시하되, 과거 패턴 기반 예상 일정도 함께 적어줘.

## 4. 한국 AI 뉴스 RSS 피드 (실제 작동 확인)

한국 IT/AI 뉴스 사이트의 **실제 작동하는 RSS 피드 URL**을 찾아줘:

### 확인이 필요한 소스:
- 전자신문 (etnews.com)
- ZDNet Korea (zdnet.co.kr)
- AI타임스 (aitimes.com)
- 블로터 (bloter.net)
- IT조선 (it.chosun.com)
- 매일경제 IT/과학 (mk.co.kr)
- 한국경제 IT (hankyung.com)
- 디지털타임스 (dt.co.kr)
- 테크M (techm.kr)
- AI신문 (alnews.co.kr)

각 소스별:
| 항목 | 내용 |
|------|------|
| 매체명 | |
| RSS 피드 URL | (정확한 URL) |
| RSS 작동 여부 | (확인 가능하면) |
| AI/IT 카테고리 피드 있는지 | |
| 기사 갱신 빈도 | |
| 한글 기사 비율 | |

## 5. 한국 AI 정책 & 규제 현황 (2024-2026)

### 한국:
- 인공지능 기본법 (AI 기본법) 현황
- 과학기술정보통신부 AI 관련 정책
- 개인정보보호위원회 AI 관련 규제
- AI 윤리기준
- 최신 정책 뉴스 RSS/소스

### 글로벌 주요 규제:
- EU AI Act 시행 일정 및 주요 내용
- 미국 AI Executive Order 현황
- 중국 AI 규제 현황 (생성형 AI 관리 방법 등)
- 일본 AI 전략

각 정책별 한글 설명 + 출처 URL을 포함해줘.

## 6. 한국 채용 플랫폼 API 접근 방법

아래 한국 채용 플랫폼에서 AI 채용 데이터를 가져오는 방법을 조사해줘:

| 플랫폼 | 조사 항목 |
|--------|----------|
| 원티드 (wanted.co.kr) | 공개 API 여부, API 문서 URL, 접근 방법 |
| 사람인 (saramin.co.kr) | 공개 API 여부, API 문서 URL |
| 잡코리아 (jobkorea.co.kr) | 공개 API 여부, API 문서 URL |
| 로켓펀치 (rocketpunch.com) | 공개 API 여부 |
| 프로그래머스 (programmers.co.kr) | 공개 API 또는 채용 페이지 크롤링 가능 여부 |

API가 없는 경우:
- RSS 피드 존재 여부
- 채용 페이지 구조 (크롤링 가능성)
- 대안적 데이터 접근 방법

---

**출력 형식**: 각 섹션별로 구조화된 표 + JSON 형태로 정리해줘.
특히 유튜버 채널 ID와 RSS URL은 실제로 접속 가능한 정확한 값이어야 해.
```

---

## 프롬프트 2: ChatGPT용 (프론트엔드 기술 구현 + API 통합)

아래 프롬프트를 ChatGPT Deep Research에 그대로 복사해서 사용하세요.

---

```
I'm building an "AI Trend Tracker" web application with Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui. The app has a dark glassmorphism theme (background: #0a0a0f) with interactive data visualizations.

I need deep research on the following 5 technical implementation areas. For each area, provide working code examples, best practices, and links to documentation.

## 1. D3.js Interactive Word Cloud in Next.js (React 18)

I need to implement a keyword cloud visualization for my dashboard. Requirements:
- Built with D3.js (d3-cloud or d3-force layout)
- Interactive: hover shows frequency count, click filters by keyword
- Category-based coloring (each keyword has a source category with a specific color)
- Responsive (resizes with container)
- Works with "use client" in Next.js App Router
- Dark theme compatible (white/colored text on dark background)

Research and provide:
- Best D3.js word cloud library for React 18 (d3-cloud vs react-wordcloud vs custom)
- Complete implementation example with TypeScript
- Performance optimization for 100+ keywords
- Animation on initial render (keywords flying in)
- How to handle SSR issues with D3.js in Next.js

Data format I'll receive from API:
```json
{
  "keywords": [
    {"keyword": "LLM", "count": 45, "category": "papers", "trend": "up"},
    {"keyword": "RAG", "count": 38, "category": "github", "trend": "up"},
    {"keyword": "GPT-5", "count": 32, "category": "news", "trend": "new"}
  ]
}
```

## 2. Recharts Trend Timeline Chart

I need a multi-line trend chart showing keyword frequency over time (4 weeks). Requirements:
- recharts LineChart with multiple series
- Dark theme styling (dark background, light grid lines, colored lines)
- Interactive tooltip showing all keywords at hover point
- Legend with keyword color mapping
- "This week vs Last week" comparison mode
- Responsive design
- Framer Motion animation on mount

Provide:
- Complete TypeScript component code
- Custom dark theme configuration for recharts
- How to integrate with shadcn/ui Card component
- Mobile-responsive approach

Data format:
```json
{
  "timeline": [
    {"date": "2026-01-06", "LLM": 12, "RAG": 8, "GPT-5": 5},
    {"date": "2026-01-13", "LLM": 15, "RAG": 12, "GPT-5": 8}
  ]
}
```

## 3. Conference Calendar Visualization (Monthly Grid)

I need a monthly calendar view for AI conferences. Requirements:
- Monthly grid showing conference dates as colored bars
- Click on conference shows detail modal
- Deadline countdown for upcoming submission deadlines
- Color-coded by tier (A* = gold, A = silver, B = blue)
- Navigation between months
- Works with shadcn/ui components

Research and provide:
- Best calendar library for React/Next.js (react-big-calendar vs custom grid vs shadcn calendar)
- Implementation approach for conference date ranges on calendar
- Countdown timer component for deadlines
- Mobile-friendly calendar layout

## 4. Breaking News Ticker with Framer Motion

I need an auto-scrolling horizontal news ticker. Requirements:
- Framer Motion infinite horizontal scroll animation
- Pauses on hover
- Shows latest 10 news items with source badge
- Glassmorphism style (bg-white/5 backdrop-blur)
- Responsive (adjusts to container width)
- Smooth infinite loop (no jump/gap when repeating)

Provide:
- Complete Framer Motion implementation
- CSS approach for seamless infinite scroll
- Performance considerations
- Accessibility considerations (reduced-motion preference)

## 5. API Integration Architecture for Next.js App Router

My backend (FastAPI) provides these endpoints (all require X-API-Key header):
- GET /api/v1/dashboard/summary
- GET /api/v1/dashboard/trending-keywords
- GET /api/v1/dashboard/category-stats
- GET /api/v1/{category} (huggingface, youtube, papers, news, github, conferences, tools, jobs, policies)
- GET /api/v1/system/status

Research the best approach for:
- Server Components vs Client Components data fetching strategy
- API client with automatic retry and error handling
- SWR vs React Query vs native fetch for client-side data
- Loading skeletons and error boundaries
- Authentication token management (API key stored in env)
- Caching strategy (revalidation intervals per endpoint)
- Type-safe API client with Zod validation

Provide:
- Complete api.ts utility with fetch wrapper
- useApi custom hook with loading/error states
- Example page showing Server Component + Client Component pattern
- Error boundary component

---

**Output format**: For each section, provide:
1. Recommended approach with pros/cons
2. Complete working TypeScript code
3. Dependencies to install (npm packages)
4. Links to official documentation
5. Common pitfalls to avoid
```

---

## 사용 가이드

### Gemini에게 주는 프롬프트 (프롬프트 1)
- **목적**: 한국 데이터 수집 (유튜버, 뉴스 RSS, 정책, 채용 API)
- **기대 결과**: JSON/표 형태의 구조화된 데이터
- **활용**: 백엔드 서비스 코드에 직접 반영 (채널 ID, RSS URL, 플랫폼 데이터 등)

### ChatGPT에게 주는 프롬프트 (프롬프트 2)
- **목적**: 프론트엔드 기술 구현 레퍼런스
- **기대 결과**: 실제 동작하는 TypeScript/React 코드
- **활용**: Phase 4-5 프론트엔드 구현 시 참고자료

### 리서치 결과를 받은 후
1. Gemini 결과 → `docs/research/gemini-data.md`에 저장
2. ChatGPT 결과 → `docs/research/chatgpt-frontend.md`에 저장
3. Claude에게 "리서치 결과 반영해줘"라고 요청하면 코드에 통합
