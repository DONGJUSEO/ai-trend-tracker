"""GitHub API 서비스"""
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.github import GitHubProject
from app.schemas.github import GitHubProjectCreate
from app.config import get_settings

settings = get_settings()


class GitHubService:
    """GitHub API 서비스 (API 키 선택사항)"""

    BASE_URL = "https://api.github.com"

    def __init__(self, api_token: Optional[str] = None):
        """
        Args:
            api_token: GitHub Personal Access Token (선택사항, rate limit 증가)
        """
        self.api_token = api_token or getattr(settings, "github_token", "")
        self.headers = {}
        if self.api_token:
            self.headers["Authorization"] = f"token {self.api_token}"

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
                # AI/ML 관련 키워드로 검색
                # 최근 생성되고 별이 많은 순으로 정렬
                topics = [
                    "machine-learning",
                    "artificial-intelligence",
                    "deep-learning",
                    "neural-network",
                    "pytorch",
                    "tensorflow",
                    "llm",
                    "transformers",
                ]

                # 기본 쿼리: AI/ML 키워드 검색 + 최소 별 개수
                query_parts = [f"topic:{topics[0]}"]  # 첫 번째 토픽 사용
                query_parts.append("stars:>100")  # 최소 100개 이상의 별
                query_parts.append("pushed:>2025-01-01")  # 최근 업데이트

                if language:
                    query_parts.append(f"language:{language}")

                query = " ".join(query_parts)

                params = {
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": min(max_results, 100),
                }

                response = await client.get(
                    f"{self.BASE_URL}/search/repositories",
                    params=params,
                    headers=self.headers,
                )
                response.raise_for_status()
                data = response.json()

                repos = []
                for item in data.get("items", []):
                    repo_info = await self._parse_repo_data(item)
                    repos.append(repo_info)

                print(f"✅ GitHub: {len(repos)}개 트렌딩 프로젝트 수집")
                return repos

        except httpx.HTTPStatusError as e:
            print(f"❌ GitHub API 오류: {e.response.status_code} - {e.response.text}")
            return []
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
        created_at = None
        if item.get("created_at"):
            try:
                created_at = datetime.fromisoformat(
                    item["created_at"].replace("Z", "+00:00")
                )
            except Exception:
                pass

        updated_at = None
        if item.get("updated_at"):
            try:
                updated_at = datetime.fromisoformat(
                    item["updated_at"].replace("Z", "+00:00")
                )
            except Exception:
                pass

        pushed_at = None
        if item.get("pushed_at"):
            try:
                pushed_at = datetime.fromisoformat(
                    item["pushed_at"].replace("Z", "+00:00")
                )
            except Exception:
                pass

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

        for project_data in projects:
            try:
                # 이미 존재하는지 확인
                result = await db.execute(
                    select(GitHubProject).where(
                        GitHubProject.repo_name == project_data["repo_name"]
                    )
                )
                existing_project = result.scalar_one_or_none()

                if existing_project:
                    # 업데이트 (스타, 포크 등)
                    existing_project.stars = project_data.get("stars", 0)
                    existing_project.forks = project_data.get("forks", 0)
                    existing_project.watchers = project_data.get("watchers", 0)
                    existing_project.open_issues = project_data.get("open_issues", 0)
                    existing_project.is_trending = True
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
                    saved_count += 1

                await db.commit()

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

        if trending_only:
            query = query.where(GitHubProject.is_trending == True)

        if language:
            query = query.where(GitHubProject.language == language)

        query = query.order_by(desc(GitHubProject.stars)).offset(skip).limit(limit)

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
