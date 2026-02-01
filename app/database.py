from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import get_settings

settings = get_settings()

# PostgreSQL URL을 asyncpg용으로 변환
database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")

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
    """데이터베이스 초기화 (테이블 생성)"""
    # 모든 모델 import (테이블 생성을 위해 필요)
    from app.models import huggingface, youtube, youtube_channel, paper, news, github  # noqa

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
