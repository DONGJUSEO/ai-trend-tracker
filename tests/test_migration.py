"""마이그레이션 스모크 테스트.

F-1 #1: Alembic 마이그레이션 체인이 정상인지 확인.
"""
import subprocess
import sys
import os
from pathlib import Path


def test_alembic_heads_single():
    """Alembic head가 단 하나인지 확인 (브랜치 분기 방지)."""
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "heads"],
        capture_output=True,
        text=True,
        cwd=str(__import__("pathlib").Path(__file__).parent.parent),
    )
    # 출력에서 revision ID 라인만 카운트
    heads = [
        line.strip()
        for line in result.stdout.strip().splitlines()
        if line.strip() and not line.startswith("INFO")
    ]
    assert len(heads) <= 1, f"Alembic head가 {len(heads)}개 발견됨 (분기 있음): {heads}"


def test_alembic_history_no_gaps():
    """Alembic history에 끊어진 체인이 없는지 확인."""
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "history", "--verbose"],
        capture_output=True,
        text=True,
        cwd=str(__import__("pathlib").Path(__file__).parent.parent),
    )
    # 'FAILED' 또는 'error' 가 없으면 체인 정상
    assert result.returncode == 0, f"alembic history 실패: {result.stderr}"
    assert "FAILED" not in result.stdout, f"마이그레이션 체인 오류: {result.stdout}"


def test_alembic_upgrade_head_smoke_sqlite():
    """빈 SQLite DB 기준 alembic upgrade head 스모크 테스트."""
    root = Path(__file__).parent.parent
    db_path = root / "test_migration_smoke.db"
    if db_path.exists():
        db_path.unlink()

    env = os.environ.copy()
    env.update(
        {
            "DATABASE_URL": "sqlite+aiosqlite:///test_migration_smoke.db",
            "REDIS_URL": "redis://localhost:6379/15",
            "APP_PASSWORD": "test-pw-for-ci",
            "ADMIN_PASSWORD": "admin-pw-for-ci",
            "JWT_SECRET_KEY": "test-jwt-secret-key-for-ci",
        }
    )

    try:
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd=str(root),
            env=env,
        )
        assert result.returncode == 0, f"alembic upgrade head 실패: {result.stderr}\n{result.stdout}"
    finally:
        if db_path.exists():
            db_path.unlink()
