# AI Trend Tracker - 개발 진행 상황

마지막 업데이트: 2026-02-01 19:54

## 📋 전체 진행 상황

### ✅ 완료된 작업

#### 1단계: 프로젝트 기본 구조 및 인프라 (완료)
- [x] Docker 개발 환경 구축 (FastAPI, PostgreSQL, Redis, pgAdmin)
- [x] FastAPI 프로젝트 기본 구조 생성
- [x] 데이터베이스 연결 및 ORM 설정 (SQLAlchemy 2.0 + asyncpg)
- [x] 환경 변수 관리 (Pydantic Settings)
- [x] API 인증 시스템 (X-API-Key: test1234)

#### 2단계: Hugging Face 데이터 수집 (완료)
- [x] Hugging Face API 서비스 구현
- [x] 데이터베이스 모델 설계 (HuggingFaceModel)
- [x] CRUD API 엔드포인트 구현
- [x] 실제 API 연동 및 데이터 수집 (26개 모델 수집 완료)
- [x] Gemini API 연동하여 AI 요약 생성
- [x] APScheduler로 12시간마다 자동 수집

#### 3단계: YouTube AI 영상 수집 (완료)
- [x] YouTube Data API v3 서비스 구현
- [x] 데이터베이스 모델 설계 (YouTubeVideo)
- [x] 비디오 검색 및 상세 정보 수집
- [x] API 엔드포인트 구현
- [x] AI 요약 생성 (Gemini API)
- [x] 스케줄러에 YouTube 수집 추가

### 🚧 진행 중인 작업

#### 4단계: AI Papers 데이터 수집 (예정)
- [ ] arXiv API 연동
- [ ] Google Scholar 데이터 수집
- [ ] 논문 메타데이터 및 초록 저장
- [ ] AI 요약 생성

#### 5단계: AI News/Blog 데이터 수집 (예정)
- [ ] RSS 피드 파서 구현
- [ ] 주요 AI 뉴스 사이트 크롤링
- [ ] 블로그 포스트 수집
- [ ] AI 요약 생성

#### 6단계: GitHub Trending & Communities (예정)
- [ ] GitHub Trending API 연동
- [ ] AI 관련 커뮤니티 데이터 수집
- [ ] 추가 데이터 소스 통합

### 📱 프론트엔드 개발 (예정)

#### Svelte 웹 애플리케이션
- [ ] Svelte + SvelteKit 프로젝트 초기화
- [ ] 왼쪽 사이드바 네비게이션 구현
- [ ] 5개 카테고리별 페이지 구현
- [ ] API 연동 및 데이터 표시
- [ ] 반응형 디자인
- [ ] 다크 모드 지원

### 🚀 배포 (예정)

#### Railway 백엔드 배포
- [ ] Railway 프로젝트 설정
- [ ] PostgreSQL 데이터베이스 설정
- [ ] Redis 설정
- [ ] 환경 변수 설정
- [ ] 도메인 연결

#### Vercel 웹 배포
- [ ] Vercel 프로젝트 설정
- [ ] 환경 변수 설정
- [ ] 자동 배포 설정
- [ ] 커스텀 도메인 연결

### 📱 모바일 앱 개발 (마지막 단계)
- [ ] React Native 프로젝트 초기화
- [ ] Android 앱 개발
- [ ] iOS 앱 개발
- [ ] 앱 스토어 배포

---

## 🗂️ 파일 구조

