# AI Trend Tracker 🚀

> AI 트렌드를 한눈에 보는 큐레이션 서비스

**아는 만큼 보인다** - 바이브 코딩 시대에 필요한 AI 트렌드 정보를 자동으로 수집하고 요약해서 제공합니다.

---

## 📋 프로젝트 개요

AI 분야의 최신 트렌드를 여러 소스에서 자동으로 수집하고, AI로 요약하여 제공하는 크로스 플랫폼 모바일 앱입니다.

### 주요 기능

1. **🤗 Hugging Face** - 신규 AI 모델 정보, 성능, 용도 분석
2. **🎥 YouTube AI** - AI 관련 영상/쇼츠 요약, 키워드 추출
3. **📄 최신 논문** - arXiv, Google Scholar 논문 요약
4. **📰 뉴스/블로그** - AI 관련 뉴스, 블로그 포스트
5. **💬 AI 커뮤니티** - Reddit, Hacker News 트렌드
6. **⭐ GitHub Trending** - AI 관련 인기 오픈소스
7. **🔧 AI 툴/서비스** - 새로 출시된 AI 서비스

### 특징

- ⏰ **자동 업데이트**: 12시간마다 자동으로 최신 정보 수집
- 🤖 **AI 요약**: GPT-4o-mini로 한글 요약 제공
- 🔍 **키워드 추출**: 주요 키워드 자동 추출
- 📱 **크로스 플랫폼**: Android, iOS 모두 지원
- 🔗 **원본 링크**: 모든 정보에 원본 링크 제공

---

## 🛠️ 기술 스택

### 백엔드
- **FastAPI** - 고성능 Python 웹 프레임워크
- **PostgreSQL** - 메인 데이터베이스
- **Redis** - 캐싱 & 작업 큐
- **SQLAlchemy** - 비동기 ORM
- **APScheduler** - 스케줄링

### AI/데이터
- **OpenAI API** (GPT-4o-mini) - AI 요약
- **Hugging Face API** - 모델 정보
- **YouTube Data API** - 영상 정보
- **arXiv API** - 논문 정보

### 프론트엔드
- **React Native** - 크로스 플랫폼 모바일 앱

### 인프라
- **Docker & Docker Compose** - 컨테이너화

---

## 🚀 빠른 시작

### 1. 사전 요구사항

- **Docker Desktop** (Mac, Windows, Linux)
- **OpenAI API 키** (선택사항)
- **Hugging Face 토큰** (선택사항)

### 2. 프로젝트 클론

```bash
git clone <repository-url>
cd fastapi-starter
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 API 키를 설정하세요:

```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
# OpenAI API 키 (https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_key_here

# Hugging Face 토큰 (https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=your_token_here
```

### 4. Docker로 서비스 시작

```bash
# 서비스 빌드 및 시작
docker compose up -d --build

# 로그 확인
docker compose logs -f api
```

### 5. API 접속

서비스가 시작되면 아래 URL에서 확인할 수 있습니다:

- **API 문서 (Swagger)**: http://localhost:8000/docs
- **API 문서 (ReDoc)**: http://localhost:8000/redoc
- **루트 엔드포인트**: http://localhost:8000/
- **헬스체크**: http://localhost:8000/health
- **pgAdmin**: http://localhost:5050/ (admin@admin.com / admin)

---

## 📚 API 엔드포인트

### Hugging Face 모델

#### 모델 목록 조회
```http
GET /api/v1/huggingface/?page=1&page_size=20&task=text-generation
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `page_size`: 페이지당 항목 수 (기본값: 20, 최대: 100)
- `task`: 태스크 필터 (예: text-generation, image-classification)
- `author`: 작성자 필터
- `trending`: 트렌딩 모델만 보기 (true/false)

#### 모델 상세 조회
```http
GET /api/v1/huggingface/{model_id}
```

#### 태스크 목록
```http
GET /api/v1/huggingface/tasks/list
```

---

## 🐳 Docker 명령어

### 서비스 관리
```bash
# 서비스 시작
docker compose up -d

# 서비스 중지
docker compose down

# 서비스 재시작
docker compose restart

# 로그 확인
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f api
```

