"""Redis 캐싱 유틸리티

Phase 2: Redis 기반 캐시 레이어
- 시스템 상태, 키워드, 리스트 쿼리에 대한 캐싱 지원
- async redis 클라이언트 사용
"""
import json
import logging
from typing import Any, Optional

import redis.asyncio as aioredis

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# ── Default TTL 설정 (초) ──────────────────────────────────────
TTL_SYSTEM_STATUS = 60      # 시스템 상태: 1분
TTL_KEYWORDS = 300          # 키워드: 5분
TTL_LIST_QUERY = 120        # 리스트 쿼리: 2분

# ── Redis 클라이언트 싱글톤 ────────────────────────────────────
_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Redis 클라이언트 싱글톤 반환.

    최초 호출 시 연결을 생성하고 이후 재사용합니다.
    """
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
            )
            # 연결 확인
            await _redis_client.ping()
            logger.info("Redis 연결 성공: %s", settings.redis_url)
        except Exception as e:
            logger.warning("Redis 연결 실패 (캐시 비활성화): %s", e)
            _redis_client = None
            raise
    return _redis_client


async def close_redis() -> None:
    """Redis 연결 종료."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis 연결 종료")


# ── 캐시 헬퍼 함수 ─────────────────────────────────────────────

async def cache_get(key: str) -> Optional[Any]:
    """캐시에서 값 조회.

    Args:
        key: 캐시 키

    Returns:
        캐시된 값 (JSON 디코딩됨) 또는 None
    """
    try:
        client = await get_redis()
        value = await client.get(key)
        if value is not None:
            logger.debug("Cache HIT: %s", key)
            return json.loads(value)
        logger.debug("Cache MISS: %s", key)
        return None
    except Exception as e:
        logger.warning("cache_get 실패 (key=%s): %s", key, e)
        return None


async def cache_set(key: str, value: Any, ttl: int = TTL_LIST_QUERY) -> bool:
    """캐시에 값 저장.

    Args:
        key: 캐시 키
        value: 저장할 값 (JSON 직렬화 가능해야 함)
        ttl: TTL (초 단위, 기본값: 120초)

    Returns:
        저장 성공 여부
    """
    try:
        client = await get_redis()
        serialized = json.dumps(value, default=str, ensure_ascii=False)
        await client.set(key, serialized, ex=ttl)
        logger.debug("Cache SET: %s (ttl=%ds)", key, ttl)
        return True
    except Exception as e:
        logger.warning("cache_set 실패 (key=%s): %s", key, e)
        return False


async def cache_delete(key: str) -> bool:
    """캐시에서 특정 키 삭제.

    Args:
        key: 삭제할 캐시 키

    Returns:
        삭제 성공 여부
    """
    try:
        client = await get_redis()
        await client.delete(key)
        logger.debug("Cache DELETE: %s", key)
        return True
    except Exception as e:
        logger.warning("cache_delete 실패 (key=%s): %s", key, e)
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """패턴에 매칭되는 모든 캐시 키 삭제.

    Args:
        pattern: 글로브 패턴 (예: "dashboard:*", "keywords:*")

    Returns:
        삭제된 키 개수
    """
    deleted_count = 0
    try:
        client = await get_redis()
        async for key in client.scan_iter(match=pattern, count=100):
            await client.delete(key)
            deleted_count += 1
        logger.debug("Cache DELETE PATTERN: %s (%d keys)", pattern, deleted_count)
    except Exception as e:
        logger.warning("cache_delete_pattern 실패 (pattern=%s): %s", pattern, e)
    return deleted_count
