#!/bin/bash

# Railway의 PORT 환경 변수 사용, 없으면 8000 사용
PORT=${PORT:-8000}

echo "Starting FastAPI on port $PORT"

# Uvicorn 실행
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
