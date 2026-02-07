# ChatGPT Deep Research - 프론트엔드 기술 구현 참고자료

## 1. D3.js 워드 클라우드
- **라이브러리**: `@isoterik/react-word-cloud` (d3-cloud 래핑)
- **설치**: `npm install @isoterik/react-word-cloud d3`
- **문서**: https://github.com/isoteriksoftware/react-word-cloud
- **핵심**: "use client" 필수, words 배열 {text, value} 형태

## 2. Recharts 트렌드 타임라인
- **라이브러리**: `recharts`
- **설치**: `npm install recharts`
- **문서**: https://recharts.github.io
- **핵심**: ResponsiveContainer + LineChart, 다크테마 stroke 커스텀

## 3. 컨퍼런스 캘린더
- **라이브러리**: `@fullcalendar/react` + plugins
- **설치**: `npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction`
- **문서**: https://fullcalendar.io/docs/react
- **핵심**: dayGridMonth 뷰, events 배열 {title, date}

## 4. Framer Motion 뉴스 티커
- **라이브러리**: `framer-motion-ticker`
- **설치**: `npm install framer-motion framer-motion-ticker`
- **문서**: https://www.npmjs.com/package/framer-motion-ticker
- **핵심**: useReducedMotion 접근성, duration으로 속도 조절, overflow-hidden

## 5. API 통합 아키텍처
- **접근법**: Server Component에서 fetch → Client Component에 props 전달
- **SWR**: 클라이언트 직접 호출 시 사용 (`npm install swr`)
- **환경변수**: NEXT_PUBLIC_ 접두어로 클라이언트 노출, 민감 키는 서버 전용
- **캐싱**: Next.js fetch 기본 캐싱, `{ cache: 'no-store' }` 비활성화 옵션

---

## 참고 링크
- react-word-cloud: https://github.com/isoteriksoftware/react-word-cloud
- Recharts: https://recharts.org
- FullCalendar React: https://fullcalendar.io/docs/react
- Framer Motion useReducedMotion: https://motion.dev/docs/react-use-reduced-motion
- Next.js Data Fetching: https://nextjs.org/docs/app/getting-started/fetching-data
- Next.js Environment Variables: https://nextjs.org/docs/pages/guides/environment-variables
