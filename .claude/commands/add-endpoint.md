# 새 API 엔드포인트 추가

새로운 백엔드 API 엔드포인트를 추가하는 워크플로.

## 입력
- 엔드포인트 이름 (예: "bookmarks")
- 주요 필드 목록
- 응답 키 (기본: `items`)

## 절차

### 1. 모델 생성
`app/models/{name}.py` 파일 생성:
- 공통 필드 포함: id, summary, keywords, is_trending, is_archived, archived_at, created_at, updated_at
- DateTime(timezone=True) 필수
- unique 키 + index 설정

### 2. 스키마 생성
`app/schemas/{name}.py` 파일 생성:
- Pydantic v2 BaseModel
- 단건 응답 + 목록 응답 스키마
- model_config = ConfigDict(from_attributes=True)

### 3. 서비스 생성
`app/services/{name}_service.py` 파일 생성:
- async 함수: fetch_{name}(), get_{name}s(), get_{name}_by_id()
- 캐시 적용 (cache_get/cache_set)
- AI 요약 연동 (필요 시)

### 4. 라우터 생성
`app/api/v1/{name}.py` 파일 생성:
- verify_api_key dependency
- 페이지네이션: page, page_size 파라미터
- 응답 키 통일

### 5. 라우터 등록
`app/main.py`에 추가:
```python
from app.api.v1 import {name}
app.include_router({name}.router, prefix="/api/v1/{name}", tags=["{Name}"])
```

### 6. 마이그레이션
```bash
docker compose exec api alembic revision --autogenerate -m "add_{name}_table"
docker compose exec api alembic upgrade head
```

### 7. 검증
- Docker 재빌드: `docker compose build api && docker compose up -d api`
- API 테스트: `curl http://localhost:8000/api/v1/{name}/`
