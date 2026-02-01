"""스케줄러 서비스 - 정기적 데이터 수집"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import asyncio
import logging

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.services.huggingface_service import HuggingFaceService
from app.services.youtube_service import YouTubeService
from app.services.arxiv_service import ArxivService
from app.services.news_service import NewsService
from app.services.github_service import GitHubService
from app.services.conference_service import ConferenceService
from app.services.ai_tool_service import AIToolService
from app.services.leaderboard_service import LeaderboardService
from app.services.job_trend_service import JobTrendService
from app.services.policy_service import PolicyService
from app.services.startup_service import StartupService
from app.services.ai_summary_service import AISummaryService
from app.models.huggingface import HuggingFaceModel
from app.models.youtube import YouTubeVideo
from app.models.paper import AIPaper
from app.models.news import AINews
from app.models.github import GitHubProject
from app.models.conference import AIConference
from app.models.ai_tool import AITool
from app.models.leaderboard import AILeaderboard
from app.models.job_trend import AIJobTrend
from app.models.policy import AIPolicy
from app.models.startup import AIStartup
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


async def collect_conference_data():
    """AI Conference 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"📅 AI Conference 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. WikiCFP에서 AI 컨퍼런스 수집
            conference_service = ConferenceService()

            conferences = await conference_service.fetch_wikicfp_conferences(max_results=50)

            if conferences:
                saved = await conference_service.save_to_db(conferences, db)
                print(f"✅ AI Conference: {saved}개 신규 컨퍼런스 저장")
            else:
                print("⚠️  WikiCFP에서 컨퍼런스를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 컨퍼런스들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AIConference).where(
                    AIConference.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                conferences_without_summary = result.scalars().all()

                if conferences_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(conferences_without_summary)}개 컨퍼런스)...")

                    for conference in conferences_without_summary:
                        try:
                            summary_data = await ai_service.summarize_conference(
                                name=conference.conference_name,
                                description=conference.description or "",
                                topics=conference.topics or [],
                            )

                            if summary_data.get("summary"):
                                conference.summary = summary_data["summary"]
                                conference.keywords = summary_data.get("keywords", [])
                                print(f"  ✅ {conference.conference_name[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {conference.conference_name[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {conference.conference_name[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Conference 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Conference 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_tool_data():
    """AI Tool 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"🛠️ AI Tool 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. 트렌딩 AI 도구 수집
            tool_service = AIToolService()

            tools = await tool_service.fetch_trending_tools(max_results=30)

            if tools:
                saved = await tool_service.save_to_db(tools, db)
                print(f"✅ AI Tool: {saved}개 신규 도구 저장")
            else:
                print("⚠️  AI 도구를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 도구들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AITool).where(
                    AITool.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                tools_without_summary = result.scalars().all()

                if tools_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(tools_without_summary)}개 도구)...")

                    for tool in tools_without_summary:
                        try:
                            summary_data = await ai_service.summarize_ai_tool(
                                name=tool.tool_name,
                                description=tool.description or "",
                                category=tool.category,
                                use_cases=tool.use_cases or [],
                            )

                            if summary_data.get("summary"):
                                tool.summary = summary_data["summary"]
                                tool.keywords = summary_data.get("keywords", [])
                                print(f"  ✅ {tool.tool_name[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {tool.tool_name[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {tool.tool_name[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Tool 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Tool 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_leaderboard_data():
    """AI Leaderboard 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"🏆 AI Leaderboard 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. AI 리더보드 데이터 수집
            leaderboard_service = LeaderboardService()

            leaderboards = await leaderboard_service.fetch_sample_leaderboards()

            if leaderboards:
                saved = await leaderboard_service.save_to_db(leaderboards, db)
                print(f"✅ AI Leaderboard: {saved}개 신규 항목 저장")
            else:
                print("⚠️  리더보드 데이터를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 리더보드 항목들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AILeaderboard).where(
                    AILeaderboard.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                leaderboards_without_summary = result.scalars().all()

                if leaderboards_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(leaderboards_without_summary)}개 항목)...")

                    for leaderboard in leaderboards_without_summary:
                        try:
                            summary_data = await ai_service.summarize_leaderboard(
                                model_name=leaderboard.model_name,
                                leaderboard_source=leaderboard.leaderboard_source,
                                scores=leaderboard.scores or {},
                                strengths=leaderboard.strengths or [],
                            )

                            if summary_data.get("summary"):
                                leaderboard.summary = summary_data["summary"]
                                leaderboard.keywords = summary_data.get("keywords", [])
                                print(f"  ✅ {leaderboard.model_name[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {leaderboard.model_name[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {leaderboard.model_name[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Leaderboard 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Leaderboard 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_job_data():
    """AI Job Trend 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"💼 AI Job Trend 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. RemoteOK에서 AI/ML 채용 공고 수집
            job_service = JobTrendService()

            jobs = await job_service.fetch_remoteok_jobs(max_results=30)

            if jobs:
                saved = await job_service.save_to_db(jobs, db)
                print(f"✅ AI Job Trend: {saved}개 신규 채용 공고 저장")
            else:
                print("⚠️  채용 공고를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 채용 공고들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AIJobTrend).where(
                    AIJobTrend.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                jobs_without_summary = result.scalars().all()

                if jobs_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(jobs_without_summary)}개 채용 공고)...")

                    for job in jobs_without_summary:
                        try:
                            summary_data = await ai_service.summarize_job(
                                title=job.job_title,
                                company=job.company_name,
                                description=job.description or "",
                                skills=job.required_skills or [],
                            )

                            if summary_data.get("summary"):
                                job.summary = summary_data["summary"]
                                job.keywords = summary_data.get("keywords", [])
                                print(f"  ✅ {job.job_title[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {job.job_title[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {job.job_title[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Job 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Job 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_policy_data():
    """AI Policy 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"⚖️ AI Policy 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. RSS 피드에서 AI 정책 뉴스 수집
            policy_service = PolicyService()

            policies = await policy_service.fetch_policy_news(max_results=20)

            if policies:
                saved = await policy_service.save_to_db(policies, db)
                print(f"✅ AI Policy: {saved}개 신규 정책 저장")
            else:
                print("⚠️  정책 정보를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 정책들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AIPolicy).where(
                    AIPolicy.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                policies_without_summary = result.scalars().all()

                if policies_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(policies_without_summary)}개 정책)...")

                    for policy in policies_without_summary:
                        try:
                            summary_data = await ai_service.summarize_policy(
                                title=policy.title,
                                description=policy.description or "",
                                policy_type=policy.policy_type,
                                impact_areas=policy.impact_areas or [],
                            )

                            if summary_data.get("summary"):
                                policy.summary = summary_data["summary"]
                                policy.keywords = summary_data.get("keywords", [])
                                print(f"  ✅ {policy.title[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {policy.title[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {policy.title[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Policy 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Policy 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")


