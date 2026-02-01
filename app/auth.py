"""인증 및 보안"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from app.config import get_settings

settings = get_settings()
security = HTTPBasic()


def verify_password(credentials: HTTPBasicCredentials = Depends(security)):
    """
    비밀번호 검증

    사용법:
    - Username: 아무거나
    - Password: test1234
    """
    correct_password = getattr(settings, "app_password", "test1234")

    if credentials.password != correct_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="비밀번호가 올바르지 않습니다",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username


# 선택적: API 키 기반 인증 (나중에 웹/앱에서 사용)
from fastapi import Header


def verify_api_key(x_api_key: str = Header(None)):
    """
    API 키 검증

    Header에 X-API-Key: test1234 를 포함하면 접근 가능
    """
    correct_key = getattr(settings, "app_password", "test1234")

    if x_api_key != correct_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API 키가 올바르지 않습니다",
        )

    return True
