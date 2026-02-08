<p align="center">
  <img src="web-next/public/logo.jpg" alt="AI봄 Logo" width="120" height="120" style="border-radius: 20px;" />
</p>

<h1 align="center">AI봄 - AI Trend Tracker</h1>

<p align="center">
  <strong>9개 카테고리로 보는 AI 트렌드 큐레이션 서비스</strong><br />
  "AI를 본다 + 봄(Spring)" — 한국 AI 개발자를 위한 올인원 트렌드 대시보드
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v4.0.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.128-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Gemini_2.0_Flash-한글요약-4285F4?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Ollama-로컬LLM-000000?style=flat-square" alt="Ollama" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://ai-trend-tracker-beta.vercel.app">🌐 Live Demo</a> &bull;
  <a href="#빠른-시작">빠른 시작</a> &bull;
  <a href="#기술-스택">기술 스택</a> &bull;
  <a href="#api-엔드포인트">API 문서</a> &bull;
  <a href="#배포">배포</a>
</p>

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [라이브 데모](#라이브-데모)
- [v4.0 주요 변경사항](#v40-주요-변경사항)
- [시스템 아키텍처](#시스템-아키텍처)
- [9개 AI 트렌드 카테고리](#9개-ai-트렌드-카테고리)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [빠른 시작](#빠른-시작)
- [환경 변수 설정](#환경-변수-설정)
- [API 엔드포인트](#api-엔드포인트)
- [데이터 수집 파이프라인](#데이터-수집-파이프라인)
- [테스트](#테스트)
- [배포](#배포)
- [버전 히스토리](#버전-히스토리)
- [개발자](#개발자)
- [라이선스](#라이선스)

---

## 프로젝트 소개

**AI봄**은 AI 업계의 최신 트렌드를 9개 카테고리로 자동 수집하고, Gemini 2.0 Flash + Ollama 하이브리드 AI로 한글 요약하여 제공하는 **풀스택 웹 서비스**입니다.

카테고리별 최적 주기로 Hugging Face, YouTube, arXiv, GitHub, 뉴스 RSS, 컨퍼런스, AI 플랫폼, 채용 공고, AI 정책 등 다양한 소스에서 데이터를 자동 수집합니다.

### 핵심 가치

| 가치 | 설명 |
|------|------|
| **시간 절약** | 15개 사이트를 돌아다니지 않고, 한 화면에서 AI 트렌드 파악 |
| **한국어** | 모든 영어 콘텐츠를 AI가 자동 한글 요약 (Gemini + Ollama 하이브리드) |
| **보안** | 서버사이드 인증, API Key 프록시 전용, 기본 비밀번호 제거 |
| **상용화 품질** | 글래스모피즘 UI, SVG 아이콘, pipeline_tag 색상 코딩 |
| **스마트 수집** | 카테고리별 최적 주기 (뉴스 1시간 ~ 플랫폼 매주) |

---

## 라이브 데모

| 서비스 | URL | 상태 |
|--------|-----|------|
| **프론트엔드 (Vercel)** | [ai-trend-tracker-beta.vercel.app](https://ai-trend-tracker-beta.vercel.app) | ✅ Production |
| **백엔드 API (Railway)** | [ai-trend-tracker-production.up.railway.app](https://ai-trend-tracker-production.up.railway.app/docs) | ✅ Production |

> 비밀번호는 환경변수로 설정됩니다 (기본값 없음).

---

## v4.0 주요 변경사항

> 2026-02-08 | v3.1 → v4.0 보안/아키텍처/데이터 대규모 강화

### 보안 & 신뢰성 (Phase A)

| 변경 | 상세 |
|------|------|
| **인증 경계 재설계** | NEXT_PUBLIC_API_KEY 제거, Next.js 서버 프록시에서만 API Key 주입 |
| **기본 비밀번호 제거** | APP_PASSWORD/ADMIN_PASSWORD/JWT_SECRET_KEY 미설정 시 기동 실패 |
| **관리자 인증 우회 제거** | 서버 검증 실패 = 무조건 비인증 처리 |
| **Papers 라우트 충돌 수정** | 정적 라우트 우선 선언 + arxiv_id 정규식 검증 |
| **Alembic 마이그레이션 재구성** | DROP 기반 → CREATE TABLE 기반 초기 리비전 |

### 운영 안정성 (Phase B)

| 변경 | 상세 |
|------|------|
| **start.sh fail-fast** | 마이그레이션 실패 시 서버 기동 중단 (`set -e`) |
| **프록시 기본값 제거** | BACKEND_URL 미설정 시 500 에러 (프로덕션 URL 하드코딩 제거) |
| **debug 기본값 False** | config.py `debug=True` → `debug=False` |
| **Python 3.11 업그레이드** | Dockerfile 베이스 이미지 python:3.9 → python:3.11-slim |

### 아키텍처 정리 (Phase C)

| 변경 | 상세 |
|------|------|
| **단일 API Client** | 12개 페이지 중복 API 호출 → `apiFetcher` 하나로 통합 |
| **공통 ErrorState** | 에러/로딩/빈 상태 공통 컴포넌트 |
| **비동기 Gemini** | `generate_content_async()` 사용, 이벤트 루프 차단 제거 |
| **Redis HyperLogLog 방문자** | IP 기반 HLL 추적 (12KB로 수백만 UV) |

### 데이터 확장 (Phase D)

| 카테고리 | 변경 |
|---------|------|
| **YouTube** | 해외 채널 제거, 한국어 전용 18개 채널 |
| **Papers** | 18개 토픽 세분화 (LLM, Diffusion, 로보틱스, AI에이전트 등) |
| **GitHub** | 19개 검색 쿼리, Star Velocity 발굴 |
| **News** | 자동 토픽 분류 (정책/기업동향/기술발전/제품출시/AI 일반) |
| **Jobs** | 16개 직무 카테고리 (AI PM, AI 윤리, 프롬프트 엔지니어 등) |
| **HuggingFace** | pipeline_tag 색상 코딩, created_at 우선 표시 |
| **Conferences** | 한국 이벤트 추가, 타입/티어 단일 뷰 |
| **Policies** | 한국+글로벌 소스 확장 |
| **Platforms** | 데이터 출처 표시 |

### 하이브리드 AI 요약 (Phase E)

| 변경 | 상세 |
|------|------|
| **Ollama 통합** | Docker Compose에 Ollama 서비스 추가 |
| **Gemini → Ollama 폴백** | Gemini 실패 시 로컬 LLM으로 자동 전환 |
| **한국어 특화** | SOLAR-10.7B (Q4) 로컬 추론 |

### 테스트 & CI (Phase F)

| 변경 | 상세 |
|------|------|
| **4종 자동화 테스트** | 마이그레이션, 인증, 라우팅, 분류기 회귀 테스트 |
| **PWA 아이콘 통일** | 로고.jpg 기반 icon-192/512, apple-touch-icon 생성 |

---

## 시스템 아키텍처

```
                      +-------------------+
                      |   사용자 (브라우저)  |
                      +--------+----------+
                               |
                      +--------v----------+
                      |   Next.js 14       |
                      |   서버 프록시       |
                      |   (API Key 주입)   |
                      +--------+----------+
                               |
                      +--------v----------+
                      |   FastAPI Server   |
                      |   Python 3.11     |
                      +--+------+------+--+
                         |      |      |
              +----------+  +---+---+  +----------+
              |             |       |             |
              v             v       v             v
     +----------------+ +------+ +----------+ +----------+
     | PostgreSQL 15  | | Redis| | APScheduler| | Gemini  |
     | + Alembic      | | HLL  | | (카테고리별 | | 2.0     |
     | + 9 테이블     | | 방문자| |  최적 주기) | | Flash   |
     +----------------+ +------+ +----------+ +----------+
                                      |             |
                         +------------+-------+     |
                         |            |        |    v
                         v            v        v  +--------+
                    [HF API]   [YouTube]  [arXiv] | Ollama |
                    [GitHub]   [RSS Feeds] [Jobs] | (폴백) |
                    [RemoteOK] [구조화 데이터]      +--------+
```

---

## 9개 AI 트렌드 카테고리

| # | 카테고리 | 데이터 소스 | 수집 주기 | 세분화 |
|---|---------|-----------|----------|--------|
| 1 | **Hugging Face** | Hugging Face Hub API | 매 6시간 | pipeline_tag 색상 코딩 |
| 2 | **YouTube** | YouTube Data API v3 | 매 4시간 | 한국어 전용 18개 채널 |
| 3 | **AI 논문** | arXiv API | 매 12시간 | 18개 토픽 (LLM, Diffusion, Agent 등) |
| 4 | **AI 뉴스** | RSS Feeds | 매 1시간 | 자동분류 (정책/기업/기술/제품/일반) |
| 5 | **GitHub** | GitHub Search API (fan-out) | 매 6시간 | 19개 쿼리 카테고리 |
| 6 | **컨퍼런스** | WikiCFP, AI Deadlines | 매일 | 단일 뷰 (한국 이벤트 포함) |
| 7 | **AI 플랫폼** | 구조화 데이터 | 매주 월요일 | 출처 표시 |
| 8 | **AI 채용** | RemoteOK API, RSS | 매 6시간 | 16개 직무 카테고리 |
| 9 | **AI 정책** | 정부 RSS, AI News | 매일 | 국가별 (한국/미국/EU/중국) |

---

## 주요 기능

### 1. 하이브리드 AI 요약 (Gemini + Ollama)
- Gemini 2.0 Flash API로 한글 요약 생성
- API 장애 시 Ollama 로컬 LLM (SOLAR-10.7B)으로 자동 폴백
- 카테고리별 맞춤 프롬프트 (summary, keywords, key_features 등)

### 2. 서버사이드 인증
- Next.js 서버 프록시(`/api/[...path]/route.ts`)에서만 API Key 주입
- 브라우저에 API Key 미노출 (NEXT_PUBLIC_ 변수 제거)
- APP_PASSWORD/ADMIN_PASSWORD/JWT_SECRET_KEY 필수 설정

### 3. 스마트 스케줄러
```
뉴스: 매 1시간 | YouTube: 매 4시간 | HF/GitHub/채용: 매 6시간
논문: 매 12시간 | 컨퍼런스/정책: 매일 | 플랫폼: 매주 월요일
아카이브: 매일 03:30 (30일 이상 데이터 소프트 삭제)
```

### 4. 전역 검색
- PostgreSQL FTS + ILIKE fallback
- 9개 카테고리 통합 검색 + 페이지네이션

### 5. HyperLogLog 방문자 추적
- Redis PFADD/PFCOUNT (12KB로 수백만 UV 처리)
- 일별/월별/전체 고유 방문자 수 집계

### 6. News 자동 토픽 분류
- 키워드 빈도 기반 5개 카테고리 자동 분류
- 정책 / 기업동향 / 기술발전 / 제품출시 / AI 일반

### 7. SVG 아이콘 + pipeline_tag 색상
- 11개 카테고리 전용 SVG 아이콘
- HuggingFace pipeline_tag별 색상 코딩 (NLP=파랑, CV=초록, Audio=보라)

---

## 기술 스택

### 프론트엔드

| 기술 | 용도 |
|------|------|
| Next.js 14 (App Router) | SSR/CSR 프레임워크 |
| TypeScript 5 | 정적 타입 |
| Tailwind CSS 3.4 | 유틸리티 CSS |
| SWR | 데이터 패칭 |
| Framer Motion | 애니메이션 |
| react-d3-cloud | 워드 클라우드 시각화 |
| FullCalendar | 컨퍼런스 캘린더 |

### 백엔드

| 기술 | 용도 |
|------|------|
| FastAPI 0.128 | 비동기 웹 프레임워크 |
| Python 3.11 | 런타임 |
| SQLAlchemy 2.0 (asyncpg) | 비동기 ORM |
| Alembic | DB 마이그레이션 |
| PostgreSQL 15 | 데이터베이스 |
| Redis 7 (HyperLogLog) | 캐싱 + 방문자 추적 |
| APScheduler 3.10 | 크론 스케줄링 |
| google-generativeai | Gemini 2.0 Flash API |
| Ollama | 로컬 LLM 폴백 (SOLAR-10.7B) |

### 인프라

| 서비스 | 용도 |
|--------|------|
| Docker Compose | 로컬 개발 (API + PostgreSQL + Redis + Ollama) |
| Railway | 백엔드 클라우드 호스팅 |
| Vercel | 프론트엔드 CDN + Edge |

---

## 프로젝트 구조

```
fastapi-starter/
├── app/                              # 백엔드 (FastAPI)
│   ├── main.py                       # 앱 진입점 + HLL 방문자 미들웨어
│   ├── config.py                     # 환경 변수 (필수값 미설정 시 기동 실패)
│   ├── database.py                   # PostgreSQL 비동기 연결
│   ├── cache.py                      # Redis 캐싱 + HyperLogLog 방문자
│   ├── auth.py                       # API Key + JWT 인증
│   │
│   ├── api/v1/                       # API 라우터 (12개)
│   │   ├── dashboard.py              # 대시보드 통계
│   │   ├── search.py                 # 전역 검색
│   │   ├── system.py                 # 시스템 상태 + 방문자 수
│   │   ├── admin.py                  # 관리자 전용
│   │   └── *.py                      # 9개 카테고리 라우터
│   │
│   ├── models/                       # SQLAlchemy 모델 (9개 + 채널)
│   ├── schemas/                      # Pydantic 스키마
│   └── services/                     # 비즈니스 로직
│       ├── scheduler.py              # 카테고리별 최적 주기 스케줄러
│       ├── ai_summary_service.py     # Gemini + Ollama 하이브리드 요약
│       └── *_service.py              # 9개 수집 서비스
│
├── web-next/                         # 프론트엔드 (Next.js 14)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/[...path]/route.ts  # 서버 프록시 (API Key 주입)
│   │   │   ├── page.tsx              # 대시보드
│   │   │   ├── login/page.tsx        # 로그인
│   │   │   └── */page.tsx            # 9개 카테고리 + 시스템
│   │   │
│   │   ├── components/
│   │   │   ├── ui/ErrorState.tsx     # 공통 에러/로딩 상태 (v4.0)
│   │   │   ├── icons/               # SVG 아이콘
│   │   │   ├── dashboard/           # 대시보드 위젯
│   │   │   └── layout/              # Sidebar, TopBar
│   │   │
│   │   └── lib/
│   │       ├── fetcher.ts            # 단일 API Client (apiFetcher)
│   │       ├── types.ts              # 타입 정의
│   │       ├── auth-context.tsx      # 인증 컨텍스트
│   │       └── theme-context.tsx     # 테마 컨텍스트
│   │
│   └── public/
│       ├── logo.jpg                  # AI봄 로고 (통일)
│       ├── icons/                    # PWA 아이콘 (192/512/apple-touch)
│       └── manifest.json             # PWA 매니페스트
│
├── tests/                            # 자동화 테스트 (v4.0)
│   ├── conftest.py                   # 테스트 환경변수
│   ├── test_migration.py             # Alembic 마이그레이션 검증
│   ├── test_auth.py                  # 인증 회귀 테스트
│   ├── test_routes.py                # 라우팅 회귀 테스트
│   └── test_classifiers.py           # 분류기 단위 테스트
│
├── alembic/                          # DB 마이그레이션
├── docker-compose.yml                # Docker (API + PG + Redis + Ollama)
├── Dockerfile                        # FastAPI 이미지 (Python 3.11)
├── start.sh                          # fail-fast 서버 시작 스크립트
└── requirements.txt                  # Python 의존성
```

---

## 빠른 시작

### Docker Compose (권장)

```bash
# 1. 클론
git clone https://github.com/DONGJUSEO/ai-trend-tracker.git
cd ai-trend-tracker

# 2. 환경 변수 설정
cp .env.example .env
# .env에 필수 변수 입력 (아래 환경 변수 섹션 참조)

# 3. 백엔드 실행 (API + PostgreSQL + Redis + Ollama + 자동 마이그레이션)
docker compose up -d

# 4. 프론트엔드 실행
cd web-next
npm install
npm run dev
```

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:8000 |
| Swagger 문서 | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

---

## 환경 변수 설정

### 백엔드 (.env)

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| `DATABASE_URL` | **필수** | - | PostgreSQL 연결 문자열 |
| `REDIS_URL` | **필수** | - | Redis 연결 문자열 |
| `APP_PASSWORD` | **필수** | - | 사이트 접근 비밀번호 |
| `ADMIN_PASSWORD` | **필수** | - | 관리자 비밀번호 |
| `JWT_SECRET_KEY` | **필수** | - | JWT 서명 키 |
| `GEMINI_API_KEY` | 선택 | `""` | Gemini AI API 키 |
| `GEMINI_MODEL` | 선택 | `gemini-2.0-flash` | Gemini 모델 지정 |
| `YOUTUBE_API_KEY` | 선택 | `""` | YouTube Data API v3 키 |
| `GITHUB_TOKEN` | 선택 | `""` | GitHub PAT |
| `OLLAMA_BASE_URL` | 선택 | `http://localhost:11434` | Ollama 서버 URL |
| `OLLAMA_MODEL` | 선택 | `solar:10.7b` | Ollama 모델명 |
| `ERROR_WEBHOOK_SLACK` | 선택 | `""` | Slack 에러 알림 웹훅 |
| `ERROR_WEBHOOK_DISCORD` | 선택 | `""` | Discord 에러 알림 웹훅 |

### 프론트엔드 (Vercel 환경변수 — 서버 전용)

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `BACKEND_URL` | **필수** | 백엔드 서버 URL (예: `https://...railway.app`) |
| `API_KEY` | **필수** | 백엔드 API Key (= APP_PASSWORD) |

> ⚠️ `NEXT_PUBLIC_` 접두사 사용 금지 — API Key가 브라우저에 노출됩니다.

---

## API 엔드포인트

모든 API는 `/api/v1/` 프리픽스, `X-API-Key` 헤더 인증 필요.

### 카테고리 API

| 메서드 | 엔드포인트 | 응답 키 | 페이지네이션 |
|--------|-----------|---------|-------------|
| `GET` | `/api/v1/huggingface/` | `items` | `page`, `page_size` |
| `GET` | `/api/v1/youtube/videos` | `videos` | `page`, `page_size` |
| `GET` | `/api/v1/papers/` | `papers` | `page`, `page_size` |
| `GET` | `/api/v1/news/news` | `news` | `page`, `page_size` |
| `GET` | `/api/v1/github/projects` | `items` | `page`, `page_size` |
| `GET` | `/api/v1/conferences/` | `items` | `page`, `page_size` |
| `GET` | `/api/v1/tools/` | `items` | `page`, `page_size` |
| `GET` | `/api/v1/jobs/` | `items` | `page`, `page_size` |
| `GET` | `/api/v1/policies/` | `items` | `page`, `page_size` |

### 시스템 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/v1/search?q=AI&page_size=10` | 전역 검색 (카테고리 통합) |
| `GET` | `/api/v1/dashboard/live-pulse` | 실시간 핫 토픽 + 수집 통계 |
| `GET` | `/api/v1/dashboard/external-trending-keywords` | 트렌딩 키워드 |
| `GET` | `/api/v1/system/status` | 시스템 상태 + 방문자 수 + API 요청 카운트 |

---

## 데이터 수집 파이프라인

```
APScheduler (카테고리별 최적 주기)
    |
    +---> [뉴스] 매 1시간         → NewsService → RSS Feeds → 자동 토픽 분류
    +---> [YouTube] 매 4시간      → YouTubeService → 18개 한국 채널
    +---> [HF/GitHub/채용] 매 6시간 → 각 Service → 각 API
    +---> [논문] 매 12시간         → ArxivService → arXiv API → 18개 토픽
    +---> [컨퍼런스/정책] 매일     → 각 Service → WikiCFP/RSS
    +---> [플랫폼] 매주 월요일     → AIToolService → 구조화 데이터
    +---> [아카이브] 매일 03:30    → 30일+ 데이터 소프트 삭제
    |
    v
하이브리드 AI 요약 (Gemini → Ollama 폴백)
    +---> 요약 없는 항목 → 한글 요약 생성 → DB 업데이트
    +---> 수집 실패 시 → NotificationService → Slack/Discord 웹훅
    +---> 수집 완료 시 → Redis 캐시 무효화
```

---

## 테스트

```bash
cd fastapi-starter

# 전체 테스트 실행
pytest tests/ -v

# 개별 테스트
pytest tests/test_migration.py -v    # Alembic 마이그레이션 체인 검증
pytest tests/test_auth.py -v         # 인증 회귀 테스트
pytest tests/test_routes.py -v       # 라우팅 회귀 테스트
pytest tests/test_classifiers.py -v  # 분류기 단위 테스트
```

| 테스트 | 검증 항목 |
|--------|----------|
| `test_migration` | Alembic head 단일성, history 체인 무결성 |
| `test_auth` | 기본 비밀번호 금지, 하드코딩 제거, NEXT_PUBLIC_API_KEY 미노출 |
| `test_routes` | /papers/search 정적 라우트 우선, 12개 라우터 등록 확인 |
| `test_classifiers` | News 5개 카테고리, Job 3개 카테고리, Paper 2개 토픽 분류 |

---

## 배포

### 프론트엔드: Vercel

```bash
# Vercel GitHub 연동 (main 브랜치 자동 배포)
# vercel.json: { "version": 2, "rootDirectory": "web-next" }

# Vercel Dashboard 환경변수 (서버 전용 — NEXT_PUBLIC_ 금지):
# BACKEND_URL = https://ai-trend-tracker-production.up.railway.app
# API_KEY = <your-app-password>
```

### 백엔드: Railway

```bash
# Railway GitHub 연동 (main 브랜치 자동 배포)
# Dockerfile 기반 빌드 (Python 3.11-slim)
# start.sh: set -e → Alembic 마이그레이션 → Uvicorn 서버

# 필수 환경 변수 (Railway Dashboard):
# DATABASE_URL, REDIS_URL, APP_PASSWORD, ADMIN_PASSWORD, JWT_SECRET_KEY
# 선택: GEMINI_API_KEY, YOUTUBE_API_KEY, GITHUB_TOKEN
```

### 배포 프로세스

```
git push origin main
    │
    ├──→ Vercel: 자동 빌드 (Next.js) → CDN 배포 (~1분)
    │
    └──→ Railway: 자동 빌드 (Dockerfile) → Alembic 마이그레이션 → 서버 시작 (~3분)
```

---

## 버전 히스토리

### v4.0.0 (2026-02-08) — 보안/아키텍처/데이터 대규모 강화

- **보안**: 서버사이드 인증, NEXT_PUBLIC_API_KEY 제거, 기본 비밀번호 제거
- **AI**: Gemini + Ollama 하이브리드 요약, 비동기 `generate_content_async()`
- **데이터**: YouTube 18채널, Papers 18토픽, GitHub 19쿼리, Jobs 16직무, News 자동분류
- **아키텍처**: 단일 API Client, ErrorState, Python 3.11, fail-fast start.sh
- **방문자**: Redis HyperLogLog 일별/월별/전체 UV 추적
- **테스트**: 4종 자동화 테스트 (마이그레이션/인증/라우팅/분류기)
- **PWA**: 로고.jpg 기반 아이콘 통일, 구버전 아이콘 제거

### v3.1.1 (2026-02-08) — 데이터 품질 수정

- 컨퍼런스 1970 날짜 버그, Papers/HF 한글 요약, 뉴스 AI 필터링 강화
- 정책 HTML 태그 제거, 채용 직무 오분류, GitHub 비AI 레포 제외

### v3.1.0 (2026-02-08) — 대시보드/백엔드 강화

- LivePulse 실시간 3열 위젯, react-d3-cloud 워드 클라우드
- FullCalendar 캘린더 뷰, 채용 10개 직무 분류, YouTube 채널 교체

### v3.0.0 (2026-02-08) — Codex 통합 대규모 개선

- AI 요약 4종 메서드, 전역 검색, 소프트 아카이브, SVG 아이콘
- 대시보드 실데이터, SWR 전역 적용

### v2.0.0 (2026-02-07) — Next.js 전면 재구축

- SvelteKit → Next.js 14 App Router, 글래스모피즘 UI
- Redis 캐싱, JWT 인증

### v0.3.2 (2026-02-02) — 초기 버전

- SvelteKit + FastAPI, 11개 카테고리, Gemini AI 요약

---

## 개발자

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/DONGJUSEO">
        <strong>서동주 (@DONGJUSEO)</strong>
      </a>
      <br />
      풀스택 개발 / 프로젝트 기획
    </td>
    <td align="center">
      <strong>Claude Opus 4.6</strong>
      <br />
      AI 개발 어시스턴트 (Anthropic)
    </td>
    <td align="center">
      <strong>ChatGPT 5.3 Codex</strong>
      <br />
      AI 코드 생성 (OpenAI)
    </td>
  </tr>
</table>

---

## 라이선스

이 프로젝트는 [MIT License](LICENSE)로 배포됩니다.

```
MIT License
Copyright (c) 2026 서동주 (DONGJUSEO)
```

---

<p align="center">
  <strong>AI봄 - AI Trend Tracker</strong> | v4.0.0 | 2026-02-08
</p>

<p align="center">
  Made with FastAPI + Next.js 14 + Gemini 2.0 Flash + Ollama + Dual AI Vibe Coding
</p>
