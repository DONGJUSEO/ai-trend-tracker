# 제품 스티어링 — AI봄

## 미션
AI/ML 기술 트렌드를 **자동 수집·AI 요약**하여 한국어로 한눈에 제공하는 플랫폼.
개발자, 연구자, 의사결정자가 매일 방문하는 **AI 트렌드 허브**를 지향한다.

## 타깃 유저
1. **AI 개발자** — 최신 모델, 도구, GitHub 프로젝트 탐색
2. **AI 연구자** — 논문 트렌드, 학회 일정 추적
3. **비즈니스 의사결정자** — 정책, 채용 동향, 산업 뉴스 파악

## 9대 데이터 카테고리

| # | 카테고리 | 소스 | 수집 주기 | 설명 |
|---|---------|------|----------|------|
| 1 | HuggingFace | HF API | 6시간 | 트렌딩 AI 모델 |
| 2 | YouTube | YouTube API v3 | 4시간 | AI 관련 영상 (한국어/영어 채널) |
| 3 | Papers | arXiv API | 12시간 | AI/ML 논문 (토픽·학회 분류) |
| 4 | News | RSS 피드 | 1시간 | AI 뉴스 (TechCrunch, VentureBeat 등) |
| 5 | GitHub | GitHub API | 6시간 | 트렌딩 AI 레포 (언어별 fan-out) |
| 6 | Conferences | 웹 스크래핑 | 1일 | AI 학회 캘린더 (ICML, NeurIPS 등) |
| 7 | Platforms | Product Hunt 등 | 1주 | AI 도구/플랫폼 디렉토리 |
| 8 | Jobs | 채용 사이트 | 6시간 | AI 채용 트렌드 |
| 9 | Policies | 정부/규제 사이트 | 1일 | AI 정책 추적 |

## 핵심 기능
- **자동 수집**: APScheduler 기반, 카테고리별 최적 주기
- **AI 요약**: Gemini 2.0-flash로 한국어 요약 자동 생성
- **대시보드**: 트렌딩 키워드 워드클라우드, 카테고리 통계, 실시간 펄스
- **글로벌 검색**: 전체 카테고리 통합 검색 (FTS)
- **테마**: 다크/라이트 모드 지원
- **PWA**: Progressive Web App 지원

## 브랜딩
- 앱 이름: **AI봄** (이전: Ain싸)
- 로고 파일: `web-next/public/AI봄.jpg`
- localStorage 키 접두사: `aibom-`

## 현재 데이터 규모
약 351+ items (HF 27, YT 79, Papers 20, News 110, Conf 50, Tools 22, Jobs 30, Policies 13)
