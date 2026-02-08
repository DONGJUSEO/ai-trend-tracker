# 알려진 이슈 — AI봄

최종 업데이트: 2026-02-08

아래 항목들은 v4.0 정비 작업에서 해결 완료되었습니다.

## 해결 완료

1. API 응답 키 비일관성
- `items` 호환 필드를 주요 리스트 응답에 통일 제공.

2. 프론트엔드 유틸리티 함수 중복
- `web-next/src/lib/format.ts`로 `timeAgo`, `formatNumber` 공통화.

3. 에러 UI 부재
- 공통 `ErrorState`를 대시보드/카테고리 페이지 전반에 적용.

4. `/search` 결과 페이지 미구현
- `web-next/src/app/search/page.tsx` 구현 완료.
- TopBar 검색에서 Enter/버튼으로 전체 검색 페이지 이동 지원.

5. 듀얼 인증 시스템
- 시스템 페이지 인증 로직을 `useAuth` 기반으로 통합.

6. TypeScript 타입 중복
- 주요 대시보드/잡스 페이지를 `web-next/src/lib/types.ts` 타입으로 통합.

7. DB URL 핸들링 (SQLite vs PostgreSQL)
- `app/database.py`에서 PostgreSQL/SQLite async URL 정규화 처리.

8. `models/__init__.py` 미완성
- 9개 도메인 모델 export 완료.

9. Redis 실패 처리
- 재연결/재시도 래퍼 추가, 방문자 집계(HLL) 연산 안정화.

10. 이미지 호스트 와일드카드
- 과도한 `hostname: "**"` 제거.

11. Rate Limiting 부재
- FastAPI 미들웨어에 IP 기준 분당 요청 제한 추가.

## 잔여 기술부채(비기능)

1. Pydantic v2 경고
- 다수 스키마의 `class Config`가 향후 deprecate 예정.
- 기능상 문제는 없지만, 추후 `ConfigDict`로 마이그레이션 권장.
