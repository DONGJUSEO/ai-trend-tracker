# API 레퍼런스 — AI봄

모든 엔드포인트는 `/api/v1/` 접두사를 사용하며, `X-API-Key` 헤더 인증이 필요하다.

## 인증

| 방식 | 헤더/바디 | 용도 |
|------|----------|------|
| API Key | `X-API-Key: {key}` | 모든 데이터 API (서버 프록시에서 자동 주입) |
| HMAC Bearer | `Authorization: Bearer {token}` | 관리자 전용 (`/admin/verify`) |

> **주의**: API Key는 Next.js 서버 프록시(`route.ts`)에서만 주입된다. 브라우저에 노출되지 않는다.

## 페이지네이션 (공통)

```
?page=1&page_size=20
```
- `page`: 1부터 시작 (기본값: 1)
- `page_size`: 1~100 (기본값: 20)
- 응답에 `total`, `page`, `page_size` 포함

## 엔드포인트 목록

### HuggingFace — `/api/v1/huggingface`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/` | `items` | 모델 목록 (페이지네이션) |
| GET | `/{model_id}` | - | 모델 상세 |
| POST | `/` | - | 모델 생성 (테스트용) |
| GET | `/tasks/list` | - | 사용 가능한 task 목록 |

### YouTube — `/api/v1/youtube`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/videos` | `videos` | 영상 목록 |
| GET | `/videos/{video_id}` | - | 영상 상세 |
| GET | `/search` | - | 실시간 영상 검색 |

### Papers — `/api/v1/papers`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/` | `papers` | 논문 목록 |
| GET | `/{arxiv_id}` | - | 논문 상세 |
| GET | `/search` | - | 실시간 논문 검색 |

### News — `/api/v1/news`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/news` | `news` | 뉴스 목록 |
| GET | `/news/{news_id}` | - | 뉴스 상세 |
| GET | `/sources` | - | 소스 목록 |
| GET | `/fetch` | - | 실시간 뉴스 수집 |

### GitHub — `/api/v1/github`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/projects` | `items` | 프로젝트 목록 |
| GET | `/projects/{repo_name}` | - | 프로젝트 상세 |
| GET | `/search` | - | 실시간 검색 |

### Conferences — `/api/v1/conferences`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/` | `items` | 학회 목록 (`?upcoming=true` 필터) |
| GET | `/{conference_id}` | - | 학회 상세 |

### Tools (Platforms) — `/api/v1/tools`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/` | `items` | 도구 목록 |
| GET | `/{tool_id}` | - | 도구 상세 |

> 프론트엔드에서는 "Platforms"로 표시됨

### Jobs — `/api/v1/jobs`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/` | `items` | 채용 목록 |

### Policies — `/api/v1/policies`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/` | `items` | 정책 목록 |

### Dashboard — `/api/v1/dashboard`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `/summary` | 루트 | 대시보드 요약 통계 |
| GET | `/trending-keywords` | `top_keywords` | 트렌딩 키워드 |
| GET | `/external-trending-keywords` | `keywords` | 외부 트렌딩 키워드 |
| GET | `/category-stats` | - | 카테고리 통계 |
| GET | `/live-pulse` | - | 실시간 데이터 |

### Search — `/api/v1/search`
| 메서드 | 경로 | 응답 키 | 설명 |
|--------|------|---------|------|
| GET | `` | `items` | 전체 카테고리 통합 검색 (`?q=키워드`) |

### System — `/api/v1/system`
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/status` | 시스템 헬스 |
| GET | `/keywords` | 키워드 집계 |
| GET | `/collection-logs` | 수집 작업 로그 |
| POST | `/collect` | 데이터 수집 트리거 (비동기) |
| POST | `/collect/sync` | 데이터 수집 트리거 (동기) |

### Admin — `/api/v1/admin`
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/site-login` | 사이트 접근 비밀번호 검증 (`app_password`) |
| POST | `/login` | 관리자 로그인 (→ HMAC 토큰, `admin_password`) |
| GET | `/verify` | 토큰 유효성 검증 |
