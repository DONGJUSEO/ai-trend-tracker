from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import get_settings
from app.database import init_db
from app.api.v1 import huggingface, collect, scheduler, youtube, papers, news, github, system, conferences, tools
from app.services.scheduler import start_scheduler, stop_scheduler
from app.auth import verify_api_key

settings = get_settings()


# 보안 헤더 미들웨어
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # 보안 헤더 추가
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작/종료 시 실행되는 이벤트"""
    # 시작 시: 데이터베이스 초기화 및 스케줄러 시작
    await init_db()
    print("✅ 데이터베이스 초기화 완료")

    start_scheduler()
    print("✅ 스케줄러 시작 완료")

    yield

    # 종료 시: 스케줄러 정리
    stop_scheduler()
    print("👋 애플리케이션 종료")


# FastAPI 앱 생성
app = FastAPI(
    title=settings.app_name,
    description="AI 트렌드를 한눈에 보는 큐레이션 서비스",
    version=settings.app_version,
    lifespan=lifespan,
)

# 보안 미들웨어 추가
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)  # 압축

# CORS 설정 (프로덕션 환경 고려)
allowed_origins = [
    "http://localhost:5173",  # 개발 환경
    "http://localhost:3000",
    "https://*.vercel.app",  # Vercel 배포
    "https://*.railway.app",  # Railway 배포
]

# DEBUG 모드가 아닐 때는 특정 origin만 허용
if not settings.debug:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
else:
    # 개발 환경에서는 모든 origin 허용
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# 루트 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": f"{settings.app_name} API 서버가 실행 중입니다! 🚀",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "service": settings.app_name}


# API 라우터 등록 (인증 필요)
app.include_router(
    huggingface.router,
    prefix="/api/v1/huggingface",
    tags=["Hugging Face"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    collect.router,
    prefix="/api/v1/collect",
    tags=["Data Collection"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    scheduler.router,
    prefix="/api/v1/scheduler",
    tags=["Scheduler"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    youtube.router,
    prefix="/api/v1/youtube",
    tags=["YouTube"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    papers.router,
    prefix="/api/v1/papers",
    tags=["AI Papers"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    news.router,
    prefix="/api/v1/news",
    tags=["AI News"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    github.router,
    prefix="/api/v1/github",
    tags=["GitHub"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    system.router,
    prefix="/api/v1/system",
    tags=["System"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    conferences.router,
    prefix="/api/v1/conferences",
    tags=["AI Conferences"],
    dependencies=[Depends(verify_api_key)],
)

app.include_router(
    tools.router,
    prefix="/api/v1/tools",
    tags=["AI Tools"],
    dependencies=[Depends(verify_api_key)],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
