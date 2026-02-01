"""스케줄러 제어 API"""
from fastapi import APIRouter
from app.services.scheduler import run_collection_now

router = APIRouter()


@router.post("/run-now")
async def trigger_collection():
    """
    즉시 데이터 수집 실행

    스케줄 대기 없이 지금 바로 데이터 수집을 시작합니다.
    """
    await run_collection_now()
    return {
        "success": True,
        "message": "데이터 수집이 완료되었습니다"
    }


@router.get("/status")
async def get_scheduler_status():
    """
    스케줄러 상태 조회
    """
    from app.services.scheduler import scheduler
    from app.config import get_settings

    settings = get_settings()

    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
        })

    return {
        "running": scheduler.running,
        "interval_hours": settings.scheduler_interval_hours,
        "jobs": jobs,
    }