### 데이터베이스 관리
```bash
# PostgreSQL 접속
docker compose exec db psql -U postgres -d ai_trends

# 데이터베이스 백업
docker compose exec db pg_dump -U postgres ai_trends > backup.sql

# 데이터베이스 복원
docker compose exec -T db psql -U postgres ai_trends < backup.sql
```

### 개발 모드
```bash
# 서비스 재빌드
docker compose up -d --build

# 컨테이너 내부 접속
docker compose exec api bash

# Redis CLI 접속
docker compose exec redis redis-cli
```

---

## 📂 프로젝트 구조

```
fastapi-starter/
├── docker-compose.yml          # Docker 서비스 정의
├── Dockerfile                  # FastAPI 컨테이너
├── requirements.txt            # Python 패키지
├── .env                        # 환경 변수 (gitignore)
├── .env.example                # 환경 변수 예시
│
├── app/                        # 애플리케이션 코드
│   ├── main.py                 # FastAPI 앱
│   ├── config.py               # 설정 관리
│   ├── database.py             # DB 연결
│   │
│   ├── models/                 # SQLAlchemy 모델
│   │   └── huggingface.py      # Hugging Face 테이블
│   │
│   ├── schemas/                # Pydantic 스키마
│   │   └── huggingface.py      # API 검증
│   │
│   ├── api/                    # API 라우터
│   │   └── v1/
│   │       └── huggingface.py  # Hugging Face API
│   │
│   └── services/               # 비즈니스 로직
│       └── (예정)
│
└── docs/                       # 문서
    ├── PROGRESS.md             # 개발 진행 상황
    └── CONVERSATION_LOG.md     # 개발 대화 로그
```

---

## 💰 비용 예상

### 무료
- Docker, PostgreSQL, Redis
- FastAPI, Python
- Hugging Face API (읽기)

### 유료 (저렴)
- **OpenAI API (GPT-4o-mini)**
  - 하루 1000개 요약: ~$0.50 (500원)
  - 월 예상: ~$15 (15,000원)

---

## 🔑 API 키 발급

### OpenAI API
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 키 복사 후 `.env` 파일에 저장

### Hugging Face
1. https://huggingface.co/settings/tokens 접속
2. "New token" 클릭
3. "Read" 권한 선택
4. 토큰 복사 후 `.env` 파일에 저장

---

## 📖 개발 가이드

### 로컬 개발 (Docker 없이)

```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# PostgreSQL & Redis 직접 실행 필요
# 또는 docker-compose up -d db redis

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 새 패키지 추가

```bash
# 패키지 설치
pip install <package-name>

# requirements.txt 업데이트
pip freeze > requirements.txt

# Docker 이미지 재빌드
docker compose up -d --build
```

---

## 🐛 트러블슈팅

### Docker가 시작되지 않을 때
```bash
# Docker Desktop이 실행 중인지 확인
docker info

# 기존 컨테이너 정리
docker compose down -v
docker compose up -d --build
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 상태 확인
docker compose ps db

# 로그 확인
docker compose logs db

# 데이터베이스 재시작
docker compose restart db
```

### API 키 관련 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- API 키가 올바른지 확인
- Docker 재시작: `docker compose restart api`

---

## 📝 개발 로드맵

### ✅ Phase 1: 인프라 구축 (완료)
- [x] Docker 환경 구성
- [x] 데이터베이스 설계
- [x] API 구조 설계
- [x] Hugging Face 모델 정의

### 🚧 Phase 2: 데이터 수집 (진행 중)
- [ ] Hugging Face API 연동
- [ ] 스케줄러 구현
- [ ] AI 요약 기능
- [ ] 데이터 수집 테스트

### 📅 Phase 3: 추가 카테고리
- [ ] YouTube API 연동
- [ ] arXiv API 연동
- [ ] 뉴스/블로그 크롤링
- [ ] 커뮤니티 데이터 수집

### 📅 Phase 4: 프론트엔드
- [ ] React Native 프로젝트 초기화
- [ ] UI/UX 디자인
- [ ] API 연동
- [ ] Android/iOS 빌드

---

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

---

## 📄 라이선스

MIT License

---

## 👤 개발자

- **서동주**
- AI 어시스턴트: Claude (Anthropic)

---

## 📚 참고 문서

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Docker 공식 문서](https://docs.docker.com/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [React Native 공식 문서](https://reactnative.dev/)

---

**마지막 업데이트**: 2026-02-01
