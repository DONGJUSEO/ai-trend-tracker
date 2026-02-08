# AI봄 (AI Trend Tracker)

AI 기술 트렌드를 자동 수집·요약하여 한눈에 보여주는 한국어 플랫폼.

## 아키텍처

- **백엔드**: FastAPI + SQLAlchemy(async) + Alembic + Redis + APScheduler → `app/`
- **프론트엔드**: Next.js 14 App Router + Tailwind CSS + SWR → `web-next/`
- **인프라**: Docker Compose (api=Python 3.11, db=PostgreSQL15, redis=Redis7)
- **AI 요약**: Google Gemini 2.0-flash (`app/services/ai_summary_service.py`)
- **인증**: API Key (서버 프록시 전용) + HMAC 토큰 (관리자)
- **배포**: Railway(백엔드) / Vercel(프론트엔드)

## 빌드 & 실행

```bash
# 백엔드 (Docker)
docker compose build api && docker compose up -d api

# DB 마이그레이션
docker compose exec api alembic upgrade head

# 프론트엔드 빌드 (Node v22 keg-only 주의)
cd web-next
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next build

# 프론트엔드 개발 서버
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next dev
```

## 주의사항

- `npx`는 sandbox 환경에서 "spawn sh ENOENT" 에러 발생 → `node node_modules/.bin/` 직접 사용
- 부모 디렉토리에 `.next` 폴더가 있으면 빌드 충돌 → 확인 후 삭제
- Node v22는 `/opt/homebrew/opt/node@22/bin`에 keg-only 설치 → PATH 추가 필수
- `.env`는 .gitignore 대상. 로컬 SQLite / Docker는 PostgreSQL 사용
- `app_password`, `admin_password`, `jwt_secret_key`는 환경변수 필수 (미설정 시 기동 실패)
- `debug` 기본값 `False` — 개발 시 `.env`에 `DEBUG=true` 설정

## 코드 스타일

- **Python**: async/await, type hints 필수, Pydantic v2, snake_case
- **TypeScript**: strict 모드, named export, camelCase
- **파일명**: kebab-case (프론트엔드), snake_case (백엔드)
- **API 응답 키**: 엔드포인트별 상이 → `@docs/api-reference.md` 참조

## 9대 데이터 카테고리

HuggingFace | YouTube | Papers | News | GitHub | Conferences | Platforms(=Tools) | Jobs | Policies

## 상세 문서

- 제품 비전: `@.claude/steering/product.md`
- 기술 스택: `@.claude/steering/tech.md`
- 구조 컨벤션: `@.claude/steering/structure.md`
- API 레퍼런스: `@docs/api-reference.md`
- 데이터 모델: `@docs/data-models.md`
- 알려진 이슈: `@docs/known-issues.md`
