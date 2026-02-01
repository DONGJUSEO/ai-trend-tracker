from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FastAPI Starter",
    description="FastAPI 기본 템플릿 프로젝트",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    루트 엔드포인트
    """
    return {
        "message": "FastAPI 서버가 정상적으로 실행 중입니다!",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """
    헬스 체크 엔드포인트
    """
    return {"status": "healthy"}


@app.get("/api/hello/{name}")
async def say_hello(name: str):
    """
    개인화된 인사 메시지
    """
    return {"message": f"안녕하세요, {name}님!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
