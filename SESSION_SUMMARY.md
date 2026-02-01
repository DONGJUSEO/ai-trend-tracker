# AI Trend Tracker - 개발 세션 요약

**프로젝트 이름**: AI Trend Tracker (웹) / AI Perspicio (모바일)
**개발 기간**: 2026-02-01
**기술 스택**: FastAPI, Svelte, React Native, PostgreSQL, Redis

---

## 📋 완료된 작업

### 1. 백엔드 개발 및 배포 ✅
- **FastAPI 백엔드** 구축
  - 5개 카테고리 데이터 수집 시스템
    1. Hugging Face 모델
    2. GitHub 프로젝트
    3. YouTube AI 영상
    4. ArXiv AI 논문
    5. AI 뉴스

- **Railway 배포**
  - URL: https://ai-trend-tracker-production.up.railway.app
  - HTTPS 보안 연결
  - PostgreSQL 데이터베이스 연결
  - Redis 캐싱
  - 환경 변수 설정:
    - APP_NAME, APP_PASSWORD
    - DATABASE_URL, REDIS_URL
    - GEMINI_API_KEY, YOUTUBE_API_KEY, GITHUB_TOKEN

- **주요 API 엔드포인트**
  ```
  GET  /api/v1/huggingface/         # Hugging Face 모델 목록
  GET  /api/v1/github/projects      # GitHub 프로젝트 목록
  GET  /api/v1/youtube/videos       # YouTube 영상 목록
  GET  /api/v1/papers/papers        # AI 논문 목록
  GET  /api/v1/news/news            # AI 뉴스 목록
  GET  /api/v1/system/status        # 시스템 상태
  GET  /api/v1/system/keywords      # 키워드 통계
  POST /api/v1/collect/*            # 데이터 수집 트리거
  ```

### 2. 프론트엔드 개발 및 배포 ✅
- **Svelte + SvelteKit** 웹 애플리케이션
- **Vercel 배포**
  - URL: https://ai-trend-tracker-beta.vercel.app
  - 자동 배포 (GitHub 연동)
  - API 프록시 설정 (vercel.json)

- **주요 페이지**
  1. **대시보드** (`/`)
     - 전체 통계 카드
     - 카테고리별 현황
     - 인기 키워드 TOP 15
     - 키워드 클라우드 시각화

  2. **카테고리별 페이지**
     - Hugging Face 모델 (`/huggingface`)
     - YouTube 영상 (`/youtube`)
     - AI 논문 (`/papers`)
     - AI 뉴스 (`/news`)
     - GitHub 프로젝트 (`/github`)

  3. **시스템 상태** (`/system`)
     - 서버 및 DB 상태 모니터링
     - 카테고리별 데이터 수집 현황

- **UI/UX 개선**
  - 현대적인 gradient 디자인
  - 반응형 레이아웃
  - 다크 모드에서 밝은 테마로 전환
  - 각 카테고리별 고유 gradient 색상
  - SVG 아이콘 사용
  - 부드러운 애니메이션 및 전환 효과
  - 우측 상단 새로고침 버튼
  - 사이드바 하단 실시간 시계

### 3. 시스템 상태 모니터링 ✅
- **백엔드 헬스 체크**
  - 데이터베이스 연결 상태
  - 각 카테고리별 데이터 개수
  - 최근 업데이트 시간
  - 전체 시스템 상태

- **키워드 분석**
  - 전체 카테고리 키워드 집계
  - 빈도수 기반 순위
  - 정규화된 가중치 계산
  - 워드 클라우드용 데이터 제공

### 4. 데이터 수집 ✅
- **Hugging Face 모델**: 20개 수집 완료
- **스케줄러 설정**: 12시간마다 자동 수집
- **AI 요약**: Gemini API 통합

### 5. GitHub 저장소 ✅
- **Repository**: https://github.com/DONGJUSEO/ai-trend-tracker
- **브랜치**: main
- **커밋 히스토리**:
  - Initial commit (프로젝트 구조)
  - Fix API endpoints and update UI to black/white theme
  - Add system status monitoring
  - Redesign UI with modern color scheme and add dashboard

