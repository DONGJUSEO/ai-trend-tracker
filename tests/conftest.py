"""공통 테스트 픽스처."""
import os

# 테스트 환경변수 설정 (Settings 로드 전에 반드시 필요)
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///test.db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")
os.environ.setdefault("APP_PASSWORD", "test-pw-for-ci")
os.environ.setdefault("ADMIN_PASSWORD", "admin-pw-for-ci")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-for-ci")
