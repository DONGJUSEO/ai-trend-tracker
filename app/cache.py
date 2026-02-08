"""Redis 캐싱 유틸리티

Phase 2: Redis 기반 캐시 레이어
- 시스템 상태, 키워드, 리스트 쿼리에 대한 캐싱 지원
- async redis 클라이언트 사용
"""
import json
import logging
from typing import Any, Awaitable, Callable, Optional, TypeVar

import redis.asyncio as aioredis

from app.config import get_settings

logger = logging.getLogger(__name__)
T = TypeVar("T")

settings = get_settings()

# ── Default TTL 설정 (초) ──────────────────────────────────────
TTL_SYSTEM_STATUS = 60      # 시스템 상태: 1분
TTL_KEYWORDS = 300          # 키워드: 5분
TTL_LIST_QUERY = 120        # 리스트 쿼리: 2분

# ── Redis 클라이언트 싱글톤 ────────────────────────────────────
_redis_client: Optional[aioredis.Redis] = None


async def _reset_redis_client() -> None:
    """현재 Redis 클라이언트를 안전하게 종료하고 초기화."""
    global _redis_client
    if _redis_client is None:
        return
    try:
        await _redis_client.close()
    except Exception:
        pass
    finally:
        _redis_client = None


async def get_redis(force_reconnect: bool = False) -> aioredis.Redis:
    """Redis 클라이언트 싱글톤 반환.

    최초 호출 시 연결을 생성하고 이후 재사용합니다.
    """
    global _redis_client
    if force_reconnect:
        await _reset_redis_client()

    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    try:
        # stale connection 방지: 매 요청 전 ping 검증
        await _redis_client.ping()
        return _redis_client
    except Exception as e:
        logger.warning("Redis 연결 점검 실패, 재연결 시도: %s", e)
        await _reset_redis_client()
        _redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
        await _redis_client.ping()
        logger.info("Redis 재연결 성공: %s", settings.redis_url)
    return _redis_client


async def close_redis() -> None:
    """Redis 연결 종료."""
    await _reset_redis_client()
    logger.info("Redis 연결 종료")


async def _redis_call(
    action: str,
    fn: Callable[[aioredis.Redis], Awaitable[T]],
    fallback: T,
) -> T:
    """Redis 작업 공통 래퍼 (실패 시 1회 재연결 재시도)."""
    last_error: Optional[Exception] = None
    for attempt in range(2):
        try:
            client = await get_redis(force_reconnect=attempt == 1)
            return await fn(client)
        except Exception as e:
            last_error = e
            if attempt == 0:
                logger.warning("%s 실패, 재연결 후 재시도: %s", action, e)
            else:
                logger.warning("%s 재시도 실패: %s", action, e)
    if last_error:
        logger.debug("%s 최종 실패 원인: %s", action, last_error)
    return fallback


# ── 캐시 헬퍼 함수 ─────────────────────────────────────────────

async def cache_get(key: str) -> Optional[Any]:
    """캐시에서 값 조회.

    Args:
        key: 캐시 키

    Returns:
        캐시된 값 (JSON 디코딩됨) 또는 None
    """
    async def _op(client: aioredis.Redis) -> Optional[Any]:
        value = await client.get(key)
        if value is not None:
            logger.debug("Cache HIT: %s", key)
            return json.loads(value)
        logger.debug("Cache MISS: %s", key)
        return None

    return await _redis_call(f"cache_get(key={key})", _op, None)


async def cache_set(key: str, value: Any, ttl: int = TTL_LIST_QUERY) -> bool:
    """캐시에 값 저장.

    Args:
        key: 캐시 키
        value: 저장할 값 (JSON 직렬화 가능해야 함)
        ttl: TTL (초 단위, 기본값: 120초)

    Returns:
        저장 성공 여부
    """
    async def _op(client: aioredis.Redis) -> bool:
        serialized = json.dumps(value, default=str, ensure_ascii=False)
        await client.set(key, serialized, ex=ttl)
        logger.debug("Cache SET: %s (ttl=%ds)", key, ttl)
        return True

    return await _redis_call(f"cache_set(key={key})", _op, False)


async def cache_delete(key: str) -> bool:
    """캐시에서 특정 키 삭제.

    Args:
        key: 삭제할 캐시 키

    Returns:
        삭제 성공 여부
    """
    async def _op(client: aioredis.Redis) -> bool:
        await client.delete(key)
        logger.debug("Cache DELETE: %s", key)
        return True

    return await _redis_call(f"cache_delete(key={key})", _op, False)


async def track_visitor(visitor_id: str) -> None:
    """HyperLogLog로 고유 방문자 기록 (일별/월별).

    12KB 메모리로 수백만 고유 방문자를 0.81% 오차로 카운트.
    """
    from datetime import date

    async def _op(client: aioredis.Redis) -> None:
        today = date.today().isoformat()
        month = today[:7]  # YYYY-MM
        await client.pfadd(f"visitors:daily:{today}", visitor_id)
        await client.pfadd(f"visitors:monthly:{month}", visitor_id)
        await client.pfadd("visitors:total", visitor_id)
        return None

    await _redis_call("track_visitor", _op, None)


async def get_visitor_counts() -> dict:
    """HyperLogLog 기반 방문자 수 조회."""
    from datetime import date, timedelta

    async def _op(client: aioredis.Redis) -> dict:
        today = date.today()
        yesterday = (today - timedelta(days=1)).isoformat()
        today_str = today.isoformat()
        month = today_str[:7]

        today_count = await client.pfcount(f"visitors:daily:{today_str}")
        yesterday_count = await client.pfcount(f"visitors:daily:{yesterday}")
        monthly_count = await client.pfcount(f"visitors:monthly:{month}")
        total_count = await client.pfcount("visitors:total")

        return {
            "today": today_count,
            "yesterday": yesterday_count,
            "monthly": monthly_count,
            "total": total_count,
        }

    return await _redis_call(
        "get_visitor_counts",
        _op,
        {"today": 0, "yesterday": 0, "monthly": 0, "total": 0},
    )


async def cache_delete_pattern(pattern: str) -> int:
    """패턴에 매칭되는 모든 캐시 키 삭제.

    Args:
        pattern: 글로브 패턴 (예: "dashboard:*", "keywords:*")

    Returns:
        삭제된 키 개수
    """
    async def _op(client: aioredis.Redis) -> int:
        deleted_count = 0
        async for key in client.scan_iter(match=pattern, count=100):
            await client.delete(key)
            deleted_count += 1
        logger.debug("Cache DELETE PATTERN: %s (%d keys)", pattern, deleted_count)
        return deleted_count

    return await _redis_call(f"cache_delete_pattern(pattern={pattern})", _op, 0)
