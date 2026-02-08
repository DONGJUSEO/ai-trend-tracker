# 프론트엔드 컨벤션 — AI봄 Next.js

## 빌드 & 실행
```bash
# 반드시 PATH에 Node v22 추가
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next build
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node node_modules/.bin/next dev
```
> npx는 sandbox에서 실패 → `node node_modules/.bin/` 직접 사용

## 컴포넌트 구조
```
src/components/
├── layout/      # LayoutShell, Sidebar, TopBar, MobileNav, LoginScreen
├── ui/          # Radix/Shadcn 기본 컴포넌트 (button, card, badge 등)
├── shared/      # 재사용 컴포넌트 (GlassmorphicCard, DateBadge 등)
├── dashboard/   # 대시보드 전용 (HeroSection, LivePulse 등)
├── icons/       # 카테고리 아이콘
└── conferences/ # CalendarView (FullCalendar)
```

## API 호출 패턴
```typescript
// 프록시 경유: /api/[...path] → FastAPI 백엔드
const res = await fetch('/api/v1/endpoint?page=1&page_size=20');
const data = await res.json();
// 응답 키는 엔드포인트별 상이 → docs/api-reference.md 참조
```

## 테마 시스템
- 다크 모드 (기본) / 라이트 모드
- CSS 변수: `globals.css`의 `:root`, `.light`, `.dark`
- Context: `lib/theme-context.tsx` → `useTheme()`
- 저장: `localStorage.aibom-theme`
- Tailwind: `darkMode: ["class"]`

## tools ↔ platforms 매핑 주의
- 백엔드 API: `/api/v1/tools/`
- 프론트 라우트: `/platforms`
- 프론트 라벨: "AI 플랫폼"

## localStorage 키
| 키 | 용도 |
|----|------|
| `aibom-auth` | 클라이언트 인증 상태 |
| `aibom-theme` | 테마 설정 (dark/light) |
| `aibom-guide-collapsed` | 대시보드 가이드 접기 |
| `aibom-bookmarks` | 북마크 목록 |
| `aibom-recent` | 최근 조회 |
| `admin_token` | 관리자 JWT 토큰 |

## 공통 유틸리티 (`lib/`)
- `cn()`: 조건부 클래스명 결합 (clsx + twMerge)
- `apiFetcher()`: SWR 호환 fetch 래퍼
- `buildApiUrl()`: API URL 빌더
