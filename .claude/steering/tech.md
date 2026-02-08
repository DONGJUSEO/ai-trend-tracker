# 기술 스티어링 — AI봄

## 백엔드 스택
| 구성 요소 | 기술 | 버전 |
|-----------|------|------|
| 웹 프레임워크 | FastAPI | 최신 |
| ORM | SQLAlchemy (async) | 2.x |
| DB 마이그레이션 | Alembic | 최신 |
| 캐시 | Redis | 7 |
| 스케줄러 | APScheduler | 3.x |
| AI 요약 | Google Gemini API | 2.0-flash |
| 인증 | JWT (PyJWT) | - |
| 검증 | Pydantic v2 | - |

## 프론트엔드 스택
| 구성 요소 | 기술 | 버전 |
|-----------|------|------|
| 프레임워크 | Next.js (App Router) | 14.2.28 |
| UI 라이브러리 | React | 18.x |
| CSS | Tailwind CSS | 3.4.1 |
| UI 컴포넌트 | Radix UI + Shadcn/ui | 최신 |
| 애니메이션 | Framer Motion | 11.x |
| 데이터 fetching | SWR | 2.4 |
| 차트 | Recharts + D3 | 2.12 / 7.9 |
| 캘린더 | FullCalendar | 6.1.20 |
| 아이콘 | Lucide React | 0.344 |

## 인프라
- **Docker Compose**: api (FastAPI), db (PostgreSQL 15), redis (Redis 7)
- **컨테이너명**: ai-trend-api, ai-trend-db, ai-trend-redis
- **배포**: Railway (백엔드), Vercel (프론트엔드)
- **로컬 DB**: SQLite (aiosqlite) — Docker 외 개발 시

## 환경 제약 & 주의
- **Node.js**: v22.22.0, `/opt/homebrew/opt/node@22/bin` (keg-only, PATH 수동 추가)
- **npx**: sandbox에서 "spawn sh ENOENT" 에러 → `node node_modules/.bin/` 직접 실행
- **`.next` 충돌**: 부모 디렉토리에 `.next` 있으면 빌드 실패 → 삭제 필요
- **DB URL 변환**: `database.py`가 `postgresql://` → `postgresql+asyncpg://` 자동 변환. SQLite에서는 별도 처리 필요

## 인증 구조
- **클라이언트 인증**: localStorage 기반 패스워드 체크 (`aibom-auth`)
- **관리자 인증**: JWT 토큰 (`admin_token` in localStorage)
- **API 인증**: `X-API-Key` 헤더 (모든 엔드포인트)

## 빌드 커맨드 요약
```bash
# 백엔드
docker compose build api && docker compose up -d api
docker compose exec api alembic upgrade head
docker compose exec api pytest

# 프론트엔드
cd web-next
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next build
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next dev
```