```
fastapi-starter/
├── app/
│   ├── main.py                    # FastAPI 앱 진입점
│   ├── config.py                  # 설정 관리 (Pydantic)
│   ├── database.py                # DB 연결 설정
│   ├── auth.py                    # 인증 시스템
│   │
│   ├── models/                    # SQLAlchemy 모델
│   │   ├── huggingface.py         # ✅ Hugging Face 모델
│   │   └── youtube.py             # ✅ YouTube 비디오 모델
│   │
│   ├── schemas/                   # Pydantic 스키마
│   │   ├── huggingface.py         # ✅ Hugging Face 스키마
│   │   └── youtube.py             # ✅ YouTube 스키마
│   │
│   ├── api/v1/                    # API 엔드포인트
│   │   ├── huggingface.py         # ✅ Hugging Face API
│   │   ├── youtube.py             # ✅ YouTube API
│   │   ├── collect.py             # ✅ 수동 수집 API
│   │   └── scheduler.py           # ✅ 스케줄러 제어 API
│   │
│   └── services/                  # 비즈니스 로직
│       ├── huggingface_service.py # ✅ Hugging Face 서비스
│       ├── youtube_service.py     # ✅ YouTube 서비스
│       ├── ai_summary_service.py  # ✅ AI 요약 서비스 (Gemini)
│       └── scheduler.py           # ✅ 스케줄러 서비스
│
├── docker-compose.yml             # ✅ Docker Compose 설정
├── Dockerfile                     # ✅ Docker 이미지 설정
├── requirements.txt               # ✅ Python 패키지 목록
├── .env                           # ✅ 환경 변수
└── docs/
    ├── PROGRESS.md                # 이 파일
    └── CONVERSATION_LOG.md        # 대화 내용 백업
```

---

## 🔑 필요한 API 키 및 서비스

### ✅ 설정 완료
1. **Gemini API** (무료)
   - ✅ 발급 완료
   - 용도: AI 요약 생성
   - 제한: 월 1,500회 무료

### ⚠️ 설정 필요
2. **YouTube Data API v3** (무료)
   - ❌ 아직 미설정
   - 발급 위치: https://console.cloud.google.com/
   - 용도: YouTube 비디오 검색 및 메타데이터
   - 제한: 일일 10,000 쿼터 (무료)
   - 참고: YouTube Premium과는 별개의 API

3. **Hugging Face API** (무료)
   - 선택 사항 (없어도 기본 데이터 수집 가능)
   - 발급 위치: https://huggingface.co/settings/tokens

### 📝 향후 필요할 수 있는 것들
4. **arXiv API** (무료, 키 불필요)
5. **Google Scholar** (크롤링 or SerpAPI 사용)
6. **Railway 계정** (배포용, 프리티어 있음)
7. **Vercel 계정** (배포용, 무료)

---

## 📊 현재 데이터베이스 상태

### Hugging Face 모델
- 총 26개 모델 저장
- AI 요약 생성 완료
- 자동 수집 활성화 (12시간마다)

### YouTube 비디오
- 테이블 생성 완료
- 수집 로직 구현 완료
- YouTube API 키 설정 후 수집 시작 예정

---

## 🎯 다음 단계

1. **YouTube API 키 발급 및 설정**
   - Google Cloud Console에서 프로젝트 생성
   - YouTube Data API v3 활성화
   - API 키 발급
   - .env 파일에 YOUTUBE_API_KEY 추가

2. **AI Papers 데이터 수집 구현**
   - arXiv API 연동
   - 논문 메타데이터 수집
   - AI 요약 생성

3. **AI News/Blog 수집 구현**
   - RSS 피드 파서
   - 주요 사이트 크롤링

4. **Svelte 웹 애플리케이션 개발 시작**
   - 프로젝트 초기화
   - 기본 레이아웃 구현
   - API 연동

---

## 🐛 알려진 이슈

1. Python 3.9 EOL 경고
   - Google 라이브러리에서 Python 3.10+ 권장
   - 현재 동작에는 문제 없음
   - 향후 Dockerfile에서 Python 3.10+ 사용 고려

---

## 📝 참고 사항

### 현재 사용 중인 기술 스택
- **백엔드**: FastAPI, SQLAlchemy 2.0, Pydantic v2
- **데이터베이스**: PostgreSQL 15
- **캐시**: Redis 7
- **AI**: Google Gemini API
- **스케줄링**: APScheduler
- **컨테이너**: Docker, Docker Compose

### 프로젝트 철학
> "아는 만큼 보인다" - 바이브 코딩 시대에 AI 트렌드를 빠르게 파악하고 학습하는 것이 경쟁력

### 목표
- AI 트렌드를 한눈에 볼 수 있는 큐레이션 서비스
- 한글 요약으로 쉽게 이해 가능
- 모바일/웹 어디서나 접근 가능
- 자동 업데이트로 최신 정보 유지
