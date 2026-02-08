"""관리자 인증 API

- POST /login: 비밀번호로 JWT 토큰 발급
- GET /verify: 토큰 유효성 확인
"""
from datetime import datetime, timedelta, timezone
import logging
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks, Depends, Query
from pydantic import BaseModel
import hashlib
import hmac
import json
import base64

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.services.backfill_service import backfill_missing_summaries, backfill_v4_metadata

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str
    expires_at: str


class TriggerTaskResponse(BaseModel):
    status: str
    message: str


def _create_token(expires_hours: int = 24) -> str:
    """간단한 HMAC 기반 토큰 생성"""
    payload = {
        "role": "admin",
        "iat": datetime.now(timezone.utc).isoformat(),
        "exp": (datetime.now(timezone.utc) + timedelta(hours=expires_hours)).isoformat(),
    }
    payload_bytes = json.dumps(payload, sort_keys=True).encode()
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode()
    signature = hmac.new(
        settings.jwt_secret_key.encode(), payload_bytes, hashlib.sha256
    ).hexdigest()
    return f"{payload_b64}.{signature}"


def _verify_token(token: str) -> bool:
    """토큰 검증"""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return False
        payload_b64, signature = parts
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        expected_sig = hmac.new(
            settings.jwt_secret_key.encode(), payload_bytes, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return False
        payload = json.loads(payload_bytes)
        exp = datetime.fromisoformat(payload["exp"])
        if datetime.now(timezone.utc) > exp:
            return False
        return True
    except Exception:
        return False


def verify_admin_token(authorization: str = Header(None)):
    """관리자 토큰 검증 의존성"""
    if not authorization:
        raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다")
    token = authorization.replace("Bearer ", "")
    if not _verify_token(token):
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")
    return True


async def _run_summary_backfill(limit_per_category: int) -> None:
    async with AsyncSessionLocal() as db:
        result = await backfill_missing_summaries(
            db,
            limit_per_category=limit_per_category,
        )
    logger.info("summary backfill finished: %s", result)


async def _run_v4_backfill(limit: int, include_summary: bool, summary_limit: int) -> None:
    async with AsyncSessionLocal() as db:
        metadata_result = await backfill_v4_metadata(db, limit=limit)
        logger.info("v4 metadata backfill finished: %s", metadata_result)
        if include_summary:
            summary_result = await backfill_missing_summaries(
                db,
                limit_per_category=summary_limit,
            )
            logger.info("v4 summary backfill finished: %s", summary_result)


@router.post("/site-login")
async def site_login(req: LoginRequest):
    """사이트 접근 비밀번호 검증 (일반 사용자용)"""
    if req.password != settings.app_password:
        raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다")
    return {"success": True}


@router.post("/login", response_model=LoginResponse)
async def admin_login(req: LoginRequest):
    """관리자 로그인 - 비밀번호 검증 후 토큰 발급"""
    if req.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다")

    token = _create_token(expires_hours=24)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()

    return LoginResponse(token=token, expires_at=expires_at)


@router.get("/verify")
async def verify_session(authorization: str = Header(None)):
    """현재 토큰의 유효성 확인"""
    if not authorization:
        return {"valid": False}
    token = authorization.replace("Bearer ", "")
    return {"valid": _verify_token(token)}


@router.post("/trigger-summary", response_model=TriggerTaskResponse)
async def trigger_summary_backfill(
    background_tasks: BackgroundTasks,
    limit_per_category: int = Query(10, ge=1, le=200),
    _: bool = Depends(verify_admin_token),
):
    """요약 누락 데이터를 백그라운드에서 재생성."""
    background_tasks.add_task(_run_summary_backfill, limit_per_category)
    return TriggerTaskResponse(
        status="started",
        message=f"summary backfill started (limit_per_category={limit_per_category})",
    )


@router.post("/backfill-v4", response_model=TriggerTaskResponse)
async def trigger_v4_backfill(
    background_tasks: BackgroundTasks,
    limit: int = Query(5000, ge=1, le=200000),
    include_summary: bool = Query(False),
    summary_limit: int = Query(10, ge=1, le=200),
    _: bool = Depends(verify_admin_token),
):
    """v4 분류/언어/task_ko 소급 반영 + 선택적 요약 백필."""
    background_tasks.add_task(_run_v4_backfill, limit, include_summary, summary_limit)
    return TriggerTaskResponse(
        status="started",
        message=(
            "v4 backfill started "
            f"(limit={limit}, include_summary={include_summary}, summary_limit={summary_limit})"
        ),
    )
