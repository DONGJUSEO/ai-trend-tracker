"""프론트 API client 통합 회귀 테스트.

F-1 #4: 주요 페이지가 raw fetch 대신 공통 apiFetcher를 사용하도록 강제.
"""
from pathlib import Path
import re


FRONTEND_PAGES = [
    "web-next/src/app/page.tsx",
    "web-next/src/app/huggingface/page.tsx",
    "web-next/src/app/youtube/page.tsx",
    "web-next/src/app/papers/page.tsx",
    "web-next/src/app/news/page.tsx",
    "web-next/src/app/github/page.tsx",
    "web-next/src/app/conferences/page.tsx",
    "web-next/src/app/platforms/page.tsx",
    "web-next/src/app/jobs/page.tsx",
    "web-next/src/app/policies/page.tsx",
]


def _read(path: str) -> str:
    root = Path(__file__).parent.parent
    return (root / path).read_text(encoding="utf-8")


def test_pages_use_apifetcher_not_raw_fetch():
    """주요 데이터 페이지에서 raw fetch 사용 금지."""
    api_fetcher_pattern = re.compile(r"\bapiFetcher(?:<[^>]+>)?\s*\(")
    raw_fetch_pattern = re.compile(r"(?<![A-Za-z0-9_])fetch\s*\(")

    violations = []
    for page in FRONTEND_PAGES:
        content = _read(page)
        if not api_fetcher_pattern.search(content):
            violations.append(f"{page}: apiFetcher 호출 없음")
        if raw_fetch_pattern.search(content):
            violations.append(f"{page}: raw fetch 사용 발견")

    assert not violations, "프론트 API client 통합 위반:\n" + "\n".join(violations)


def test_fetcher_has_no_next_public_api_exposure():
    """fetcher/lib에서 NEXT_PUBLIC API 노출 경로 금지."""
    files = [
        "web-next/src/lib/fetcher.ts",
        "web-next/src/lib/api.ts",
    ]
    violations = []
    for path in files:
        content = _read(path)
        if "NEXT_PUBLIC_API_KEY" in content:
            violations.append(f"{path}: NEXT_PUBLIC_API_KEY 노출")
        if "NEXT_PUBLIC_API_URL" in content:
            violations.append(f"{path}: NEXT_PUBLIC_API_URL 의존")

    assert not violations, "프론트 보안 정책 위반:\n" + "\n".join(violations)
