"""로컬 SQLite 데이터를 프로덕션 PostgreSQL로 마이그레이션하는 스크립트"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# 로컬 SQLite DB
LOCAL_DB_URL = "sqlite+aiosqlite:////Users/seodongju/Documents/projects/fastapi-starter/ai_trends.db"

# 프로덕션 PostgreSQL DB (Railway)
PROD_DB_URL = "postgresql+asyncpg://postgres:cuJkMkeBwTXvNriXDNpzEwgmflwBGxUN@shinkansen.proxy.rlwy.net:44850/railway"

# 모델 임포트
from app.models.huggingface import HuggingFaceModel
from app.models.youtube import YouTubeVideo
from app.models.github import GitHubProject
from app.models.paper import AIPaper
from app.models.news import AINews
from app.models.conference import AIConference
from app.models.ai_tool import AITool
from app.models.leaderboard import AILeaderboard
from app.models.job_trend import AIJobTrend
from app.models.policy import AIPolicy
from app.models.startup import AIStartup


async def migrate_table(local_session, prod_session, model_class, table_name):
    """특정 테이블의 데이터를 마이그레이션"""
    print(f"\n📦 {table_name} 마이그레이션 시작...")

    # 로컬에서 모든 데이터 읽기
    result = await local_session.execute(select(model_class))
    items = result.scalars().all()

    if not items:
        print(f"  ⚠️  {table_name}: 데이터 없음")
        return 0

    print(f"  📊 {table_name}: {len(items)}개 항목 발견")

    # 프로덕션 DB에 저장 (중복 건너뛰기)
    saved_count = 0
    skipped_count = 0

    for item in items:
        try:
            # 딕셔너리로 변환 (ID 제외)
            item_dict = {
                c.name: getattr(item, c.name)
                for c in item.__table__.columns
                if c.name != 'id'
            }

            # 새 객체 생성 및 저장
            new_item = model_class(**item_dict)
            prod_session.add(new_item)
            await prod_session.flush()  # 즉시 DB에 쓰기
            saved_count += 1

        except Exception as e:
            # 중복 키 에러는 무시하고 계속 진행
            if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
                skipped_count += 1
                await prod_session.rollback()
            else:
                # 다른 에러는 출력
                print(f"  ⚠️  에러 발생: {str(e)[:100]}")
                await prod_session.rollback()

    await prod_session.commit()
    print(f"  ✅ {table_name}: {saved_count}개 저장, {skipped_count}개 건너뜀")
    return saved_count


async def main():
    """메인 마이그레이션 함수"""
    print("="*80)
    print("🚀 로컬 SQLite → 프로덕션 PostgreSQL 데이터 마이그레이션")
    print("="*80)

    # 데이터베이스 엔진 생성
    local_engine = create_async_engine(LOCAL_DB_URL, echo=False)
    prod_engine = create_async_engine(PROD_DB_URL, echo=False)

    # 세션 생성
    LocalSession = sessionmaker(local_engine, class_=AsyncSession, expire_on_commit=False)
    ProdSession = sessionmaker(prod_engine, class_=AsyncSession, expire_on_commit=False)

    total_migrated = 0

    try:
        async with LocalSession() as local_session, ProdSession() as prod_session:
            # 각 테이블 마이그레이션
            tables = [
                (HuggingFaceModel, "Hugging Face 모델"),
                (YouTubeVideo, "YouTube 영상"),
                (GitHubProject, "GitHub 프로젝트"),
                (AIPaper, "AI 논문"),
                (AINews, "AI 뉴스"),
                (AIConference, "AI 컨퍼런스"),
                (AITool, "AI 도구"),
                (AILeaderboard, "AI 리더보드"),
                (AIJobTrend, "AI 채용"),
                (AIPolicy, "AI 정책"),
                (AIStartup, "AI 스타트업"),
            ]

            for model_class, table_name in tables:
                count = await migrate_table(local_session, prod_session, model_class, table_name)
                total_migrated += count

        print("\n" + "="*80)
        print(f"🎉 마이그레이션 완료! 총 {total_migrated}개 항목 이전")
        print("="*80)

    except Exception as e:
        print(f"\n❌ 마이그레이션 실패: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await local_engine.dispose()
        await prod_engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
