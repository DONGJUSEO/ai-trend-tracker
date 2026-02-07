# Ain싸 - AI Trending

> **9개 카테고리로 보는 AI 트렌드 큐레이션 서비스**

AI 업계의 최신 트렌드를 자동 수집하고, Gemini AI로 한글 요약하여 제공하는 풀스택 웹 서비스입니다.

**Demo**: [프론트엔드](https://ai-trend-tracker-beta.vercel.app) | [백엔드 API](https://ai-trend-tracker-production.up.railway.app/docs)

---

## 프로젝트 개요

### 9개 AI 트렌드 카테고리

| 카테고리 | 아이콘 | 설명 | 데이터 소스 |
|---------|-------|------|-----------|
| **Hugging Face** | 🤗 | 최신 AI 모델 트렌드, 태스크별 분류 | Hugging Face API |
| **YouTube** | 📺 | 큐레이팅된 AI 유튜버 채널 영상 요약 | YouTube Data API |
| **AI 논문** | 📄 | arXiv 최신 논문 한글 요약 | arXiv API |
| **AI 뉴스** | 📰 | 한국 뉴스 중심 (전자신문, AI타임스 등) | RSS Feeds |
| **GitHub** | 💻 | 3개월 이내 AI 오픈소스 트렌딩 | GitHub API |
| **컨퍼런스** | 🎤 | 2026년 AI 학회/세미나 캘린더 | WikiCFP, AI Deadlines |
| **AI 플랫폼** | 🤖 | ChatGPT, Gemini, Claude 등 주요 서비스 | 구조화 데이터 |
| **AI 채용** | 💼 | AI/ML 채용 공고 (직무별/지역별) | RemoteOK API, RSS |
| **AI 정책** | 📜 | 한국/EU/미국/중국 AI 정책 동향 | 정부 RSS, AI News |

### 주요 기능

- **프리미엄 대시보드**: 키워드 모멘텀, 카테고리 통계, 위클리 다이제스트, 한국 AI 하이라이트
- **자동 수집**: APScheduler 크론 기반 데이터 자동 수집
- **AI 요약**: Google Gemini API로 한글 요약 자동 생성
- **Redis 캐싱**: API 응답 캐싱으로 빠른 로딩
- **관리자 인증**: JWT 기반 관리자 전용 시스템 페이지
- **PWA 지원**: 모바일 앱처럼 설치 가능
- **반응형 UI**: 글래스모피즘 다크 테마, Framer Motion 애니메이션

---

## 기술 스택

### 프론트엔드 (v2.0 - Next.js)
| 기술 | 용도 |
|------|------|
| **Next.js 14** (App Router) | SSR/SSG 프레임워크 |
| **TypeScript** | 타입 안정성 |
| **Tailwind CSS** | 유틸리티 CSS |
| **shadcn/ui** | UI 컴포넌트 |
| **Framer Motion** | 애니메이션 |

### 백엔드
| 기술 | 용도 |
|------|------|
| **FastAPI** | 비동기 Python API |
| **PostgreSQL 15** | 데이터베이스 |
| **Redis** | 캐싱 |
| **SQLAlchemy 2.0** | 비동기 ORM |
| **Alembic** | DB 마이그레이션 |
| **APScheduler** | 크론 스케줄링 |
| **Google Gemini** | AI 한글 요약 |

### 배포
| 서비스 | 용도 |
|--------|------|
| **Railway** | 백엔드 API + PostgreSQL + Redis |
| **Vercel** | 프론트엔드 호스팅 |
| **Docker Compose** | 로컬 개발 환경 |

---

## 프로젝트 구조

```
fastapi-starter/
├── app/                          # 백엔드 (FastAPI)
│   ├── main.py                   # 앱 진입점
│   ├── config.py                 # 환경 변수
│   ├── database.py               # DB 연결
│   ├── cache.py                  # Redis 캐싱
│   ├── api/v1/                   # API 라우터
│   │   ├── dashboard.py          # 대시보드 통계 API
│   │   ├── admin.py              # 관리자 인증 API
│   │   ├── huggingface.py
│   │   ├── youtube.py
│   │   ├── papers.py
│   │   ├── news.py
│   │   ├── github.py
│   │   ├── conferences.py
│   │   ├── tools.py              # AI 플랫폼
│   │   ├── jobs.py
│   │   ├── policies.py
│   │   └── system.py             # 시스템 상태
│   ├── models/                   # SQLAlchemy 모델 (9개)
│   ├── schemas/                  # Pydantic 스키마
│   └── services/                 # 데이터 수집 서비스
│
├── web-next/                     # 프론트엔드 (Next.js 14)
│   ├── src/
│   │   ├── app/                  # App Router 페이지
│   │   │   ├── page.tsx          # 대시보드 (홈)
│   │   │   ├── login/            # 관리자 로그인
│   │   │   ├── huggingface/
│   │   │   ├── youtube/
│   │   │   ├── papers/
│   │   │   ├── news/
│   │   │   ├── github/
│   │   │   ├── conferences/
│   │   │   ├── platforms/
│   │   │   ├── jobs/
│   │   │   ├── policies/
│   │   │   └── system/           # 관리자 전용
│   │   ├── components/
│   │   │   ├── dashboard/        # 대시보드 위젯
│   │   │   ├── layout/           # Sidebar, TopBar, MobileNav
│   │   │   ├── shared/           # 공통 컴포넌트
│   │   │   └── ui/               # shadcn/ui
│   │   └── lib/                  # API 클라이언트, 타입, 유틸
│   ├── public/
│   │   ├── logo.png              # Ain싸 로고
│   │   ├── manifest.json         # PWA 매니페스트
│   │   └── icons/                # PWA 아이콘
│   └── vercel.json               # Vercel API 프록시 설정
│
├── alembic/                      # DB 마이그레이션
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## 빠른 시작

### 사전 요구사항

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (권장)

### Docker로 실행 (권장)

```bash
# 프로젝트 클론
git clone https://github.com/DONGJUSEO/ai-trend-tracker.git
cd ai-trend-tracker

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 API 키 입력

# Docker 컨테이너 실행 (API + PostgreSQL + Redis)
docker compose up -d

# 프론트엔드 실행
cd web-next
npm install
npm run dev
```

- 백엔드 API: http://localhost:8000/docs
- 프론트엔드: http://localhost:3000

### 수동 실행

```bash
# 백엔드
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 프론트엔드
cd web-next
npm install
npm run dev
```

---

## API 엔드포인트

모든 API는 `/api/v1/` 프리픽스, `X-API-Key` 헤더 인증 필요.

### 대시보드 API
| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/v1/dashboard/summary` | 전체 카테고리 통계 |
| `GET /api/v1/dashboard/trending-keywords` | 트렌딩 키워드 |
| `GET /api/v1/dashboard/category-stats` | 카테고리별 트렌드 |

### 카테고리 API
| 엔드포인트 | 응답 키 |
|-----------|---------|
| `GET /api/v1/huggingface/` | `items` |
| `GET /api/v1/youtube/videos` | `videos` |
| `GET /api/v1/papers/` | `papers` |
| `GET /api/v1/news/news` | `news` |
| `GET /api/v1/github/projects` | `items` |
| `GET /api/v1/conferences/` | `items` |
| `GET /api/v1/tools/` | `items` |
| `GET /api/v1/jobs/` | `items` |
| `GET /api/v1/policies/` | `items` |

### 관리자 API
| 엔드포인트 | 설명 |
|-----------|------|
| `POST /api/v1/admin/login` | 관리자 로그인 (JWT 발급) |
| `GET /api/v1/admin/verify` | 토큰 유효성 확인 |
| `GET /api/v1/system/status` | 시스템 상태 |

---

## 환경 변수

### 백엔드 (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ai_trends
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key
GITHUB_TOKEN=your_github_token
HUGGINGFACE_API_KEY=your_hf_token
APP_PASSWORD=your_api_key
ADMIN_PASSWORD=admin1234
JWT_SECRET_KEY=your_secret_key
```

### 프론트엔드 (.env.development)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=test1234
```

---

## 배포

### Railway (백엔드)
1. GitHub 연동 (main 푸시 시 자동 배포)
2. PostgreSQL + Redis 서비스 추가
3. 환경 변수 설정

### Vercel (프론트엔드)
1. GitHub 연동
2. 설정:
   - **Root Directory**: `web-next`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
3. 환경 변수 (선택):
   - `NEXT_PUBLIC_API_KEY`: API 키
   - `NEXT_PUBLIC_API_URL`은 설정하지 않음 (vercel.json 리라이트가 프록시 처리)

> vercel.json이 `/api/*` 요청을 Railway 백엔드로 프록시합니다.

---

## 버전 히스토리

### v2.0.0 (2026-02-07) - 대규모 고도화
- Next.js 14 + TypeScript + shadcn/ui 프론트엔드 전면 재구축
- 글래스모피즘 다크 테마 + Framer Motion 애니메이션
- 프리미엄 대시보드 (키워드 모멘텀, 카테고리 통계, 위클리 다이제스트)
- 9개 카테고리 페이지 재설계 (리더보드, 스타트업 삭제)
- Redis 캐싱, 대시보드 전용 API 추가
- 한국 뉴스 소스 중심 데이터 수집
- 관리자 JWT 인증 시스템
- Ain싸 브랜딩 + 커스텀 로고
- PWA 매니페스트 + 앱 아이콘

### v0.3.2 (2026-02-02)
- 11개 카테고리 SvelteKit 프론트엔드
- Railway + Vercel 초기 배포
- PWA 지원 추가

---

## 개발자

- **서동주** ([@DONGJUSEO](https://github.com/DONGJUSEO))
- AI 개발 어시스턴트: **Claude Opus 4.6** (Anthropic)

---

## 라이선스

MIT License

**마지막 업데이트**: 2026-02-07 | **버전**: v2.0.0
