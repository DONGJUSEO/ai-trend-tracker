"""DB schema compatibility helpers for gradual rollouts."""
from __future__ import annotations

from typing import Dict, Iterable, Tuple

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Process-local memoization. Safe because schema changes are migration-driven.
_COLUMN_CACHE: Dict[Tuple[str, str], bool] = {}


async def has_column(db: AsyncSession, table_name: str, column_name: str) -> bool:
    """Return whether `table_name.column_name` exists in current schema."""
    cache_key = (table_name, column_name)
    if cache_key in _COLUMN_CACHE:
        return _COLUMN_CACHE[cache_key]

    result = await db.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = :table_name
              AND column_name = :column_name
            LIMIT 1
            """
        ),
        {"table_name": table_name, "column_name": column_name},
    )
    exists = result.first() is not None
    _COLUMN_CACHE[cache_key] = exists
    return exists


async def has_columns(
    db: AsyncSession,
    table_name: str,
    column_names: Iterable[str],
) -> Dict[str, bool]:
    """Bulk helper returning `{column_name: exists}` for the given table."""
    result: Dict[str, bool] = {}
    for column_name in column_names:
        result[column_name] = await has_column(db, table_name, column_name)
    return result


async def has_archive_column(db: AsyncSession, table_name: str) -> bool:
    """Return whether `is_archived` exists for soft-archive filtering."""
    return await has_column(db, table_name, "is_archived")


def clear_schema_cache() -> None:
    """Clear cached schema checks (mainly for tests)."""
    _COLUMN_CACHE.clear()
