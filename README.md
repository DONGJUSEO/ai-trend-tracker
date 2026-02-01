# AI Trend Tracker 🚀

> **11개 카테고리로 보는 AI 트렌드 큐레이션 서비스**

실시간으로 AI 업계의 최신 트렌드를 자동 수집하고, AI가 요약한 정보를 한눈에 확인할 수 있는 웹 서비스입니다.

**데모**: [프론트엔드](https://vercel.app) | [API 문서](https://railway.app/docs)

---

## 📋 프로젝트 개요

AI 분야의 최신 트렌드를 11개 카테고리에서 자동으로 수집하고, Gemini AI로 요약하여 제공하는 풀스택 웹 애플리케이션입니다.

### ✨ 11개 AI 트렌드 카테고리

| 카테고리 | 아이콘 | 설명 | 데이터 소스 |
|---------|-------|------|-----------|
| **Hugging Face 모델** | 🤗 | 최신 AI 모델 정보 및 성능 분석 | Hugging Face API |
| **YouTube 영상** | 📺 | AI 관련 영상/쇼츠 요약 | YouTube Data API |
| **AI 논문** | 📄 | arXiv 최신 논문 요약 | arXiv API |
| **AI 뉴스** | 📰 | AI 업계 뉴스 및 블로그 | RSS Feeds |
| **GitHub 프로젝트** | ⭐ | AI 오픈소스 트렌딩 프로젝트 | GitHub API |
| **AI 리더보드** | 🏆 | 모델 벤치마크 순위 | Hugging Face Leaderboards |
| **AI 도구** | 🛠️ | 신규 AI 도구 및 서비스 | Product Hunt, Web Scraping |
| **AI 컨퍼런스** | 📅 | 학회, 세미나, 마감일 정보 | WikiCFP, AI Deadlines |
| **AI 채용** | 💼 | AI/ML 직무 채용 공고 | RemoteOK API, RSS |
| **AI 정책/규제** | 📜 | 정부 정책 및 규제 동향 | 정부 RSS, AI News |
| **AI 스타트업/투자** | 🚀 | 펀딩 뉴스 및 투자 동향 | TechCrunch RSS |

### 🎯 주요 기능

- ⏰ **자동 수집**: 매일 자정(00:00)에 자동으로 최신 데이터 수집
- 🤖 **AI 요약**: Google Gemini API로 한글 요약 자동 생성
- 🔍 **키워드 추출**: 모든 카테고리에서 주요 키워드 자동 추출
- 📊 **시스템 상태**: 실시간 데이터 수집 상태 및 통계 확인
- 📝 **로깅 시스템**: 앱, 에러, 수집 로그 분리 기록 (Rotating File Handler)
- 🎨 **반응형 UI**: Tailwind CSS 기반 모던 웹 인터페이스
- 🔗 **원본 링크**: 모든 항목에 원본 소스 링크 제공
- 🔐 **간단한 인증**: 앱 접속 비밀번호 보호

---

## 🛠️ 기술 스택

### 백엔드
- **FastAPI** 0.115.12 - 고성능 비동기 Python 웹 프레임워크
- **SQLAlchemy** 2.0.38 - 비동기 ORM
- **SQLite** (로컬) / **PostgreSQL** (프로덕션) - 데이터베이스
- **APScheduler** 3.11.0 - 크론 기반 스케줄링
- **Alembic** - 데이터베이스 마이그레이션
- **Pydantic** v2 - 데이터 검증 및 스키마

### 프론트엔드
- **SvelteKit** - 고성능 웹 프레임워크
- **Vite** - 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **JavaScript (ES6+)** - 클라이언트 사이드 로직

### AI & 데이터 수집
- **Google Gemini API** - AI 요약 생성 (무료!)
- **YouTube Data API** - 영상 정보
- **Hugging Face API** - 모델 및 리더보드 정보
- **GitHub API** - 트렌딩 프로젝트
- **RemoteOK API** - AI/ML 채용 공고
- **RSS Feeds** - 뉴스, 정책, 스타트업 펀딩 정보
- **feedparser** - RSS 파싱
- **httpx** - 비동기 HTTP 클라이언트

### 배포 & 인프라
- **Railway** - 백엔드 API 호스팅 (PostgreSQL 포함)
- **Vercel** - 프론트엔드 호스팅
- **GitHub** - 소스 코드 관리 및 CI/CD

---

## 🚀 빠른 시작

### 사전 요구사항

- **Python** 3.11 이상
- **Node.js** 18 이상 (프론트엔드용)
- **Git**
- **API 키**:
  - Google Gemini API (무료) - [발급받기](https://ai.google.dev/gemini-api/docs/api-key)
  - YouTube Data API - [발급받기](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
  - GitHub Personal Access Token - [발급받기](https://github.com/settings/tokens)
  - Hugging Face API Key - [발급받기](https://huggingface.co/settings/tokens)

### 로컬 개발 환경 구축

#### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/fastapi-starter.git
cd fastapi-starter
```

#### 2. 백엔드 설정

```bash
# Python 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 API 키 입력

# 데이터베이스 마이그레이션
alembic upgrade head

# 백엔드 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**백엔드 접속**: http://localhost:8000/docs

#### 3. 프론트엔드 설정

```bash
# 프론트엔드 디렉토리로 이동
cd web

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

**프론트엔드 접속**: http://localhost:5173

#### 4. 초기 데이터 수집 (선택사항)

```bash
# Python 셸에서 수동 수집 실행
python
>>> from app.services.scheduler import collect_all_data
>>> import asyncio
>>> asyncio.run(collect_all_data())
```

---

## 📁 프로젝트 구조

```
fastapi-starter/
├── app/                                # 백엔드 애플리케이션
│   ├── main.py                         # FastAPI 앱 진입점
│   ├── config.py                       # 환경 변수 설정
│   ├── database.py                     # 데이터베이스 연결
│   ├── logging_config.py               # 로깅 설정
│   │
│   ├── models/                         # SQLAlchemy 모델 (11개)
│   │   ├── huggingface.py              # 🤗 Hugging Face 모델
│   │   ├── youtube.py                  # 📺 YouTube 영상
│   │   ├── paper.py                    # 📄 AI 논문
│   │   ├── news.py                     # 📰 AI 뉴스
│   │   ├── github.py                   # ⭐ GitHub 프로젝트
│   │   ├── leaderboard.py              # 🏆 AI 리더보드
│   │   ├── ai_tool.py                  # 🛠️ AI 도구
│   │   ├── conference.py               # 📅 AI 컨퍼런스
│   │   ├── job_trend.py                # 💼 AI 채용
│   │   ├── policy.py                   # 📜 AI 정책
│   │   └── startup.py                  # 🚀 AI 스타트업
│   │
│   ├── schemas/                        # Pydantic 스키마 (11개)
│   │   ├── huggingface.py
│   │   ├── youtube.py
│   │   ├── paper.py
│   │   ├── news.py
│   │   ├── github.py
│   │   ├── leaderboard.py
│   │   ├── ai_tool.py
│   │   ├── conference.py
│   │   ├── job_trend.py
│   │   ├── policy.py
│   │   └── startup.py
│   │
│   ├── api/v1/                         # API 라우터 (11개 + 시스템)
│   │   ├── huggingface.py              # Hugging Face API
│   │   ├── youtube.py                  # YouTube API
│   │   ├── papers.py                   # Papers API
│   │   ├── news.py                     # News API
│   │   ├── github.py                   # GitHub API
│   │   ├── leaderboard.py              # Leaderboard API
│   │   ├── tools.py                    # Tools API
│   │   ├── conferences.py              # Conferences API
│   │   ├── jobs.py                     # Jobs API
│   │   ├── policies.py                 # Policies API
│   │   ├── startups.py                 # Startups API
│   │   └── system.py                   # System Status & Logs API
│   │
│   └── services/                       # 비즈니스 로직
│       ├── scheduler.py                # 스케줄링 (크론)
│       ├── ai_summary_service.py       # Gemini AI 요약
│       ├── huggingface_service.py      # Hugging Face 수집
│       ├── youtube_service.py          # YouTube 수집
│       ├── paper_service.py            # arXiv 수집
│       ├── news_service.py             # 뉴스 RSS 수집
│       ├── github_service.py           # GitHub 수집
│       ├── leaderboard_service.py      # 리더보드 수집
│       ├── ai_tool_service.py          # AI 도구 수집
│       ├── conference_service.py       # 컨퍼런스 수집
│       ├── job_trend_service.py        # 채용 공고 수집
│       ├── policy_service.py           # 정책 뉴스 수집
│       └── startup_service.py          # 스타트업 펀딩 수집
│
├── web/                                # 프론트엔드 (SvelteKit)
│   ├── src/
│   │   ├── routes/                     # 페이지 라우트
│   │   │   ├── +page.svelte            # 홈/대시보드
│   │   │   ├── +layout.svelte          # 레이아웃 (네비게이션)
│   │   │   ├── login/                  # 로그인 페이지
│   │   │   ├── huggingface/            # Hugging Face 페이지
│   │   │   ├── youtube/                # YouTube 페이지
│   │   │   ├── papers/                 # Papers 페이지
│   │   │   ├── news/                   # News 페이지
│   │   │   ├── github/                 # GitHub 페이지
│   │   │   ├── leaderboards/           # Leaderboards 페이지
│   │   │   ├── tools/                  # Tools 페이지
│   │   │   ├── conferences/            # Conferences 페이지
│   │   │   ├── jobs/                   # Jobs 페이지
│   │   │   ├── policies/               # Policies 페이지
│   │   │   ├── startups/               # Startups 페이지
│   │   │   └── system/                 # System Status 페이지
│   │   └── lib/                        # 공통 컴포넌트
│   ├── static/                         # 정적 파일
│   └── vite.config.js                  # Vite 설정 (API 프록시)
│
├── alembic/                            # 데이터베이스 마이그레이션
│   └── versions/                       # 마이그레이션 파일
│
├── logs/                               # 로그 파일 (gitignore)
│   ├── app.log                         # 전체 앱 로그
│   ├── error.log                       # 에러 로그만
│   └── collection.log                  # 데이터 수집 로그만
│
├── .env                                # 환경 변수 (gitignore)
├── .env.example                        # 환경 변수 예시
├── requirements.txt                    # Python 패키지
├── ai_trends.db                        # SQLite 데이터베이스 (로컬)
└── README.md                           # 이 파일
```

---

## 📚 API 엔드포인트

모든 API는 `/api/v1/` 프리픽스를 사용하며, `X-API-Key` 헤더 인증이 필요합니다.

### 인증

```bash
# 헤더에 API 키 포함
curl -H "X-API-Key: your_password" http://localhost:8000/api/v1/huggingface/
```

### 카테고리별 엔드포인트

각 카테고리는 공통 패턴을 따릅니다:

```http
GET /api/v1/{category}/?page=1&page_size=20
```

**카테고리 목록**:
- `huggingface` - Hugging Face 모델
- `youtube` - YouTube 영상
- `papers` - AI 논문
- `news` - AI 뉴스
- `github` - GitHub 프로젝트
- `leaderboards` - AI 리더보드
- `tools` - AI 도구
- `conferences` - AI 컨퍼런스
- `jobs` - AI 채용
- `policies` - AI 정책
- `startups` - AI 스타트업

**공통 쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `page_size`: 페이지당 항목 수 (기본값: 20, 최대: 100)

**응답 형식**:
```json
{
  "total": 150,
  "items": [
    {
      "id": 1,
      "title": "...",
      "summary": "...",
      "keywords": ["키워드1", "키워드2"],
      "created_at": "2026-02-01T10:00:00",
      ...
    }
  ]
}
```

### 시스템 API

#### 시스템 상태 조회
```http
GET /api/v1/system/status
```

**응답**:
```json
{
  "backend_status": "online",
  "database_status": "connected",
  "timestamp": "2026-02-01T10:00:00",
  "total_items": 1500,
  "healthy_categories": 11,
  "total_categories": 11,
  "categories": {
    "huggingface": {
      "name": "Hugging Face 모델",
      "icon": "🤗",
      "total": 200,
      "last_update": "2026-02-01T00:00:00",
      "status": "healthy"
    },
    ...
  }
}
```

#### 키워드 집계
```http
GET /api/v1/system/keywords?limit=50
```

#### 로그 조회
```http
GET /api/v1/system/logs?log_type=app&lines=100
```

**로그 타입**:
- `app` - 전체 앱 로그
- `error` - 에러 로그만
- `collection` - 데이터 수집 로그만

---

## ⚙️ 환경 변수 설정

`.env` 파일 예시:

```env
# 데이터베이스 (로컬: SQLite, 프로덕션: PostgreSQL)
DATABASE_URL=sqlite+aiosqlite:////absolute/path/to/ai_trends.db
# DATABASE_URL=postgresql://user:password@host:5432/ai_trends

# Redis (선택사항)
REDIS_URL=redis://localhost:6379/0

# OpenAI API (선택사항)
OPENAI_API_KEY=

# Hugging Face API
HUGGINGFACE_API_KEY=your_hf_token

# Gemini API (무료!)
GEMINI_API_KEY=your_gemini_key

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_key

# GitHub Personal Access Token
GITHUB_TOKEN=your_github_token

# 스케줄링 (기본값: 12시간마다)
SCHEDULER_INTERVAL_HOURS=12

# 애플리케이션 설정
APP_NAME=AI Trend Tracker
APP_VERSION=0.2.0
DEBUG=True

# 앱 접속 비밀번호
APP_PASSWORD=your_password
```

---

## 🔄 데이터 수집 스케줄러

### 스케줄링 설정

- **수집 시간**: 매일 자정 00:00 (KST)
- **수집 방식**: APScheduler CronTrigger
- **자동 실행**: 백엔드 서버 시작 시 자동 활성화

### 수동 수집

```python
# Python 셸에서
from app.services.scheduler import collect_all_data
import asyncio

# 전체 카테고리 수집
asyncio.run(collect_all_data())
```

### 카테고리별 수집 함수

```python
from app.services.scheduler import (
    collect_huggingface_data,
    collect_youtube_data,
    collect_papers_data,
    collect_news_data,
    collect_github_data,
    collect_leaderboard_data,
    collect_tool_data,
    collect_conference_data,
    collect_job_data,
    collect_policy_data,
    collect_startup_data,
)

# 특정 카테고리만 수집
asyncio.run(collect_huggingface_data())
```

### 수집 프로세스

1. **데이터 수집**: 각 카테고리별 서비스에서 외부 API/RSS 호출
2. **중복 제거**: unique 필드로 기존 데이터와 비교
3. **AI 요약**: Gemini API로 한글 요약 및 키워드 생성 (최대 10개/카테고리)
4. **데이터베이스 저장**: 새 항목만 저장
5. **로그 기록**: `logs/collection.log`에 수집 결과 기록

---

## 📊 로깅 시스템

### 로그 파일 구조

- **logs/app.log**: 전체 애플리케이션 로그 (INFO 레벨)
- **logs/error.log**: 에러 로그만 (ERROR 레벨)
- **logs/collection.log**: 데이터 수집 로그만 (INFO 레벨)

### 로그 로테이션

- **최대 파일 크기**: 10MB
- **백업 파일 개수**: 5개
- **자동 로테이션**: 파일 크기 초과 시 자동

### 로그 확인

```bash
# 전체 앱 로그
tail -f logs/app.log

# 에러 로그만
tail -f logs/error.log

# 수집 로그만
tail -f logs/collection.log
```

---

## 🎨 프론트엔드 기능

### 페이지 구성

1. **홈/대시보드** (`/`)
   - 전체 카테고리 통계
   - 최신 업데이트 정보
   - 키워드 클라우드 (예정)

2. **카테고리 페이지** (`/{category}`)
   - 카드 형식 데이터 표시
   - 페이지네이션
   - 원본 링크 제공
   - AI 요약 및 키워드 표시

3. **시스템 상태** (`/system`)
   - 각 카테고리별 데이터 개수
   - 최신 업데이트 시간
   - 헬스 체크 상태
   - 로그 조회 (예정)

4. **로그인** (`/login`)
   - 간단한 비밀번호 인증
   - 세션 관리 (localStorage)

### 네비게이션

- **사이드바 메뉴**: 11개 카테고리 + 시스템 상태
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **아이콘 및 색상**: 카테고리별 고유 아이콘 및 그라데이션

---

## 🚢 배포

### Railway (백엔드)

1. **Railway 프로젝트 생성**
2. **GitHub 연동** (자동 배포)
3. **PostgreSQL 서비스 추가**
4. **환경 변수 설정**:
   - `DATABASE_URL`: Railway PostgreSQL 연결 문자열 (자동)
   - `GEMINI_API_KEY`, `YOUTUBE_API_KEY`, `GITHUB_TOKEN`, `HUGGINGFACE_API_KEY`
   - `APP_PASSWORD`
5. **배포 완료**: https://your-app.railway.app

### Vercel (프론트엔드)

1. **Vercel 프로젝트 생성**
2. **GitHub 연동** (자동 배포)
3. **빌드 설정**:
   - Framework Preset: SvelteKit
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `.svelte-kit`
4. **환경 변수 설정**:
   - `VITE_API_URL`: Railway 백엔드 URL
   - `VITE_API_KEY`: 앱 접속 비밀번호
5. **배포 완료**: https://your-app.vercel.app

### GitHub Actions (CI/CD)

- **main** 브랜치에 push 시 자동 배포
- Railway: 백엔드 자동 재배포
- Vercel: 프론트엔드 자동 재배포

---

## 💰 비용 예상

### 무료
- **Google Gemini API**: 무료 티어 (월 1500 요청)
- **Railway**: 무료 티어 ($5/월 크레딧, PostgreSQL 포함)
- **Vercel**: 무료 티어 (개인 프로젝트)
- **GitHub**: 무료 (공개 리포지토리)
- **SQLite**: 무료 (로컬 개발)

### 유료 (필요 시)
- **Railway Pro**: $20/월 (더 많은 리소스)
- **OpenAI GPT-4o-mini**: ~$0.50/일 (1000 요약)

**총 예상 비용**: **$0/월** (무료 티어 사용 시)

---

## 🐛 트러블슈팅

### 백엔드가 시작되지 않을 때

```bash
# 가상환경 활성화 확인
source venv/bin/activate

# 패키지 재설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션 확인
alembic upgrade head

# 포트 충돌 확인
lsof -ti:8000 | xargs kill -9
```

### 프론트엔드 빌드 오류

```bash
# Node.js 버전 확인 (18 이상 필요)
node --version

# 패키지 재설치
cd web
rm -rf node_modules package-lock.json
npm install
```

### 데이터베이스 경로 오류

`.env` 파일의 `DATABASE_URL`을 절대 경로로 변경:

```env
DATABASE_URL=sqlite+aiosqlite:////Users/username/path/to/project/ai_trends.db
```

### API 키 오류

- `.env` 파일이 프로젝트 루트에 있는지 확인
- API 키가 올바른지 확인
- 백엔드 재시작: `uvicorn app.main:app --reload`

### "Failed to fetch" 프론트엔드 오류

1. **백엔드가 실행 중인지 확인**: http://localhost:8000/docs
2. **CORS 설정 확인**: `app/main.py`의 CORS 설정
3. **API 키 확인**: `web/vite.config.js`의 프록시 설정

---

## 📝 개발 로드맵

### ✅ Phase 1: 인프라 구축 (완료)
- [x] FastAPI 백엔드 구조
- [x] SQLAlchemy 비동기 ORM
- [x] SvelteKit 프론트엔드
- [x] Railway/Vercel 배포

### ✅ Phase 2: 11개 카테고리 구현 (완료)
- [x] Hugging Face 모델
- [x] YouTube 영상
- [x] AI 논문
- [x] AI 뉴스
- [x] GitHub 프로젝트
- [x] AI 리더보드
- [x] AI 도구
- [x] AI 컨퍼런스
- [x] AI 채용
- [x] AI 정책/규제
- [x] AI 스타트업/투자

### ✅ Phase 3: 시스템 기능 (완료)
- [x] APScheduler 크론 스케줄링
- [x] Gemini AI 요약
- [x] 로깅 시스템 (Rotating File Handler)
- [x] 시스템 상태 API
- [x] 키워드 집계

### ✅ Phase 4: 실제 데이터 연동 (완료)
- [x] RemoteOK API (채용)
- [x] TechCrunch RSS (스타트업)
- [x] AI News RSS (정책)
- [x] YouTube/GitHub/Hugging Face API

### 🚧 Phase 5: UI/UX 개선 (진행 중)
- [x] 로그인 페이지
- [x] 카테고리별 페이지
- [ ] 키워드 클라우드 시각화
- [ ] 다크 모드
- [ ] 검색 기능
- [ ] 필터링 기능

### 📅 Phase 6: 고급 기능 (예정)
- [ ] 사용자 계정 시스템
- [ ] 즐겨찾기 기능
- [ ] 알림 설정
- [ ] 모바일 앱 (React Native/Flutter)
- [ ] 데이터 분석 대시보드
- [ ] AI 챗봇 통합

---

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 👤 개발자

- **서동주**
- AI 개발 어시스턴트: **Claude Sonnet 4.5** (Anthropic)

---

## 📚 참고 문서

### 백엔드
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SQLAlchemy 공식 문서](https://docs.sqlalchemy.org/)
- [APScheduler 공식 문서](https://apscheduler.readthedocs.io/)
- [Alembic 공식 문서](https://alembic.sqlalchemy.org/)

### 프론트엔드
- [SvelteKit 공식 문서](https://kit.svelte.dev/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Vite 공식 문서](https://vitejs.dev/)

### AI & 데이터
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [GitHub API](https://docs.github.com/en/rest)
- [Hugging Face API](https://huggingface.co/docs/api-inference/)

### 배포
- [Railway 문서](https://docs.railway.app/)
- [Vercel 문서](https://vercel.com/docs)

---

## 🙏 감사의 말

이 프로젝트는 AI 업계 종사자들이 빠르게 변화하는 트렌드를 효율적으로 파악할 수 있도록 돕기 위해 만들어졌습니다.

**특별 감사**:
- Anthropic의 Claude Sonnet 4.5 - 전체 코드베이스 구현
- Google Gemini - 무료 AI 요약 제공
- Hugging Face - 모델 정보 및 리더보드 제공
- 오픈소스 커뮤니티 - 훌륭한 도구들

---

**마지막 업데이트**: 2026-02-01

**버전**: 0.2.0
