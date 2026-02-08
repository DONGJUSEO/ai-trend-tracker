"""GitHub API 서비스"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.github import GitHubProject
from app.config import get_settings
from app.db_compat import has_archive_column, has_columns

settings = get_settings()


class GitHubService:
    """GitHub API 서비스 (API 키 선택사항)"""

    BASE_URL = "https://api.github.com"
    EXCLUDE_REPOS = {
        # Mega-repos (too generic, always at the top)
        "tensorflow/tensorflow",
        "pytorch/pytorch",
        "huggingface/transformers",
        "keras-team/keras",
        "scikit-learn/scikit-learn",
        "apache/spark",
        "microsoft/CNTK",
        "caffe2/caffe2",
        # Popular non-AI repos that match AI topic queries
        "kamranahmedse/developer-roadmap",
        "yt-dlp/yt-dlp",
        "awesome-selfhosted/awesome-selfhosted",
        "microsoft/PowerToys",
        "sindresorhus/awesome",
        "public-apis/public-apis",
        "donnemartin/system-design-primer",
        "jwasham/coding-interview-university",
        "torvalds/linux",
        "microsoft/vscode",
        "facebook/react",
        "vercel/next.js",
        "golang/go",
        "rust-lang/rust",
        "denoland/deno",
        "flutter/flutter",
        "ohmyzsh/ohmyzsh",
        "freeCodeCamp/freeCodeCamp",
        "EbookFoundation/free-programming-books",
        "practical-tutorials/project-based-learning",
    }

    def __init__(self, api_token: Optional[str] = None):
        """
        Args:
            api_token: GitHub Personal Access Token (선택사항, rate limit 증가)
        """
        self.api_token = api_token or getattr(settings, "github_token", "")
        self.headers = {"Accept": "application/vnd.github+json"}
        if self.api_token:
            self.headers["Authorization"] = f"token {self.api_token}"

    @staticmethod
    def _get_cutoff_by_since(since: str) -> str:
        """기간 옵션에 맞는 pushed 필터 날짜 계산."""
        now = datetime.utcnow()
        since_map = {
            "daily": now - timedelta(days=7),
            "weekly": now - timedelta(days=30),
            "monthly": now - relativedelta(months=3),
        }
        cutoff = since_map.get(since, now - relativedelta(months=3))
        return cutoff.strftime("%Y-%m-%d")

    def _build_search_queries(self, language: str, since: str) -> List[str]:
        """422를 피하는 다중 fan-out 검색 쿼리군 구성."""
        _ = self._get_cutoff_by_since(since)
        language_filter = f" language:{language}" if language else ""

        return [
            f"topic:llm created:>2025-11-01 stars:>50{language_filter}",
            f"topic:ai-agent created:>2025-11-01 stars:>30{language_filter}",
            f"topic:rag created:>2025-11-01 stars:>30{language_filter}",
            f"topic:multimodal created:>2025-11-01 stars:>20{language_filter}",
            f"topic:machine-learning pushed:>2026-01-25 stars:>100{language_filter}",
            f"topic:deep-learning pushed:>2026-01-25 stars:>100{language_filter}",
            f"topic:mcp-server stars:>10{language_filter}",
            f"topic:ai-coding stars:>50 pushed:>2026-01-01{language_filter}",
            f"topic:text-to-speech stars:>30 created:>2025-09-01{language_filter}",
            f"topic:vision-language-model stars:>20 created:>2025-09-01{language_filter}",
        ]

    @staticmethod
    def _parse_github_datetime(value: Optional[str]) -> Optional[datetime]:
        """GitHub ISO datetime -> naive UTC datetime (DB TIMESTAMP 호환)."""
        if not value:
            return None
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if dt.tzinfo is not None:
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
            return dt
        except Exception:
            return None

    async def _search_repositories(
        self,
        client: httpx.AsyncClient,
        query: str,
        per_page: int,
        sort: str = "updated",
        order: str = "desc",
    ) -> List[Dict[str, Any]]:
        """GitHub Search API 호출 헬퍼."""
        response = await client.get(
            f"{self.BASE_URL}/search/repositories",
            params={
                "q": query,
                "sort": sort,
                "order": order,
                "per_page": per_page,
            },
            headers=self.headers,
        )
        if response.status_code >= 400:
            rate_remaining = response.headers.get("X-RateLimit-Remaining")
            rate_reset = response.headers.get("X-RateLimit-Reset")
            print(
                "❌ GitHub API 오류 "
                f"(status={response.status_code}, remaining={rate_remaining}, reset={rate_reset}) "
                f"query={query}\n{response.text}"
            )
            return []
        data = response.json()
        return data.get("items", [])

    async def fetch_trending_repos(
        self,
        language: str = "",
        since: str = "daily",
        max_results: int = 30,
    ) -> List[Dict[str, Any]]:
        """
        GitHub에서 AI/ML 관련 트렌딩 레포지토리 검색

        Note: GitHub 공식 Trending API는 없으므로 Search API를 사용하여
        최근 인기 있는 AI/ML 프로젝트를 검색합니다.

        Args:
            language: 프로그래밍 언어 필터
            since: 기간 (daily, weekly, monthly)
            max_results: 최대 결과 수

        Returns:
            레포지토리 정보 리스트
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                queries = self._build_search_queries(language=language, since=since)
                per_query = max(10, min(50, max_results))

                dedup: Dict[str, Dict[str, Any]] = {}
                for query in queries:
                    sort = "stars" if "created:>" in query else "updated"
                    items = await self._search_repositories(
                        client=client,
                        query=query,
                        per_page=per_query,
                        sort=sort,
                        order="desc",
                    )
                    for item in items:
                        repo_name = item.get("full_name")
                        if not repo_name:
                            continue
                        if repo_name in self.EXCLUDE_REPOS:
                            continue
                        # 같은 repo가 여러 쿼리에서 잡히면 stars 높은 데이터를 유지
                        prev = dedup.get(repo_name)
                        if (not prev) or (
                            item.get("stargazers_count", 0)
                            > prev.get("stargazers_count", 0)
                        ):
                            dedup[repo_name] = item

                sorted_items = sorted(
                    dedup.values(),
                    key=lambda x: (
                        x.get("updated_at", ""),
                        x.get("stargazers_count", 0),
                    ),
                    reverse=True,
                )[: max_results]

                repos = []
                for item in sorted_items:
                    repo_info = await self._parse_repo_data(item)
                    repos.append(repo_info)

                print(
                    f"✅ GitHub: {len(repos)}개 트렌딩 프로젝트 수집 "
                    f"(queries={len(queries)}, dedup={len(dedup)})"
                )
                return repos
        except Exception as e:
            print(f"❌ GitHub 데이터 수집 실패: {e}")
            return []

    async def _parse_repo_data(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        GitHub API 응답 데이터 파싱

        Args:
            item: GitHub API 레포지토리 아이템

        Returns:
            파싱된 레포지토리 정보
        """
        # 날짜 파싱
        created_at = self._parse_github_datetime(item.get("created_at"))
        updated_at = self._parse_github_datetime(item.get("updated_at"))
        pushed_at = self._parse_github_datetime(item.get("pushed_at"))

        # 라이센스 정보
        license_name = None
        if item.get("license") and isinstance(item["license"], dict):
            license_name = item["license"].get("name")

        repo_info = {
            "repo_name": item.get("full_name", ""),
            "owner": item.get("owner", {}).get("login", ""),
            "name": item.get("name", ""),
            "description": item.get("description", ""),
            "url": item.get("html_url", ""),
            "homepage": item.get("homepage"),
            "language": item.get("language"),
            "stars": item.get("stargazers_count", 0),
            "forks": item.get("forks_count", 0),
            "watchers": item.get("watchers_count", 0),
            "open_issues": item.get("open_issues_count", 0),
            "topics": item.get("topics", []),
            "license": license_name,
            "created_at_github": created_at,
            "updated_at_github": updated_at,
            "pushed_at": pushed_at,
        }

        return repo_info

    async def save_projects_to_db(
        self, projects: List[Dict[str, Any]], db: AsyncSession
    ) -> int:
        """
        프로젝트 정보를 데이터베이스에 저장

        Args:
            projects: 프로젝트 정보 리스트
            db: 데이터베이스 세션

        Returns:
            저장된 프로젝트 수
        """
        saved_count = 0
        column_flags = await has_columns(
            db,
            "github_projects",
            ["is_archived", "archived_at"],
        )
        has_archive_columns = (
            column_flags["is_archived"] and column_flags["archived_at"]
        )

        for project_data in projects:
            try:
                inserted_new = False
                # 이미 존재하는지 확인
                result = await db.execute(
                    select(GitHubProject).where(
                        GitHubProject.repo_name == project_data["repo_name"]
                    )
                )
                existing_project = result.scalar_one_or_none()

                if existing_project:
                    # Phase 2: star_velocity 계산 (이전 데이터와 비교)
                    prev_stars = existing_project.stars or 0
                    new_stars = project_data.get("stars", 0)
                    star_velocity = new_stars - prev_stars
                    if star_velocity > 0:
                        print(f"📈 Star velocity for {project_data['repo_name']}: +{star_velocity}")

                    # 업데이트 (스타, 포크 등)
                    existing_project.stars = new_stars
                    existing_project.forks = project_data.get("forks", 0)
                    existing_project.watchers = project_data.get("watchers", 0)
                    existing_project.open_issues = project_data.get("open_issues", 0)
                    existing_project.is_trending = True
                    if has_archive_columns:
                        existing_project.is_archived = False
                        existing_project.archived_at = None
                else:
                    # 새로 추가
                    new_project = GitHubProject(
                        repo_name=project_data["repo_name"],
                        owner=project_data.get("owner"),
                        name=project_data.get("name"),
                        description=project_data.get("description"),
                        url=project_data.get("url"),
                        homepage=project_data.get("homepage"),
                        language=project_data.get("language"),
                        stars=project_data.get("stars", 0),
                        forks=project_data.get("forks", 0),
                        watchers=project_data.get("watchers", 0),
                        open_issues=project_data.get("open_issues", 0),
                        topics=project_data.get("topics", []),
                        license=project_data.get("license"),
                        created_at_github=project_data.get("created_at_github"),
                        updated_at_github=project_data.get("updated_at_github"),
                        pushed_at=project_data.get("pushed_at"),
                        is_trending=True,
                    )
                    db.add(new_project)
                    inserted_new = True

                await db.commit()
                if inserted_new:
                    saved_count += 1

            except Exception as e:
                await db.rollback()
                print(f"❌ 프로젝트 저장 실패 ({project_data.get('repo_name')}): {e}")

        return saved_count

    async def get_projects(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 30,
        trending_only: bool = False,
        language: Optional[str] = None,
        include_archived: bool = False,
    ) -> List[GitHubProject]:
        """
        데이터베이스에서 프로젝트 목록 가져오기

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 개수
            limit: 가져올 개수
            trending_only: 트렌딩 프로젝트만 가져올지 여부
            language: 프로그래밍 언어 필터

        Returns:
            프로젝트 목록
        """
        query = select(GitHubProject)

        supports_archive = await has_archive_column(db, "github_projects")
        if not include_archived and supports_archive:
            query = query.where(GitHubProject.is_archived == False)

        if trending_only:
            query = query.where(GitHubProject.is_trending == True)

        if language:
            query = query.where(GitHubProject.language == language)

        query = (
            query.order_by(
                desc(GitHubProject.updated_at_github),
                desc(GitHubProject.stars),
            )
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return result.scalars().all()

    async def get_project_by_name(
        self, db: AsyncSession, repo_name: str
    ) -> Optional[GitHubProject]:
        """
        레포지토리 이름으로 프로젝트 가져오기

        Args:
            db: 데이터베이스 세션
            repo_name: 레포지토리 이름 (owner/repo)

        Returns:
            프로젝트 객체 또는 None
        """
        result = await db.execute(
            select(GitHubProject).where(GitHubProject.repo_name == repo_name)
        )
        return result.scalar_one_or_none()
