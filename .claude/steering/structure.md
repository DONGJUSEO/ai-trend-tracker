# 구조 스티어링 — AI봄

## 백엔드 디렉토리 (`app/`)
```
app/
├── main.py              # FastAPI 앱 진입점, 라우터 등록, lifespan
├── config.py            # Pydantic Settings (환경변수)
├── database.py          # SQLAlchemy async engine & session
├── cache.py             # Redis 캐싱 유틸리티
├── auth.py              # API 키 검증 dependency
├── db_compat.py         # DB 스키마 호환성 헬퍼
├── logging_config.py    # 로깅 설정
├── models/              # SQLAlchemy ORM 모델 (테이블 1:1)
├── schemas/             # Pydantic 응답 스키마 (모델 1:1)
├── services/            # 비즈니스 로직 (수집, 요약, 검색)
├── api/v1/              # API 라우터 (카테고리 1:1)
└── seeds/               # DB 시드 데이터
```

### 새 엔드포인트 추가 흐름
`models/ → schemas/ → services/ → api/v1/ → main.py 등록`

## 프론트엔드 디렉토리 (`web-next/src/`)
```
src/
├── app/
│   ├── page.tsx             # 대시보드 (홈)
│   ├── layout.tsx           # 루트 레이아웃
│   ├── providers.tsx        # Context providers (Theme, Auth, SWR)
│   ├── globals.css          # 글로벌 CSS + 테마 변수
│   ├── api/[...path]/       # API 프록시 (→ FastAPI)
│   ├── login/page.tsx       # 로그인
│   ├── huggingface/page.tsx # 각 카테고리 페이지...
│   └── system/page.tsx      # 관리자 시스템 상태
├── components/
│   ├── layout/              # LayoutShell, Sidebar, TopBar, MobileNav
│   ├── ui/                  # Radix/Shadcn 기반 (button, card, badge 등)
│   ├── shared/              # 재사용 (GlassmorphicCard, DateBadge 등)
│   ├── dashboard/           # 대시보드 전용 (HeroSection, LivePulse 등)
│   ├── icons/               # 카테고리 아이콘 매핑
│   └── conferences/         # CalendarView (FullCalendar)
├── lib/
│   ├── fetcher.ts           # API fetch 유틸리티
│   ├── theme-context.tsx    # 테마 Context
│   ├── auth-context.tsx     # 인증 Context
│   ├── constants.ts         # 카테고리 정의, 색상
│   ├── types.ts             # TypeScript 타입
│   ├── utils.ts             # cn() 등 유틸
│   └── user-preferences.ts  # localStorage 헬퍼
└── styles/
    └── design-tokens.ts     # 디자인 시스템 토큰
```

## API 응답 키 매핑

| 엔드포인트 | 응답 키 | 비고 |
|-----------|---------|------|
| `/api/v1/huggingface/` | `items` | |
| `/api/v1/youtube/videos` | `videos` | |
| `/api/v1/papers/` | `papers` | |
| `/api/v1/news/news` | `news` | |
| `/api/v1/github/projects` | `items` | |
| `/api/v1/conferences/` | `items` | |
| `/api/v1/tools/` | `items` | 프론트: "platforms" |
| `/api/v1/jobs/` | `items` | |
| `/api/v1/policies/` | `items` | |
| `/api/v1/search` | `items` | 통합 검색 |
| `/api/v1/dashboard/summary` | 루트 | |

## 네이밍 규칙
- **Python**: `snake_case` (함수, 변수, 파일)
- **TypeScript**: `camelCase` (변수, 함수), `PascalCase` (컴포넌트)
- **파일명**: `kebab-case` (프론트), `snake_case` (백엔드)
- **CSS 클래스**: Tailwind 유틸리티 + `cn()` 조건부 결합
- **DB 테이블**: `snake_case` 복수형 (예: `ai_papers`, `youtube_videos`)

## 공통 패턴

### 페이지네이션 (백엔드)
```python
# 모든 리스트 엔드포인트 공통
page: int = Query(1, ge=1)
page_size: int = Query(20, ge=1, le=100)
```

### API 호출 (프론트엔드)
```typescript
// 다중 API 병렬 호출
const [res1, res2] = await Promise.allSettled([
  fetch('/api/v1/endpoint1'),
  fetch('/api/v1/endpoint2'),
]);
```

### 캐싱 (백엔드)
```python
# Redis TTL: 카테고리별 상이
cache_key = f"category:page:{page}:size:{page_size}"
cached = await cache_get(cache_key)
# TTL: system=60s, keywords=300s, list=180s
```

## tools ↔ platforms 매핑
- 백엔드 라우터: `/api/v1/tools/`
- 백엔드 모델: `AITool`, 테이블: `ai_tools`
- 프론트엔드 페이지: `/platforms`
- 프론트엔드 라벨: "AI 플랫폼"
- **주의**: 백엔드와 프론트엔드에서 이름이 다름
