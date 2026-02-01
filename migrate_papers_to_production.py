"""Papers 데이터를 로컬에서 프로덕션으로 마이그레이션"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.paper import AIPaper
import os

# Railway PostgreSQL URL
PROD_DB_URL = os.getenv("RAILWAY_DATABASE_URL", "")
LOCAL_DB_URL = "sqlite+aiosqlite:////Users/seodongju/Documents/projects/fastapi-starter/ai_trends.db"

async def migrate_papers():
    if not PROD_DB_URL:
        print("❌ RAILWAY_DATABASE_URL 환경 변수를 설정하세요")
        return
    
    print("🔗 로컬 데이터베이스 연결 중...")
    local_engine = create_async_engine(LOCAL_DB_URL)
    local_session = sessionmaker(local_engine, class_=AsyncSession, expire_on_commit=False)
    
    print("🔗 프로덕션 데이터베이스 연결 중...")
    prod_url = PROD_DB_URL.replace("postgresql://", "postgresql+asyncpg://")
    prod_engine = create_async_engine(prod_url)
    prod_session = sessionmaker(prod_engine, class_=AsyncSession, expire_on_commit=False)
    
    async with local_session() as local_db:
        async with prod_session() as prod_db:
            print("\n📄 로컬 Papers 데이터 조회 중...")
            result = await local_db.execute(select(AIPaper))
            local_papers = result.scalars().all()
            
            print(f"✅ 로컬에서 {len(local_papers)}개 논문 찾음\n")
            
            if not local_papers:
                print("⚠️  로컬에 논문이 없습니다")
                return
            
            migrated = 0
            skipped = 0
            
            for paper in local_papers:
                result = await prod_db.execute(
                    select(AIPaper).where(AIPaper.arxiv_id == paper.arxiv_id)
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    print(f"  ⏭️  건너뜀: {paper.title[:50]}...")
                    skipped += 1
                else:
                    new_paper = AIPaper(
                        arxiv_id=paper.arxiv_id,
                        title=paper.title,
                        authors=paper.authors,
                        abstract=paper.abstract,
                        categories=paper.categories,
                        published_date=paper.published_date,
                        updated_date=paper.updated_date,
                        pdf_url=paper.pdf_url,
                        arxiv_url=paper.arxiv_url,
                        comment=paper.comment,
                        journal_ref=paper.journal_ref,
                        summary=paper.summary,
                        keywords=paper.keywords,
                        key_contributions=paper.key_contributions,
                        is_featured=paper.is_featured,
                        is_trending=paper.is_trending,
                    )
                    prod_db.add(new_paper)
                    print(f"  ✅ 추가: {paper.title[:50]}...")
                    migrated += 1
            
            await prod_db.commit()
            
            print(f"\n{'='*60}")
            print(f"🎉 마이그레이션 완료!")
            print(f"  - 추가: {migrated}개")
            print(f"  - 건너뜀: {skipped}개")
            print(f"  - Railway 프로덕션에 총 {migrated}개 논문 저장됨")
            print(f"{'='*60}")
    
    await local_engine.dispose()
    await prod_engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_papers())