### 6. 모바일 앱 계획 ✅
- **앱 이름**: AI Perspicio
- **의미**: 라틴어 "perspicio" (명확하게 보다, 통찰하다)
- **플랫폼**: iOS & Android (React Native + Expo)
- **상세 가이드**: `MOBILE_APP_GUIDE.md` 작성 완료

---

## 🏗️ 아키텍처

### 시스템 구성도
```
┌─────────────────────────────────────────┐
│         Frontend (Vercel)                │
│      Svelte + SvelteKit + Tailwind      │
│   https://ai-trend-tracker-beta         │
│          .vercel.app                     │
└──────────────┬──────────────────────────┘
               │ HTTPS API Calls
               │ (X-API-Key: test1234)
               ▼
┌─────────────────────────────────────────┐
│       Backend (Railway)                  │
│         FastAPI + Python                 │
│  https://ai-trend-tracker-production    │
│       .up.railway.app                    │
├─────────────────────────────────────────┤
│  - PostgreSQL (데이터베이스)            │
│  - Redis (캐싱)                          │
│  - Scheduler (데이터 수집)               │
│  - Gemini AI (요약 생성)                 │
└──────────────┬──────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  External APIs        │
    ├──────────────────────┤
    │  - Hugging Face API   │
    │  - GitHub API         │
    │  - YouTube API        │
    │  - ArXiv API          │
    │  - News RSS Feeds     │
    └──────────────────────┘
```

### 데이터 흐름
```
1. 스케줄러 (12시간마다)
   ↓
2. 데이터 수집 서비스
   ↓
3. 외부 API 호출
   ↓
4. 데이터 파싱 및 저장 (PostgreSQL)
   ↓
5. AI 요약 생성 (Gemini)
   ↓
6. 프론트엔드 요청 시 응답
```

---

## 🎨 디자인 시스템

### 색상 팔레트
```
Primary: Blue (#3B82F6 → #4F46E5)
Secondary: Purple (#8B5CF6)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Danger: Red (#EF4444)

카테고리별 Gradient:
- 대시보드: Purple → Pink
- Hugging Face: Yellow → Orange
- YouTube: Red → Dark Red
- Papers: Blue → Indigo
- News: Green → Emerald
- GitHub: Gray → Black
- System: Cyan → Blue
```

### 타이포그래피
```
Heading 1: 4xl (36px) - Bold
Heading 2: 2xl (24px) - Semibold
Heading 3: xl (20px) - Semibold
Body: base (16px) - Regular
Small: sm (14px) - Regular
```

---

## 📊 데이터베이스 스키마

### 주요 테이블

#### HuggingFaceModel
```sql
- id (PK)
- model_id (unique)
- model_name
- author
- description
- task
- tags (JSON)
- library_name
- downloads
- likes
- url
- summary (AI 생성)
- key_features (JSON)
- is_trending
- collected_at
- created_at
```

#### GitHubProject
```sql
- id (PK)
- repo_name (unique)
- description
- url
- stars
- language
- topics (JSON)
- summary (AI 생성)
- keywords (JSON)
- is_trending
- collected_at
- created_at
```

#### YouTubeVideo
```sql
- id (PK)
- video_id (unique)
- title
- channel_name
- description
- url
- view_count
- published_at
- summary (AI 생성)
- keywords (JSON)
- collected_at
- created_at
```

#### AIPaper
```sql
- id (PK)
- arxiv_id (unique)
- title
- authors
- abstract
- url
- published_date
- summary (AI 생성)
- keywords (JSON)
- collected_at
- created_at
```

#### AINews
```sql
- id (PK)
- title
- url (unique)
- source
- description
- published_date
- summary (AI 생성)
- keywords (JSON)
- collected_at
- created_at
```

---

## 🔑 환경 변수

### Railway (Backend)
```bash
APP_NAME="AI Trend Tracker"
APP_PASSWORD="test1234"
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
GEMINI_API_KEY="your-gemini-key"
YOUTUBE_API_KEY="your-youtube-key"
GITHUB_TOKEN="your-github-token"
PORT=8000
```

### Vercel (Frontend)
```
자동으로 환경 변수 불필요
(API 프록시는 vercel.json에서 설정)
```

---

## 📱 모바일 앱 계획

