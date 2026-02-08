# 데이터 수집 실행 워크플로

수동으로 데이터 수집을 트리거하는 방법.

## API를 통한 수집

### 비동기 수집 (권장)
```bash
curl -X POST http://localhost:8000/api/v1/system/collect \
  -H "X-API-Key: test1234" \
  -H "Content-Type: application/json" \
  -d '{"category": "news"}'
```

### 동기 수집 (결과 대기)
```bash
curl -X POST http://localhost:8000/api/v1/system/collect/sync \
  -H "X-API-Key: test1234" \
  -H "Content-Type: application/json" \
  -d '{"category": "news"}'
```

## 사용 가능한 카테고리
- `huggingface` — HuggingFace 모델
- `youtube` — YouTube 영상
- `papers` — arXiv 논문
- `news` — AI 뉴스
- `github` — GitHub 프로젝트
- `conferences` — AI 학회
- `tools` — AI 도구/플랫폼
- `jobs` — AI 채용
- `policies` — AI 정책
- `all` — 전체 카테고리

## 수집 상태 확인
```bash
curl http://localhost:8000/api/v1/system/status \
  -H "X-API-Key: test1234"
```

## 수집 로그 확인
```bash
curl http://localhost:8000/api/v1/system/collection-logs \
  -H "X-API-Key: test1234"
```
