"""운영 알림 서비스 (Slack/Discord 웹훅)."""
from __future__ import annotations

from typing import Optional
import logging

import httpx

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def _log_print(*args, **kwargs):
    sep = kwargs.get("sep", " ")
    message = sep.join(str(arg) for arg in args)
    logger.info(message)


print = _log_print  # type: ignore[assignment]


def _safe_truncate(text: Optional[str], max_len: int = 1800) -> str:
    if not text:
        return ""
    return text if len(text) <= max_len else f"{text[:max_len]}..."


async def send_error_webhook(
    *,
    title: str,
    job_id: str,
    message: str,
) -> None:
    """Slack/Discord 웹훅으로 에러 알림 전송."""
    payload_text = _safe_truncate(
        f"[AI봄 Scheduler Alert]\nTitle: {title}\nJob: {job_id}\nError: {message}"
    )
    if not payload_text:
        return

    async with httpx.AsyncClient(timeout=8.0) as client:
        if settings.error_webhook_slack:
            try:
                await client.post(
                    settings.error_webhook_slack,
                    json={"text": payload_text},
                )
            except Exception as e:
                print(f"⚠️ Slack webhook send failed: {e}")

        if settings.error_webhook_discord:
            try:
                await client.post(
                    settings.error_webhook_discord,
                    json={"content": payload_text},
                )
            except Exception as e:
                print(f"⚠️ Discord webhook send failed: {e}")
