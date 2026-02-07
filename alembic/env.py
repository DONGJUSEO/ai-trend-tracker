import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.config import get_settings

# Import Base and ALL models so that Base.metadata contains every table.
from app.database import Base
from app.models.huggingface import HuggingFaceModel  # noqa: F401
from app.models.youtube import YouTubeVideo  # noqa: F401
from app.models.youtube_channel import YouTubeChannel  # noqa: F401
from app.models.paper import AIPaper  # noqa: F401
from app.models.news import AINews  # noqa: F401
from app.models.github import GitHubProject  # noqa: F401
from app.models.conference import AIConference  # noqa: F401
from app.models.ai_tool import AITool  # noqa: F401
from app.models.job_trend import AIJobTrend  # noqa: F401
from app.models.policy import AIPolicy  # noqa: F401

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the sqlalchemy.url from application settings dynamically.
# The database_url from settings uses "postgresql://" which we convert
# to "postgresql+asyncpg://" for the async driver.
settings = get_settings()
database_url = settings.database_url.replace(
    "postgresql://", "postgresql+asyncpg://"
)
config.set_main_option("sqlalchemy.url", database_url)

# Use Base.metadata as the target for autogenerate support.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
