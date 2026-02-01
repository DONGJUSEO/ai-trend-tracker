"""스케줄러 서비스 - 정기적 데이터 수집"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import asyncio

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.services.huggingface_service import HuggingFaceService
from app.services.youtube_service import YouTubeService
from app.services.arxiv_service import ArxivService
from app.services.news_service import NewsService
from app.services.github_service import GitHubService
from app.services.ai_summary_service import AISummaryService
from app.models.huggingface import HuggingFaceModel
from app.models.youtube import YouTubeVideo
from app.models.paper import AIPaper
from app.models.news import AINews
from app.models.github import GitHubProject
from sqlalchemy import select, desc

settings = get_settings()

# 스케줄러 인스턴스
scheduler = AsyncIOScheduler()


async def collect_huggingface_data():
    """Hugging Face 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"🤖 자동 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. 트렌딩 모델 수집
            hf_service = HuggingFaceService()
            result = await hf_service.collect_trending_models(db, limit=20)

            if result["success"]:
                print(f"✅ Hugging Face: {result['count']}개 신규 모델 저장")
            else:
                print("⚠️  Hugging Face 수집 실패")

            # 2. AI 요약 생성 (요약이 없는 모델들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(HuggingFaceModel).where(
                    HuggingFaceModel.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                models_without_summary = result.scalars().all()

                if models_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(models_without_summary)}개 모델)...")

                    for model in models_without_summary:
                        try:
                            summary_data = await ai_service.summarize_huggingface_model(
                                model_name=model.model_name,
                                description=model.description,
                                task=model.task,
                                tags=model.tags or [],
                            )

                            if summary_data["summary"]:
                                model.summary = summary_data["summary"]
                                model.key_features = summary_data["key_features"]
                                model.use_cases = summary_data["use_cases"]
                                print(f"  ✅ {model.model_name[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {model.model_name[:40]} - 요약 실패")

                            # API 호출 제한 회피 (무료 티어)
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {model.model_name[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ 자동 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_youtube_data():
    """YouTube 데이터 수집 작업 (큐레이션 채널 + 키워드 검색)"""
    print(f"\n{'='*60}")
    print(f"📺 YouTube 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            from app.models.youtube_channel import YouTubeChannel

            yt_service = YouTubeService()
            total_saved = 0

            # 1. 큐레이션된 채널의 최신 영상 수집 (우선순위 높은 순)
            print("📌 큐레이션된 AI 유튜버 채널에서 최신 영상 수집 중...")
            result = await db.execute(
                select(YouTubeChannel)
                .where(YouTubeChannel.is_active == True)
                .order_by(desc(YouTubeChannel.priority))
                .limit(30)  # 최대 30개 채널
            )
            channels = result.scalars().all()

            channel_videos_count = 0
            for channel in channels:
                try:
                    videos = await yt_service.get_channel_videos(
                        channel_id=channel.channel_id,
                        max_results=3,  # 채널당 최신 3개
                        order="date",
                    )

                    if videos:
                        saved = await yt_service.save_videos_to_db(videos, db)
                        channel_videos_count += saved
                        if saved > 0:
                            print(
                                f"  ✅ {channel.channel_name}: {saved}개 신규 영상"
                            )

                        # 마지막 수집 시간 업데이트
                        channel.last_collected_at = datetime.now()
                        await db.commit()

                    await asyncio.sleep(0.5)  # API 호출 제한 회피

                except Exception as e:
                    print(f"  ❌ {channel.channel_name}: {e}")
                    continue

            print(
                f"✅ 큐레이션 채널: {channel_videos_count}개 신규 영상 저장\n"
            )

            # 2. 키워드 검색으로 추가 AI 트렌드 영상 수집
            print("📌 키워드 검색으로 추가 AI 트렌드 영상 수집 중...")
            queries = [
                "AI artificial intelligence tutorial 2026",
                "machine learning explained",
                "deep learning tutorial",
                "ChatGPT GPT-4",
                "stable diffusion AI art",
            ]

            keyword_videos_count = 0
            for query in queries:
                videos = await yt_service.search_ai_videos(
                    query=query, max_results=5, order="viewCount"
                )

                if videos:
                    saved = await yt_service.save_videos_to_db(videos, db)
                    keyword_videos_count += saved
                    if saved > 0:
                        print(f"  ✅ '{query}': {saved}개 신규 비디오")

                await asyncio.sleep(1)  # API 호출 제한 회피

            print(f"✅ 키워드 검색: {keyword_videos_count}개 신규 영상 저장")

            total_saved = channel_videos_count + keyword_videos_count
            print(f"\n✅ YouTube 전체: 총 {total_saved}개 신규 비디오 저장")

            # 2. AI 요약 생성 (요약이 없는 비디오들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(YouTubeVideo).where(
                    YouTubeVideo.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                videos_without_summary = result.scalars().all()

                if videos_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(videos_without_summary)}개 비디오)...")

                    for video in videos_without_summary:
                        try:
                            summary_data = await ai_service.summarize_youtube_video(
                                title=video.title,
                                description=video.description,
                                tags=video.tags or [],
                            )

                            if summary_data["summary"]:
                                video.summary = summary_data["summary"]
                                video.keywords = summary_data["keywords"]
                                video.key_points = summary_data["key_points"]
                                print(f"  ✅ {video.title[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {video.title[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {video.title[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ YouTube 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ YouTube 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_papers_data():
    """AI Papers 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"📄 AI Papers 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. arXiv에서 최근 논문 검색
            arxiv_service = ArxivService()

            # 최근 7일간의 AI 논문 수집
            papers = await arxiv_service.search_recent_papers(
                days=7, max_results=20
            )

            if papers:
                saved = await arxiv_service.save_papers_to_db(papers, db)
                print(f"✅ arXiv: {saved}개 신규 논문 저장")
            else:
                print("⚠️  arXiv에서 논문을 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 논문들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AIPaper).where(
                    AIPaper.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                papers_without_summary = result.scalars().all()

                if papers_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(papers_without_summary)}개 논문)...")

                    for paper in papers_without_summary:
                        try:
                            summary_data = await ai_service.summarize_paper(
                                title=paper.title,
                                abstract=paper.abstract,
                                authors=paper.authors or [],
                                categories=paper.categories or [],
                            )

                            if summary_data["summary"]:
                                paper.summary = summary_data["summary"]
                                paper.keywords = summary_data["keywords"]
                                paper.key_contributions = summary_data["key_contributions"]
                                print(f"  ✅ {paper.title[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {paper.title[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {paper.title[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Papers 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Papers 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_news_data():
    """AI News 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"📰 AI News 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. RSS 피드에서 뉴스 수집
            news_service = NewsService()

            articles = await news_service.fetch_all_feeds()

            if articles:
                saved = await news_service.save_news_to_db(articles, db)
                print(f"\n✅ AI News: 총 {saved}개 신규 뉴스 저장")
            else:
                print("⚠️  RSS 피드에서 뉴스를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 뉴스들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AINews).where(
                    AINews.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                news_without_summary = result.scalars().all()

                if news_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(news_without_summary)}개 뉴스)...")

                    for news_item in news_without_summary:
                        try:
                            summary_data = await ai_service.summarize_news(
                                title=news_item.title,
                                content=news_item.content or news_item.excerpt,
                                source=news_item.source,
                            )

                            if summary_data["summary"]:
                                news_item.summary = summary_data["summary"]
                                news_item.keywords = summary_data["keywords"]
                                news_item.key_points = summary_data["key_points"]
                                print(f"  ✅ {news_item.title[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {news_item.title[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {news_item.title[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ News 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ News 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_github_data():
    """GitHub 트렌딩 프로젝트 수집 작업"""
    print(f"\n{'='*60}")
    print(f"⭐ GitHub 트렌딩 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. GitHub에서 트렌딩 AI/ML 프로젝트 검색
            github_service = GitHubService()

            projects = await github_service.fetch_trending_repos(
                language="", max_results=30
            )

            if projects:
                saved = await github_service.save_projects_to_db(projects, db)
                print(f"✅ GitHub: {saved}개 신규 프로젝트 저장")
            else:
                print("⚠️  GitHub에서 프로젝트를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 프로젝트들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(GitHubProject).where(
                    GitHubProject.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                projects_without_summary = result.scalars().all()

                if projects_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(projects_without_summary)}개 프로젝트)...")

                    for project in projects_without_summary:
                        try:
                            summary_data = await ai_service.summarize_github_project(
                                repo_name=project.repo_name,
                                description=project.description,
                                language=project.language,
                                topics=project.topics or [],
                            )

                            if summary_data["summary"]:
                                project.summary = summary_data["summary"]
                                project.keywords = summary_data["keywords"]
                                project.use_cases = summary_data["use_cases"]
                                print(f"  ✅ {project.repo_name[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {project.repo_name[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {project.repo_name[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ GitHub 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ GitHub 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_all_data():
    """모든 데이터 수집 작업"""
    print(f"\n{'='*80}")
    print(f"🚀 전체 데이터 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")

    await collect_huggingface_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_youtube_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_papers_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_news_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_github_data()

    print(f"\n{'='*80}")
    print(f"🎉 전체 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")


def start_scheduler():
    """스케줄러 시작"""
    # 수집 작업 스케줄 등록
    interval_hours = settings.scheduler_interval_hours

    # 통합 수집 작업 (Hugging Face + YouTube + Papers)
    scheduler.add_job(
        collect_all_data,
        trigger=IntervalTrigger(hours=interval_hours),
        id="collect_all_data",
        name="전체 AI 트렌드 데이터 수집",
        replace_existing=True,
    )

    print(f"⏰ 스케줄러 시작: {interval_hours}시간마다 전체 데이터 수집 (HuggingFace + YouTube + Papers + News + GitHub)")
    scheduler.start()


def stop_scheduler():
    """스케줄러 중지"""
    scheduler.shutdown()
    print("⏰ 스케줄러 종료")


async def run_collection_now():
    """즉시 수집 실행 (테스트용)"""
    await collect_all_data()
