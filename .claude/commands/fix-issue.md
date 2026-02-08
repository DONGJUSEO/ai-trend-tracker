# 버그 수정 워크플로

이슈를 체계적으로 수정하는 절차.

## 입력
- 이슈 설명 (증상)
- 재현 경로 (가능한 경우)

## 절차

### 1. 탐색
- 관련 파일 탐색 (Grep/Glob 사용)
- 에러 로그 확인 (해당 시)
- 재현 확인

### 2. 원인 분석
- 코드 흐름 추적
- 관련 모델/서비스/라우터 확인
- 프론트/백 모두 확인 (풀스택 버그 가능)

### 3. 수정
- 최소 변경 원칙 (관련 없는 코드 수정 금지)
- 타입 안전성 유지

### 4. 검증
```bash
# 백엔드 변경 시
docker compose build api && docker compose up -d api

# 프론트엔드 변경 시
cd web-next
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next build
```

### 5. 문서 업데이트
- `docs/known-issues.md`에서 해결된 이슈 제거 (해당 시)
