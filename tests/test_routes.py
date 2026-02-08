"""라우팅 회귀 테스트.

F-1 #3: /papers/search가 동적 라우트에 매칭되지 않는지 확인.
"""
import importlib
import inspect


def test_papers_search_route_before_dynamic():
    """papers.py에서 /search 정적 라우트가 /{arxiv_id} 앞에 선언되어 있는지 확인."""
    from app.api.v1 import papers

    source = inspect.getsource(papers)

    search_pos = source.find('"/search"')
    if search_pos == -1:
        search_pos = source.find("'/search'")

    dynamic_pos = source.find('"{arxiv_id}"')
    if dynamic_pos == -1:
        dynamic_pos = source.find("'/{arxiv_id}'")
    if dynamic_pos == -1:
        dynamic_pos = source.find('"/{arxiv_id}"')

    # /search가 발견되지 않으면 통합 검색으로 대체된 것이므로 OK
    if search_pos == -1:
        return

    assert search_pos < dynamic_pos, (
        "/papers/search 라우트가 /{arxiv_id} 동적 라우트보다 뒤에 선언되어 있습니다. "
        "정적 라우트를 먼저 선언해야 합니다."
    )


def test_all_routers_registered():
    """main.py에 모든 필수 라우터가 등록되어 있는지 확인."""
    required_prefixes = [
        "/api/v1/huggingface",
        "/api/v1/youtube",
        "/api/v1/papers",
        "/api/v1/news",
        "/api/v1/github",
        "/api/v1/system",
        "/api/v1/conferences",
        "/api/v1/tools",
        "/api/v1/jobs",
        "/api/v1/policies",
        "/api/v1/dashboard",
        "/api/v1/admin",
        "/api/v1/search",
    ]

    from app.main import app

    registered = set()
    for route in app.routes:
        path = getattr(route, "path", "")
        if path.startswith("/api/v1/"):
            # Extract prefix: /api/v1/xxx/... → /api/v1/xxx
            parts = path.split("/")
            if len(parts) >= 4:
                prefix = "/".join(parts[:4])
                registered.add(prefix)

    for prefix in required_prefixes:
        assert prefix in registered, f"라우터 {prefix}가 main.py에 등록되어 있지 않습니다"
