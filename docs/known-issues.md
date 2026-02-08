# 알려진 이슈 — AI봄

분석을 통해 발견된 개선이 필요한 항목들. 우선순위별 정리.

---

## 높은 우선순위

### 1. API 응답 키 비일관성
- **현상**: 엔드포인트마다 응답 키가 다름 (`items`, `videos`, `papers`, `news`)
- **영향**: 프론트엔드에서 조건부 처리 필요, 새 카테고리 추가 시 혼란
- **위치**: 각 `app/api/v1/*.py` 라우터, `app/schemas/*.py`
- **제안**: 모두 `items`로 통일하거나, 명확한 문서화 (현재 `docs/api-reference.md`에 기록됨)

### 2. 프론트엔드 유틸리티 함수 중복
- **현상**: `timeAgo()`, `formatNumber()` 등이 3개 이상 페이지에서 중복 정의
- **영향**: 수정 시 모든 사본을 찾아 고쳐야 함
- **위치**: `web-next/src/app/news/page.tsx`, `papers/page.tsx`, `youtube/page.tsx` 등
- **제안**: `web-next/src/lib/utils.ts`로 통합

### 3. 에러 UI 부재
- **현상**: API 호출 실패 시 사용자에게 에러 메시지 표시 없음 (silent fail)
- **영향**: 데이터가 안 보여도 원인을 알 수 없음
- **위치**: 모든 `page.tsx` 파일의 `fetch().catch(() => {})`
- **제안**: 공통 에러 상태 컴포넌트 추가

---

## 중간 우선순위

### 4. /search 결과 페이지 미구현
- **현상**: TopBar에서 검색하면 드롭다운 결과는 보이나, 전체 결과 페이지 없음
- **영향**: 검색 결과가 많을 때 전체 확인 불가
- **위치**: `web-next/src/app/` (search 디렉토리 없음)
- **제안**: `web-next/src/app/search/page.tsx` 생성

### 5. 듀얼 인증 시스템
- **현상**: 클라이언트 인증(localStorage 패스워드)과 관리자 인증(JWT)이 분리
- **영향**: 사용자 혼란, 두 곳 모두 "test1234" 하드코딩
- **위치**: `web-next/src/lib/auth-context.tsx`, `web-next/src/app/system/page.tsx`
- **제안**: 통합 인증 시스템으로 리팩토링 (프로덕션 배포 전)

### 6. TypeScript 타입 중복 정의
- **현상**: 페이지별로 인라인 타입 정의 (NewsItem, PaperItem 등)
- **영향**: `lib/types.ts`와 중복, 타입 불일치 위험
- **위치**: 각 페이지 파일 상단
- **제안**: `web-next/src/lib/types.ts`로 통합

### 7. DB URL 핸들링 (SQLite vs PostgreSQL)
- **현상**: `database.py`가 PostgreSQL URL만 가정
- **영향**: 로컬 SQLite 개발 시 URL 변환 실패
- **위치**: `app/database.py:8`, `app/db_compat.py`
- **제안**: DB 엔진별 분기 처리 추가

---

## 낮은 우선순위

### 8. models/__init__.py 미완성
- **현상**: HuggingFaceModel만 export, 나머지 8개 모델 누락
- **위치**: `app/models/__init__.py`

### 9. Redis 실패 처리
- **현상**: Redis 다운 시 캐시 연산이 조용히 실패
- **위치**: `app/cache.py`, 각 서비스

### 10. 이미지 호스트 와일드카드
- **현상**: `next.config.mjs`에서 `hostname: "**"` 사용
- **영향**: 보안/성능 우려
- **위치**: `web-next/next.config.mjs`

### 11. Rate Limiting 부재
- **현상**: API 키 인증은 있으나 요청 제한 없음
- **제안**: FastAPI middleware로 rate limiter 추가
