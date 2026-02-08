# 백엔드 컨벤션 — AI봄 FastAPI

## 새 엔드포인트 추가 순서
1. `models/` — SQLAlchemy 모델 생성
2. `schemas/` — Pydantic 응답 스키마 생성
3. `services/` — 비즈니스 로직 서비스 생성
4. `api/v1/` — FastAPI 라우터 생성
5. `main.py` — 라우터 등록 (`app.include_router(...)`)
6. `alembic revision --autogenerate` — 마이그레이션 생성

## 필수 규칙
- 모든 DateTime 컬럼: `DateTime(timezone=True)` 사용
- DB 스키마 변경: 반드시 Alembic 마이그레이션으로 (직접 수정 금지)
- 모든 DB 작업: `async def` + `AsyncSession` 사용
- 모든 엔드포인트: `verify_api_key` dependency 적용
- JSON 필드: `from sqlalchemy import JSON` 사용
- 인덱스: 자주 검색하는 컬럼에 `index=True` 추가

## 스케줄러 주기
| 카테고리 | 주기 | Job ID |
|---------|------|--------|
| News | 1시간 | `collect_news` |
| YouTube | 4시간 | `collect_youtube` |
| HuggingFace | 6시간 | `collect_huggingface` |
| GitHub | 6시간 | `collect_github` |
| Jobs | 6시간 | `collect_jobs` |
| Papers | 12시간 | `collect_papers` |
| Conferences | 1일 | `collect_conferences` |
| Policies | 1일 | `collect_policies` |
| Tools | 1주 | `collect_tools` |
| Archive | 1일 | `archive_old_data` |
| Keywords | 2시간 | `collect_trending_keywords` |

## AI 요약 서비스
- 파일: `services/ai_summary_service.py`
- 모델: Gemini 2.0-flash
- 메서드: `summarize_huggingface_model()`, `summarize_youtube_video()`, `summarize_paper()`, `summarize_news()`
- 출력: 한국어 요약 텍스트

## 캐시 전략
- Redis 키 패턴: `{category}:page:{n}:size:{s}`
- TTL: system=60s, keywords=300s, list=180s
- 수집 완료 후 관련 캐시 자동 무효화
