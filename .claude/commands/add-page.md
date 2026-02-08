# 새 프론트엔드 페이지 추가

새로운 카테고리 페이지를 프론트엔드에 추가하는 워크플로.

## 입력
- 페이지명 (라우트 경로)
- 표시 이름 (한국어)
- 카테고리 색상
- 아이콘 (Lucide React 아이콘명)
- 백엔드 API 경로 및 응답 키

## 절차

### 1. 페이지 생성
`web-next/src/app/{name}/page.tsx` 파일 생성:
- 기존 페이지 패턴 참고 (예: `huggingface/page.tsx`)
- "use client" 선언
- fetch + Promise.allSettled 패턴
- 에러/로딩 상태 처리
- 페이지네이션 포함

### 2. 상수 등록
`web-next/src/lib/constants.ts`에 카테고리 추가:
- 카테고리 ID, 이름, 색상, 아이콘, 라우트 경로

### 3. 네비게이션 추가
아래 파일에 사이드바/모바일 네비 항목 추가:
- `web-next/src/components/layout/Sidebar.tsx`
- `web-next/src/components/layout/MobileNav.tsx`

### 4. 아이콘 등록
`web-next/src/components/icons/CategoryIcons.tsx`에 아이콘 매핑 추가

### 5. 대시보드 연동 (선택)
대시보드에 표시할 경우 `web-next/src/app/page.tsx`에서 API fetch 추가

### 6. 빌드 확인
```bash
cd web-next
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next build
```
