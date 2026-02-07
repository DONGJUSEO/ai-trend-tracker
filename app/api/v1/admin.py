"""관리자 인증 API

- POST /login: 비밀번호로 JWT 토큰 발급
- GET /verify: 토큰 유효성 확인
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import hashlib
import hmac
import json
import base64

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str
    expires_at: str


def _create_token(expires_hours: int = 24) -> str:
    """간단한 HMAC 기반 토큰 생성"""
    payload = {
        "role": "admin",
        "iat": datetime.utcnow().isoformat(),
        "exp": (datetime.utcnow() + timedelta(hours=expires_hours)).isoformat(),
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
        if datetime.utcnow() > exp:
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


@router.post("/login", response_model=LoginResponse)
async def admin_login(req: LoginRequest):
    """관리자 로그인 - 비밀번호 검증 후 토큰 발급"""
    if req.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다")

    token = _create_token(expires_hours=24)
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()

    return LoginResponse(token=token, expires_at=expires_at)


@router.get("/verify")
async def verify_session(authorization: str = Header(None)):
    """현재 토큰의 유효성 확인"""
    if not authorization:
        return {"valid": False}
    token = authorization.replace("Bearer ", "")
    return {"valid": _verify_token(token)}
