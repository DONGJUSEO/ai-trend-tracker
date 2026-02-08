"""인증 회귀 테스트.

F-1 #2: 기본 비밀번호 금지, 관리자 검증 실패 차단.
"""
import os
import importlib


def test_default_password_forbidden():
    """Settings에 기본 비밀번호가 하드코딩되어 있지 않은지 확인."""
    from app.config import Settings

    # 필수 환경변수 없이 생성하면 ValidationError 발생해야 함
    env_backup = {}
    for key in ("APP_PASSWORD", "ADMIN_PASSWORD", "JWT_SECRET_KEY", "DATABASE_URL", "REDIS_URL"):
        env_backup[key] = os.environ.pop(key, None)

    try:
        from pydantic import ValidationError

        raised = False
        try:
            # lru_cache 우회를 위해 직접 생성
            Settings()
        except (ValidationError, Exception):
            raised = True

        assert raised, "APP_PASSWORD 미설정 시 Settings 생성이 실패해야 합니다"
    finally:
        # 환경변수 복원
        for key, value in env_backup.items():
            if value is not None:
                os.environ[key] = value


def test_hardcoded_test1234_not_in_config():
    """config.py에 'test1234'가 기본값으로 존재하지 않는지 확인."""
    import inspect
    from app.config import Settings

    source = inspect.getsource(Settings)
    assert "test1234" not in source, "config.py에 'test1234' 하드코딩이 남아 있습니다"
    assert "admin1234" not in source, "config.py에 'admin1234' 하드코딩이 남아 있습니다"


def test_api_key_not_in_frontend_env():
    """NEXT_PUBLIC_API_KEY가 프론트엔드 .env에 없는지 확인."""
    env_files = [
        "web-next/.env",
        "web-next/.env.local",
        "web-next/.env.production",
    ]
    import pathlib

    root = pathlib.Path(__file__).parent.parent
    for env_file in env_files:
        path = root / env_file
        if path.exists():
            content = path.read_text()
            assert "NEXT_PUBLIC_API_KEY" not in content, (
                f"{env_file}에 NEXT_PUBLIC_API_KEY가 남아 있습니다"
            )
