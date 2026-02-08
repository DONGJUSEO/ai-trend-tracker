"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Sun,
} from "lucide-react";
import useSWR from "swr";
import { getCategoryByHref } from "@/lib/constants";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import CategoryIcon from "@/components/icons/CategoryIcon";
import type { GlobalSearchResponse, SearchResultItem } from "@/lib/types";
import { apiFetcher } from "@/lib/fetcher";

interface TopBarProps {
  onMenuToggle: () => void;
}

const CATEGORY_ROUTES: Record<string, string> = {
  huggingface: "/huggingface",
  youtube: "/youtube",
  papers: "/papers",
  news: "/news",
  github: "/github",
  conferences: "/conferences",
  platforms: "/platforms",
  tools: "/platforms",
  jobs: "/jobs",
  policies: "/policies",
};

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const category = getCategoryByHref(pathname);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const trimmedQuery = query.trim();
  const searchKey =
    trimmedQuery.length >= 2
      ? `/api/v1/search?q=${encodeURIComponent(trimmedQuery)}&page=1&page_size=20`
      : null;

  const { data: searchData, isLoading: searchLoading } = useSWR<GlobalSearchResponse>(
    searchKey,
    apiFetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    if (!searchData?.items) return groups;
    for (const item of searchData.items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [searchData]);

  function handleRefresh() {
    router.refresh();
    window.location.reload();
  }

  function handleResultClick(item: SearchResultItem) {
    setSearchOpen(false);
    setQuery("");
    // External URL이 있으면 새 탭으로 열기
    if (item.url && item.url.startsWith("http")) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }
    // 없으면 해당 카테고리 페이지로 이동
    const route = CATEGORY_ROUTES[item.category];
    if (route) {
      router.push(route);
    }
  }

  function goToSearchPage() {
    const q = trimmedQuery;
    if (q.length < 2) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      huggingface: "HuggingFace",
      youtube: "YouTube",
      papers: "AI 논문",
      news: "AI 뉴스",
      github: "GitHub",
      conferences: "컨퍼런스",
      platforms: "AI 플랫폼",
      tools: "AI 플랫폼",
      jobs: "AI 채용",
      policies: "AI 정책",
    };
    return labels[cat] || cat;
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full backdrop-blur-xl border-b ${
        theme === "dark" ? "bg-[#0f0a0a]/80 border-white/10" : "bg-white/80 border-black/10"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-8 gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuToggle}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
            aria-label="Toggle menu"
          >
            <Menu className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-gray-800"}`} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <span style={{ color: category.color }}>
              <CategoryIcon iconKey={category.iconKey} size={20} />
            </span>
            <div className="min-w-0">
              <h2 className={`text-lg font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {category.name}
              </h2>
              <p className={`text-xs hidden sm:block ${theme === "dark" ? "text-white/50" : "text-gray-500"}`}>
                {category.koreanName}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:block relative w-full max-w-md">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              theme === "dark"
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-black/10 text-gray-900"
            }`}
          >
            <Search className="w-4 h-4 opacity-60" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goToSearchPage();
                }
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              placeholder="전체 검색 (모델/논문/뉴스/레포...)"
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
            />
          </div>

          {searchOpen && trimmedQuery.length >= 2 && (
            <div
              className={`absolute mt-2 w-full rounded-xl border p-2 shadow-xl max-h-96 overflow-y-auto ${
                theme === "dark"
                  ? "bg-[#0f0a0a]/95 border-white/10"
                  : "bg-white/95 border-black/10"
              }`}
            >
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  goToSearchPage();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-cyan-300 hover:bg-white/10 mb-1"
              >
                전체 검색 결과 보기 →
              </button>
              {searchLoading && (
                <div className="px-3 py-2 text-sm text-muted-foreground">검색 중...</div>
              )}
              {!searchLoading && (!searchData?.items || searchData.items.length === 0) && (
                <div className="px-3 py-2 text-sm text-muted-foreground">검색 결과가 없습니다</div>
              )}
              {!searchLoading &&
                Object.entries(groupedResults).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <div className="flex items-center justify-between px-3 py-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {categoryLabel(group)}
                      </p>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchOpen(false);
                          setQuery("");
                          const route = CATEGORY_ROUTES[group];
                          if (route) router.push(route);
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300"
                      >
                        전체 보기 →
                      </button>
                    </div>
                    {items.slice(0, 4).map((item) => (
                      <button
                        key={`${item.category}-${item.id}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleResultClick(item);
                        }}
                        className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                          theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
                        }`}
                      >
                        <p className="font-medium line-clamp-1">{item.title}</p>
                        {item.snippet && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.snippet}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Action Buttons — 검색 / 새로고침 / 테마 / 로그아웃 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-white/60 hover:text-white"
                : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
            }`}
            aria-label="새로고침"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-white/60 hover:text-white"
                : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
            }`}
            aria-label={theme === "dark" ? "라이트 모드" : "다크 모드"}
            title={theme === "dark" ? "라이트 모드" : "다크 모드"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={logout}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-white/60 hover:text-white"
                : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
            }`}
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