### AI Perspicio
- **이름 의미**: "아는 만큼 보인다" → 라틴어 "perspicio" (명확하게 보다)
- **플랫폼**: iOS & Android
- **기술**: React Native + Expo
- **기능**:
  - 웹 버전과 동일한 모든 기능
  - 네이티브 UI/UX
  - 푸시 알림 (향후)
  - 오프라인 모드 (향후)

### 개발 단계
1. ✅ 프로젝트 계획 및 문서화
2. ⏳ React Native 프로젝트 생성
3. ⏳ 화면 및 네비게이션 구현
4. ⏳ API 통합
5. ⏳ 테스트 및 최적화
6. ⏳ 앱 스토어 제출
   - Apple App Store ($99/년)
   - Google Play Store ($25 일회성)

---

## 🚀 향후 계획

### Phase 1: 모바일 앱 완성 (우선순위 높음)
- [ ] React Native 프로젝트 생성
- [ ] 모든 화면 구현
- [ ] 앱 스토어 제출

### Phase 2: 6개 신규 카테고리 추가
1. **AI Leaderboards** (Hugging Face LLM, LMSYS Chatbot Arena)
2. **AI Investment/Startups** (Crunchbase, Y Combinator)
3. **AI Conferences** (NeurIPS, ICML, ICLR, CVPR, Web Summit)
4. **AI Policy/Regulation** (EU AI Act, US regulations)
5. **AI Tool Directories** (Product Hunt, Futurepedia)
6. **AI Hiring Trends** (Tech stacks, libraries)

상세 계획은 이전 Plan 에이전트 결과 참조

### Phase 3: 고급 기능
- [ ] 사용자 계정 시스템
- [ ] 북마크 기능
- [ ] 알림 설정
- [ ] 다크 모드
- [ ] 다국어 지원 (영어)
- [ ] 고급 검색 필터
- [ ] 데이터 내보내기 (PDF, CSV)

### Phase 4: 분석 기능
- [ ] 트렌드 분석 차트
- [ ] 키워드 트렌드 추적
- [ ] 카테고리 간 상관관계 분석
- [ ] AI 기반 추천 시스템

---

## 🐛 알려진 이슈 및 해결

### 1. Hugging Face 모델 fetch 오류
**문제**: API 엔드포인트 경로 불일치
**해결**: `/api/v1/huggingface/models` → `/api/v1/huggingface/`

### 2. Tailwind CSS v4 호환성 문제
**문제**: PostCSS 플러그인 분리로 인한 오류
**해결**: Tailwind CSS v3.4.16으로 다운그레이드

### 3. Railway PORT 환경 변수 오류
**문제**: Docker CMD에서 $PORT 변수 치환 안 됨
**해결**: start.sh 스크립트 생성하여 처리

### 4. Papers, News API 엔드포인트 오류
**문제**: `/api/v1/papers` 대신 `/api/v1/papers/papers` 필요
**해결**: 프론트엔드 fetch URL 수정

---

## 📚 참고 문서

### 공식 문서
- FastAPI: https://fastapi.tiangolo.com/
- Svelte: https://svelte.dev/
- SvelteKit: https://kit.svelte.dev/
- Railway: https://docs.railway.app/
- Vercel: https://vercel.com/docs
- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/

### API 문서
- Hugging Face: https://huggingface.co/docs/api-inference
- GitHub: https://docs.github.com/en/rest
- YouTube: https://developers.google.com/youtube/v3
- ArXiv: https://info.arxiv.org/help/api/

---

## 👥 팀 및 기여

**개발자**: 서동주
**AI 어시스턴트**: Claude Sonnet 4.5
**프로젝트 시작**: 2026-02-01

---

## 📞 연락처 및 지원

**GitHub**: https://github.com/DONGJUSEO/ai-trend-tracker
**이슈 리포트**: GitHub Issues 사용

---

## 📝 라이선스

MIT License

---

**마지막 업데이트**: 2026-02-01

**다음 세션 시작 시 확인할 사항**:
1. Railway 백엔드 정상 작동 확인
2. Vercel 프론트엔드 배포 상태 확인
3. 데이터 수집 스케줄러 작동 확인
4. 모바일 앱 개발 진행 상황
5. 신규 카테고리 추가 필요 여부