async def collect_startup_data():
    """AI Startup 데이터 수집 작업"""
    print(f"\n{'='*60}")
    print(f"🚀 AI Startup 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    async with AsyncSessionLocal() as db:
        try:
            # 1. RSS 피드에서 AI 스타트업 펀딩 뉴스 수집
            startup_service = StartupService()

            startups = await startup_service.fetch_funding_news(max_results=20)

            if startups:
                saved = await startup_service.save_to_db(startups, db)
                print(f"✅ AI Startup: {saved}개 신규 스타트업 저장")
            else:
                print("⚠️  스타트업 정보를 찾을 수 없습니다")

            # 2. AI 요약 생성 (요약이 없는 스타트업들에 대해)
            ai_service = AISummaryService()
            if ai_service.model:  # API 키가 있는 경우만
                query = select(AIStartup).where(
                    AIStartup.summary == None
                ).limit(10)  # 한번에 10개씩
                result = await db.execute(query)
                startups_without_summary = result.scalars().all()

                if startups_without_summary:
                    print(f"\n🧠 AI 요약 생성 시작 ({len(startups_without_summary)}개 스타트업)...")

                    for startup in startups_without_summary:
                        try:
                            summary_data = await ai_service.summarize_startup(
                                company_name=startup.company_name,
                                description=startup.description or "",
                                funding_series=startup.funding_series,
                                industry_tags=startup.industry_tags or [],
                            )

                            if summary_data.get("summary"):
                                startup.summary = summary_data["summary"]
                                startup.keywords = summary_data.get("keywords", [])
                                print(f"  ✅ {startup.company_name[:40]} - 요약 완료")
                            else:
                                print(f"  ⚠️  {startup.company_name[:40]} - 요약 실패")

                            # API 호출 제한 회피
                            await asyncio.sleep(2)

                        except Exception as e:
                            print(f"  ❌ {startup.company_name[:40]} - 에러: {e}")
                            continue

                    await db.commit()
                    print(f"✅ AI 요약 완료")
            else:
                print("⚠️  Gemini API 키가 없어 요약을 건너뜁니다")

        except Exception as e:
            print(f"❌ Startup 수집 중 에러 발생: {e}")
        finally:
            await db.close()

    print(f"\n{'='*60}")
    print(f"✨ Startup 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
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
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_conference_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_tool_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_leaderboard_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_job_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_policy_data()
    await asyncio.sleep(3)  # 잠깐 대기

    await collect_startup_data()

    print(f"\n{'='*80}")
    print(f"🎉 전체 수집 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")


def start_scheduler():
    """스케줄러 시작"""
    logger = logging.getLogger(__name__)

    # 매일 자정(00:00)에 전체 데이터 수집
    scheduler.add_job(
        collect_all_data,
        trigger=CronTrigger(hour=0, minute=0),  # 매일 00:00
        id="collect_all_data",
        name="전체 AI 트렌드 데이터 수집",
        replace_existing=True,
    )

    logger.info("⏰ 스케줄러 시작: 매일 00:00에 전체 데이터 수집 (HuggingFace + YouTube + Papers + News + GitHub + 6개 신규 카테고리)")
    print("⏰ 스케줄러 시작: 매일 00:00에 전체 데이터 수집 (HuggingFace + YouTube + Papers + News + GitHub + Conference + Tool + Leaderboard + Job + Policy + Startup)")
    scheduler.start()


def stop_scheduler():
    """스케줄러 중지"""
    scheduler.shutdown()
    print("⏰ 스케줄러 종료")


async def run_collection_now():
    """즉시 수집 실행 (테스트용)"""
    await collect_all_data()
