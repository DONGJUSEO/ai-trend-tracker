# AI Trend Tracker - 개발 로그

**프로젝트 기간**: 2026-02-01 ~ 2026-02-02
**개발자**: 서동주 & Claude Sonnet 4.5
**최종 버전**: 0.2.0

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [초기 구현 (Phase 1-2)](#초기-구현)
3. [6개 신규 카테고리 추가 (Phase 3)](#6개-신규-카테고리-추가)
4. [프로덕션 배포 (Phase 4)](#프로덕션-배포)
5. [트러블슈팅 및 해결](#트러블슈팅-및-해결)
6. [최종 성과](#최종-성과)
7. [교훈 및 인사이트](#교훈-및-인사이트)

---

## 프로젝트 개요

### 목표
AI 업계의 최신 트렌드를 11개 카테고리에서 자동으로 수집하고, AI가 요약한 정보를 제공하는 웹 서비스 구축

### 기술 스택
- **Backend**: FastAPI, SQLAlchemy (async), PostgreSQL
- **Frontend**: SvelteKit, Tailwind CSS
- **AI**: Google Gemini API (무료)
- **Deployment**: Railway (Backend), Vercel (Frontend)
- **Scheduler**: APScheduler (CronTrigger)

### 11개 카테고리
1. 🤗 Hugging Face 모델
2. ⭐ GitHub 프로젝트
3. 📺 YouTube 영상
4. 📄 AI 논문
5. 📰 AI 뉴스
6. 📅 AI 컨퍼런스
7. 🛠️ AI 도구
8. 🏆 AI 리더보드
9. 💼 AI 채용
10. 📜 AI 정책/규제
11. 🚀 AI 스타트업/투자

---

## 초기 구현

### Phase 1: 인프라 구축 (2026-02-01)

#### 완료 항목
- ✅ FastAPI 백엔드 구조 설계
- ✅ SQLAlchemy 비동기 ORM 설정
- ✅ SvelteKit 프론트엔드 초기화
- ✅ 로컬 개발 환경 구축 (SQLite)

#### 주요 파일
```
app/
├── main.py                 # FastAPI 앱 진입점
├── config.py               # 환경 변수 설정
├── database.py             # DB 연결
├── models/                 # SQLAlchemy 모델
├── schemas/                # Pydantic 스키마
├── api/v1/                 # API 라우터
└── services/               # 비즈니스 로직
```

### Phase 2: 기본 5개 카테고리 구현 (2026-02-01)

#### 구현 카테고리
1. **Hugging Face 모델** (30개)
   - API: Hugging Face API
   - 데이터: model_id, downloads, likes, tags, summary

2. **GitHub 프로젝트** (30개)
   - API: GitHub API
   - 데이터: repo_name, stars, forks, language, description

3. **YouTube 영상** (44개)
   - API: YouTube Data API
   - 데이터: video_id, title, channel, views, likes

4. **AI 논문** (arXiv)
   - API: arXiv API
   - 데이터: arxiv_id, title, authors, abstract

5. **AI 뉴스**
   - 소스: RSS Feeds (AI News)
   - 데이터: title, source, published_date, summary

#### 스케줄러 구현
```python
# APScheduler CronTrigger
scheduler.add_job(
    collect_all_data,
    trigger=CronTrigger(hour=0, minute=0),  # 매일 00:00
    id="collect_all_data",
    name="전체 AI 트렌드 데이터 수집"
)
```

#### AI 요약 통합
- **Gemini API** 활용
- 각 카테고리당 최대 10개 항목 요약
- 한글 요약 + 키워드 추출

---

## 6개 신규 카테고리 추가

### Phase 3: 신규 카테고리 구현 (2026-02-02)

#### 추가된 카테고리

**6. AI 컨퍼런스** (WikiCFP)
```python
# 데이터 소스: WikiCFP RSS
- conference_name, acronym, year
- start_date, end_date, submission_deadline
- location, topics
```

**7. AI 도구** (Product Hunt, Web Scraping)
```python
# 트렌딩 AI 도구
- tool_name, tagline, description
- pricing_model, rating, upvotes
```

**8. AI 리더보드** (Hugging Face Leaderboards)
```python
# 모델 벤치마크 순위
- model_name, leaderboard_source, rank
- scores (JSON: MMLU, GSM8K 등)
```

**9. AI 채용** (RemoteOK API)
```python
# RemoteOK API: /api?tags=ai,ml
- job_title, company_name, location
- salary_min, salary_max, required_skills
- 실제 20개 채용 공고 수집 성공
```

**10. AI 정책/규제** (RSS Feeds)
```python
# OECD, EU AI Act, Future of Life Institute
- title, policy_type, status
- country, proposed_date, effective_date
- 실제 7개 정책 뉴스 수집 성공
```

**11. AI 스타트업/투자** (TechCrunch RSS)
```python
# 펀딩 뉴스 파싱
- company_name, funding_amount, funding_series
- investors, industry_tags
- 실제 2개 스타트업 뉴스 수집 성공
```

#### 구현 과정
1. **서비스 레이어 생성** (각 6개)
   - `conference_service.py`
   - `ai_tool_service.py`
   - `leaderboard_service.py`
   - `job_trend_service.py`
   - `policy_service.py`
   - `startup_service.py`

2. **모델 및 스키마 정의**
   - SQLAlchemy 모델 (11개)
   - Pydantic 스키마 (11개)

3. **API 라우터 추가**
   - `/api/v1/conferences/`
   - `/api/v1/tools/`
   - `/api/v1/leaderboards/`
   - `/api/v1/jobs/`
   - `/api/v1/policies/`
   - `/api/v1/startups/`

4. **프론트엔드 페이지 생성**
   - SvelteKit 라우트 (각 6개)
   - 반응형 UI (Tailwind CSS)

---

## 프로덕션 배포

### Phase 4: Railway & Vercel 배포 (2026-02-02)

#### Railway (백엔드)

**배포 URL**: https://ai-trend-tracker-production.up.railway.app

**설정**:
```yaml
Services:
  - Backend (FastAPI)
  - PostgreSQL Database

Environment Variables:
  - DATABASE_URL: postgresql://... (자동)
  - GEMINI_API_KEY: AIzaSy...
  - YOUTUBE_API_KEY: AIzaSy...
  - GITHUB_TOKEN: ghp_jC...
  - APP_PASSWORD: test1234
```

**자동 배포**:
- GitHub main 브랜치 push → 자동 빌드 → 배포
- 빌드 시간: ~2분

#### Vercel (프론트엔드)

**배포 URL**: https://ai-trend-tracker-beta.vercel.app

**설정**:
```yaml
Framework: SvelteKit
Root Directory: web
Build Command: npm run build
Output Directory: .svelte-kit

Environment Variables:
  - VITE_API_URL: https://ai-trend-tracker-production.up.railway.app
  - VITE_API_KEY: test1234
```

**자동 배포**:
- GitHub main 브랜치 push → 자동 빌드 → 배포
- 빌드 시간: ~1-2분

#### 데이터 마이그레이션

**로컬 SQLite → 프로덕션 PostgreSQL**

```bash
# migrate_to_production.py 실행
python migrate_to_production.py

# 결과:
# ✅ 163개 항목 마이그레이션 성공
# - Hugging Face: 30개
# - GitHub: 30개
# - YouTube: 44개
# - AI 뉴스: 30개
# - AI 채용: 20개
# - AI 정책: 7개
# - AI 스타트업: 2개
```

---

## 트러블슈팅 및 해결

### 1. UI 색상 문제 ⚪→⚫

**문제**: Papers, News, GitHub 페이지에서 흰 배경에 흰 텍스트로 제목이 보이지 않음

**원인**:
```svelte
<h1 class="text-white">  <!-- ❌ 흰 배경에 흰 텍스트 -->
```

**해결**:
```svelte
<h1 class="text-gray-900">  <!-- ✅ 흰 배경에 검은 텍스트 -->
```

### 2. SQLite 경로 문제

**문제**: 백엔드 API가 빈 데이터 반환 (로컬 개발 환경)

**원인**: `.env` 파일에 상대 경로 사용
```env
DATABASE_URL=sqlite+aiosqlite:///./ai_trends.db  # ❌ 상대 경로
```

**해결**: 절대 경로로 변경
```env
DATABASE_URL=sqlite+aiosqlite:////Users/.../ai_trends.db  # ✅ 절대 경로
```

### 3. Node.js 미설치

**문제**: 프론트엔드 개발 서버 실행 불가

**해결**:
```bash
# Homebrew 설치 (macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 설치
brew install node

# 프론트엔드 패키지 설치
cd web && npm install
```

### 4. 시스템 상태 API - 신규 카테고리 누락

**문제**: 6개 신규 카테고리가 시스템 상태에 표시 안 됨

**원인**: `app/api/v1/system.py`의 `get_system_status()` 함수에서 6개 카테고리 누락

**해결**: 모든 11개 카테고리 추가
```python
# AI Conferences
conf_count = await db.execute(select(func.count()).select_from(AIConference))
categories_status["conferences"] = {...}

# 나머지 5개도 동일하게 추가
```

### 5. Railway 데이터 수집 실패

**문제**: 프로덕션 환경에서 데이터 수집 실패

**시도**:
```python
# asyncio.create_task() 사용 - ❌ 작동 안 함
asyncio.create_task(collect_all_data())
```

**해결**: FastAPI BackgroundTasks 사용
```python
# ✅ 작동함
background_tasks.add_task(collect_all_data)
```

### 6. 데이터베이스 데이터 불일치 (로컬 133개 vs 프로덕션 30개)

**문제**: 로컬에는 133개 항목, 프로덕션에는 30개만

**해결**: 데이터 마이그레이션 스크립트 생성
```python
# migrate_to_production.py
# - 로컬 SQLite → 프로덕션 PostgreSQL
# - 중복 건너뛰기 (unique 제약조건)
# - 결과: 163개 항목 (133 + 30)
```

### 7. 프론트엔드 "Failed to fetch" 오류 (가장 복잡!)

#### 문제 분석
- **증상**: Vercel 프론트엔드에서 모든 카테고리 "Failed to fetch"
- **대시보드는 작동**: 시스템 상태 표시됨
- **YouTube만 작동**: 다른 카테고리는 실패

#### 시도한 해결책들

**시도 1: Vercel 환경 변수 설정** ❌
```env
VITE_API_URL=https://ai-trend-tracker-production.up.railway.app
VITE_API_KEY=test1234
```
- 설정했지만 여전히 실패

**시도 2: CORS 설정 수정** ⚠️
```python
# app/main.py
allowed_origins = [
    "https://*.vercel.app",  # ❌ 와일드카드 작동 안 함!
]
```
→ FastAPI는 와일드카드 서브도메인 미지원!

```python
# ✅ 정확한 도메인으로 수정
allowed_origins = [
    "https://ai-trend-tracker-beta.vercel.app",
]
```

**시도 3: Vercel 수동 재배포** ⚠️
- Railway는 재배포됨
- Vercel은 프론트엔드 코드 변경 없어서 재배포 안 됨!

**최종 해결: 프론트엔드 코드 수정** ✅

**문제의 근본 원인**:
```javascript
// ❌ 작동 안 함: 상대 경로
const response = await fetch('/api/v1/huggingface/', {...});

// 이유: Vercel의 vercel.json rewrite는
// 서버 사이드에서만 작동, 클라이언트 사이드 fetch에서는 작동 안 함!
```

**해결책**: 모든 프론트엔드 페이지 수정 (11개)
```javascript
// ✅ 작동함: 환경 변수 사용
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const apiKey = import.meta.env.VITE_API_KEY || 'test1234';
const response = await fetch(`${apiUrl}/api/v1/huggingface/`, {
    headers: { 'X-API-Key': apiKey }
});
```

**수정된 파일** (11개):
- `web/src/routes/huggingface/+page.svelte`
- `web/src/routes/youtube/+page.svelte`
- `web/src/routes/papers/+page.svelte`
- `web/src/routes/news/+page.svelte`
- `web/src/routes/github/+page.svelte`
- `web/src/routes/jobs/+page.svelte`
- `web/src/routes/policies/+page.svelte`
- `web/src/routes/startups/+page.svelte`
- `web/src/routes/conferences/+page.svelte`
- `web/src/routes/tools/+page.svelte`
- `web/src/routes/leaderboards/+page.svelte`
- `web/src/routes/+page.svelte` (대시보드)

### 8. 스케줄러에 6개 카테고리 누락

**문제**: 4개 카테고리 (Papers, Conferences, Tools, Leaderboards)에 데이터 없음

**원인**: `app/services/scheduler.py`의 `collect_all_data()` 함수에서 6개 신규 카테고리 수집 함수 미호출

**해결**: 6개 수집 함수 추가 및 호출
```python
# 추가된 함수들:
async def collect_conference_data(): ...
async def collect_tool_data(): ...
async def collect_leaderboard_data(): ...
async def collect_job_data(): ...
async def collect_policy_data(): ...
async def collect_startup_data(): ...

# collect_all_data()에서 호출
await collect_conference_data()
await asyncio.sleep(3)
# ... (나머지 5개도 동일)
```

---

## 최종 성과

### 프로덕션 환경 현황 (2026-02-02)

#### 데이터 통계
```
총 데이터: 163개 항목
활성 카테고리: 7/11 (나머지 4개는 다음 수집 시 추가 예정)

카테고리별:
- 🤗 Hugging Face: 30개 ✅
- ⭐ GitHub: 30개 ✅
- 📺 YouTube: 44개 ✅
- 📄 AI 논문: 0개 (다음 수집 대기)
- 📰 AI 뉴스: 30개 ✅
- 📅 AI 컨퍼런스: 0개 (다음 수집 대기)
- 🛠️ AI 도구: 0개 (다음 수집 대기)
- 🏆 AI 리더보드: 0개 (다음 수집 대기)
- 💼 AI 채용: 20개 ✅
- 📜 AI 정책: 7개 ✅
- 🚀 AI 스타트업: 2개 ✅
```

#### 시스템 상태
- **백엔드**: ● 온라인 (Railway)
- **데이터베이스**: ● 연결됨 (PostgreSQL)
- **스케줄러**: ⏰ 매일 00:00 자동 수집
- **프론트엔드**: ✅ 정상 작동 (Vercel)

#### 성능 지표
- **API 응답 시간**: ~300-500ms (평균)
- **프론트엔드 로딩**: ~1-2초
- **데이터 수집 주기**: 매일 1회 (00:00)
- **AI 요약 생성**: 카테고리당 최대 10개

### 배포 파이프라인

```
개발 → GitHub → 자동 배포
         ↓
    ┌────┴────┐
    ↓         ↓
 Railway   Vercel
(Backend) (Frontend)
    ↓         ↓
 PostgreSQL  CDN
    ↓
  실시간 데이터
```

### 비용 구조
```
총 비용: $0/월 (무료 티어 사용)

- Railway: $0 (무료 티어 $5 크레딧)
- Vercel: $0 (무료 티어)
- Gemini API: $0 (무료 티어)
- PostgreSQL: $0 (Railway 포함)
```

---

## 교훈 및 인사이트

### 기술적 교훈

1. **CORS는 정확한 도메인을 사용해야 함**
   - 와일드카드 서브도메인(`*.vercel.app`)은 FastAPI에서 작동 안 함
   - 정확한 도메인 명시 필요

2. **Vercel의 rewrite는 서버 사이드만**
   - `vercel.json`의 rewrite는 클라이언트 사이드 fetch에서 작동 안 함
   - 환경 변수를 사용해서 직접 백엔드 URL 호출해야 함

3. **환경 변수는 빌드 시점에 주입됨**
   - Vercel 환경 변수 변경 후 반드시 재배포 필요
   - 빈 커밋(`--allow-empty`)으로 재배포 트리거 가능

4. **FastAPI BackgroundTasks vs asyncio.create_task**
   - 프로덕션에서는 `BackgroundTasks` 사용 권장
   - `asyncio.create_task()`는 일부 환경에서 작동 안 할 수 있음

5. **SQLite 경로는 절대 경로 사용**
   - 상대 경로는 작업 디렉토리에 따라 다르게 해석됨
   - 절대 경로가 안전

### 프로젝트 관리 교훈

1. **단계별 테스트의 중요성**
   - 로컬 → 스테이징 → 프로덕션 순으로 검증
   - 각 단계에서 철저한 테스트 필요

2. **로깅의 중요성**
   - Rotating File Handler로 로그 관리
   - 문제 발생 시 로그가 디버깅에 큰 도움

3. **문서화의 중요성**
   - 상세한 README와 개발 로그
   - 트러블슈팅 섹션이 향후 유지보수에 도움

4. **자동화의 가치**
   - CI/CD 파이프라인으로 배포 자동화
   - 스케줄러로 데이터 수집 자동화
   - 수동 작업 최소화

### 향후 개선 방향

1. **테스트 커버리지 추가**
   - Unit tests (pytest)
   - Integration tests
   - E2E tests (Playwright)

2. **모니터링 강화**
   - Sentry (에러 추적)
   - Analytics (사용자 행동)
   - Performance monitoring

3. **데이터 품질 개선**
   - AI 요약 품질 향상
   - 중복 제거 알고리즘 개선
   - 데이터 검증 강화

4. **사용자 경험 개선**
   - 검색 기능
   - 필터링 옵션
   - 키워드 클라우드 시각화
   - 다크 모드

---

## 프로젝트 타임라인

### 2026-02-01
- 09:00 - 프로젝트 시작, 요구사항 분석
- 10:00 - 백엔드 인프라 구축 (FastAPI + SQLAlchemy)
- 12:00 - 5개 기본 카테고리 모델 정의
- 14:00 - 프론트엔드 초기 설정 (SvelteKit)
- 16:00 - 데이터 수집 서비스 구현
- 18:00 - AI 요약 기능 통합 (Gemini API)
- 20:00 - 로컬 테스트 완료 (133개 항목 수집)

### 2026-02-02
- 00:00 - 6개 신규 카테고리 계획 수립
- 02:00 - 신규 카테고리 모델 및 서비스 구현
- 04:00 - API 라우터 및 프론트엔드 페이지 생성
- 06:00 - Railway 배포 시작
- 08:00 - Vercel 배포 및 환경 변수 설정
- 10:00 - 데이터 마이그레이션 (SQLite → PostgreSQL)
- 12:00 - CORS 문제 발견 및 해결
- 14:00 - 프론트엔드 fetch 오류 해결
- 16:00 - 스케줄러에 6개 카테고리 추가
- 18:00 - 최종 테스트 및 검증
- 20:00 - **프로젝트 완료! 🎉**

---

## 감사의 말

이 프로젝트는 AI 기술의 발전과 오픈소스 생태계의 협력 덕분에 가능했습니다.

**특별 감사**:
- **Anthropic** - Claude Sonnet 4.5로 전체 코드베이스 구현
- **Google** - 무료 Gemini API 제공
- **Hugging Face** - 모델 정보 및 API 제공
- **Railway & Vercel** - 무료 호스팅 제공
- **오픈소스 커뮤니티** - FastAPI, SvelteKit 등 훌륭한 도구들

---

**개발 로그 작성일**: 2026-02-02
**버전**: 1.0.0
**작성자**: 서동주 & Claude Sonnet 4.5
