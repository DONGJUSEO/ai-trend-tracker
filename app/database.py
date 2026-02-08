from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import get_settings

settings = get_settings()


def _normalize_async_database_url(raw_url: str) -> str:
    """환경별 DB URL을 SQLAlchemy async URL로 정규화."""
    url = (raw_url or "").strip()
    if not url:
        raise ValueError("DATABASE_URL is empty")

    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)

    if url.startswith("sqlite+aiosqlite://"):
        return url
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)

    raise ValueError("Unsupported DATABASE_URL scheme. Use postgresql:// or sqlite://")


database_url = _normalize_async_database_url(settings.database_url)

# 비동기 엔진 생성
engine = create_async_engine(
    database_url,
    echo=settings.debug,
    future=True,
)

# 비동기 세션 팩토리
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base 클래스 (모든 모델이 상속)
Base = declarative_base()


async def get_db():
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """데이터베이스 초기화.

    테이블 생성은 Alembic 마이그레이션으로 관리됩니다.
    `alembic upgrade head` 명령어를 사용하세요.
    """
    # 모든 모델 import (Alembic이 감지할 수 있도록)
    from app.models import huggingface, youtube, youtube_channel, paper, news, github  # noqa
    from app.models import conference, ai_tool, job_trend, policy  # noqa
