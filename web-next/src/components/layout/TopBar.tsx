"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bookmark,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Sun,
} from "lucide-react";
import useSWR from "swr";
import { CATEGORIES, getCategoryByHref } from "@/lib/constants";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import CategoryIcon from "@/components/icons/CategoryIcon";
import type { GlobalSearchResponse, SearchResultItem } from "@/lib/types";
import { apiFetcher } from "@/lib/fetcher";
import {
  getAlertSettings,
  getBookmarks,
  getRecentItems,
  setAlertSetting,
  pushRecentItem,
  type SavedItem,
} from "@/lib/user-preferences";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onMenuToggle: () => void;
}

function getResultId(category: string, id: string): string {
  return `${category}:${id}`;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const category = getCategoryByHref(pathname);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<SavedItem[]>([]);
  const [recentItems, setRecentItems] = useState<SavedItem[]>([]);
  const [alertSettings, setAlertSettings] = useState<Record<string, boolean>>({});

  const trimmedQuery = query.trim();
  const searchKey =
    trimmedQuery.length >= 2
      ? `/api/v1/search?q=${encodeURIComponent(trimmedQuery)}&page=1&page_size=12`
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

  useEffect(() => {
    const refresh = () => {
      setBookmarks(getBookmarks());
      setRecentItems(getRecentItems());
      setAlertSettings(getAlertSettings());
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  function handleRefresh() {
    router.refresh();
    window.location.reload();
  }

  function handleResultClick(item: {
    category: string;
    id: string;
    title: string;
    url?: string;
  }) {
    pushRecentItem({
      id: getResultId(item.category, item.id),
      title: item.title,
      url: item.url,
      category: item.category,
    });
    setRecentItems(getRecentItems());
    setSearchOpen(false);
  }

  function updateAlert(categoryId: string, checked: boolean | "indeterminate") {
    const next = setAlertSetting(categoryId, !!checked);
    setAlertSettings(next);
  }

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
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
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
              {searchLoading && (
                <div className="px-3 py-2 text-sm text-muted-foreground">검색 중...</div>
              )}
              {!searchLoading && (!searchData?.items || searchData.items.length === 0) && (
                <div className="px-3 py-2 text-sm text-muted-foreground">검색 결과가 없습니다</div>
              )}
              {!searchLoading &&
                Object.entries(groupedResults).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <p className="px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    {items.slice(0, 4).map((item) => (
                      <a
                        key={`${item.category}-${item.id}`}
                        href={item.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseDown={() => handleResultClick(item)}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
                        }`}
                      >
                        <p className="font-medium line-clamp-1">{item.title}</p>
                        {item.snippet && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.snippet}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                    : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
                }`}
                aria-label="북마크"
                title="북마크"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>북마크</DropdownMenuLabel>
              {bookmarks.length === 0 && (
                <DropdownMenuItem disabled>저장된 항목이 없습니다</DropdownMenuItem>
              )}
              {bookmarks.slice(0, 8).map((item) => (
                <DropdownMenuItem key={`${item.category}:${item.id}`} asChild>
                  <a href={item.url || "#"} target="_blank" rel="noopener noreferrer">
                    <span className="truncate">{item.title}</span>
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>최근 본 항목</DropdownMenuLabel>
              {recentItems.length === 0 && (
                <DropdownMenuItem disabled>최근 기록이 없습니다</DropdownMenuItem>
              )}
              {recentItems.slice(0, 6).map((item) => (
                <DropdownMenuItem key={`recent:${item.category}:${item.id}`} asChild>
                  <a href={item.url || "#"} target="_blank" rel="noopener noreferrer">
                    <span className="truncate">{item.title}</span>
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                    : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
                }`}
                aria-label="알림 설정"
                title="알림 설정"
              >
                <Bell className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>카테고리 알림 설정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CATEGORIES.filter((x) => x.id !== "dashboard" && x.id !== "system").map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.id}
                  checked={!!alertSettings[cat.id]}
                  onCheckedChange={(checked) => updateAlert(cat.id, checked)}
                >
                  {cat.koreanName}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
