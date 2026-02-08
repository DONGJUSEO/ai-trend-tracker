# 데이터 모델 — AI봄

9개 메인 모델 + 1개 헬퍼 모델. 모든 모델은 `app/models/`에 정의.

## 공통 필드 패턴

대부분의 모델이 아래 필드를 공유한다:

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Integer, PK | 자동 증가 |
| `summary` | Text | Gemini AI 생성 한국어 요약 |
| `keywords` | JSON | AI 추출 키워드 목록 |
| `is_trending` | Boolean | 트렌딩 여부 |
| `is_archived` | Boolean, indexed | 아카이브 여부 (30일+ 소프트 삭제) |
| `archived_at` | DateTime(tz) | 아카이브 일시 |
| `created_at` | DateTime(tz) | 생성 일시 |
| `updated_at` | DateTime(tz) | 수정 일시 |

> 모든 DateTime 컬럼은 `DateTime(timezone=True)` 사용

## 모델별 요약

### 1. HuggingFaceModel (`huggingface_models`)
**파일**: `app/models/huggingface.py`
- **고유키**: `model_id` (unique)
- **주요 필드**: `model_name`, `author`, `task`, `task_ko`(한국어 태스크명), `downloads`, `likes`, `library_name`
- **AI 필드**: `summary`, `key_features`(JSON), `use_cases`
- **특이사항**: `is_featured` 별도 존재

### 2. YouTubeVideo (`youtube_videos`)
**파일**: `app/models/youtube.py`
- **고유키**: `video_id` (unique, indexed)
- **주요 필드**: `title`, `channel_title`, `channel_id`, `channel_language`, `published_at`, `view_count`, `like_count`, `duration`
- **AI 필드**: `summary`, `keywords`, `key_points`(JSON)
- **특이사항**: `channel_language`로 한국어/영어 필터

### 3. AIPaper (`ai_papers`)
**파일**: `app/models/paper.py`
- **고유키**: `arxiv_id` (unique, indexed)
- **주요 필드**: `title`, `authors`(JSON), `abstract`, `categories`(JSON), `published_date`, `pdf_url`
- **AI 필드**: `summary`, `keywords`, `key_contributions`(JSON)
- **분류**: `topic`(NLP/CV/ML/RL/Multimodal), `conference_name`, `conference_year`

### 4. AINews (`ai_news`)
**파일**: `app/models/news.py`
- **고유키**: `url` (unique, indexed)
- **주요 필드**: `title`, `author`, `source`, `published_date`, `content`, `excerpt`, `image_url`
- **AI 필드**: `summary`, `keywords`, `key_points`(JSON)
- **특이사항**: `category` 기본값 "AI News"

### 5. GitHubProject (`github_projects`)
**파일**: `app/models/github.py`
- **고유키**: `repo_name` (unique, indexed, "owner/repo" 형식)
- **주요 필드**: `owner`, `name`, `description`, `language`, `stars`, `forks`, `topics`(JSON), `license`
- **AI 필드**: `summary`, `keywords`, `use_cases`(JSON)

### 6. AIConference (`ai_conferences`)
**파일**: `app/models/conference.py`
- **고유키**: `website_url` (unique, indexed)
- **주요 필드**: `conference_name`, `conference_acronym`, `year`, `start_date`, `end_date`, `submission_deadline`, `location`, `venue_type`
- **AI 필드**: `summary`, `keywords`, `highlights`(JSON)
- **특이사항**: `tier` (A*/A/B 등급), `is_upcoming`, `acceptance_rate`

### 7. AITool (`ai_tools`)
**파일**: `app/models/ai_tool.py`
- **고유키**: `tool_name` (unique), `website` (unique)
- **주요 필드**: `tagline`, `category`, `subcategory`, `pricing_model`, `rating`, `upvotes`
- **AI 필드**: `summary`, `keywords`, `key_features`(JSON), `best_for`(JSON)
- **특이사항**: `pricing_model` (Free/Freemium/Paid/Open Source)

### 8. AIJobTrend (`ai_job_trends`)
**파일**: `app/models/job_trend.py`
- **고유키**: `job_url` (unique, indexed)
- **주요 필드**: `job_title`, `company_name`, `location`, `is_remote`, `salary_min`, `salary_max`, `required_skills`(JSON)
- **AI 필드**: `summary`, `keywords`
- **특이사항**: `updated_at` 없음 (created_at만 존재)

### 9. AIPolicy (`ai_policies`)
**파일**: `app/models/policy.py`
- **고유키**: `source_url` (unique, indexed)
- **주요 필드**: `title`, `policy_type`, `country`, `status`, `effective_date`, `impact_areas`(JSON)
- **AI 필드**: `summary`, `keywords`
- **특이사항**: `updated_at` 없음 (created_at만 존재)

### 10. YouTubeChannel (헬퍼)
**파일**: `app/models/youtube_channel.py`
- 구독 채널 관리용 (메인 모델 아님)

## Alembic 마이그레이션 이력

| 리비전 | 설명 |
|--------|------|
| `9e449828dbcf` | 초기 스키마 (9개 테이블 생성) |
| `c2d3e4f5a6b7` | HF task_ko + Paper topic/conference 필드 추가 |
| `d3e4f5a6b7c8` | 전 테이블 archive 필드 + YT channel_language 추가 |
