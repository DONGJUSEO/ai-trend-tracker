"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetcher } from "@/lib/fetcher";
import type { GlobalSearchResponse, SearchResultItem } from "@/lib/types";
import ErrorState from "@/components/ui/ErrorState";

const CATEGORY_LABELS: Record<string, string> = {
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

function formatTimeAgo(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const diffMin = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${Math.floor(diffDay / 7)}주 전`;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = (searchParams.get("q") || "").trim();

  const [query, setQuery] = useState(initialQ);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [result, setResult] = useState<GlobalSearchResponse | null>(null);

  useEffect(() => {
    setQuery(initialQ);
    setPage(1);
  }, [initialQ]);

  const fetchResults = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setResult(null);
      return;
    }

    setLoading(true);
    setFetchError(false);
    try {
      const data = await apiFetcher<GlobalSearchResponse>(
        `/api/v1/search?q=${encodeURIComponent(q)}&page=${page}&page_size=30`
      );
      setResult(data);
    } catch {
      setFetchError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResultItem[]> = {};
    for (const item of result?.items || []) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [result]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h1 className="text-2xl font-bold text-white">통합 검색</h1>
        <p className="text-white/50 mt-1">전체 카테고리 데이터를 한 번에 검색합니다.</p>

        <form onSubmit={onSubmit} className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="2글자 이상 입력하세요"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white/90 hover:bg-white/15 transition-colors"
          >
            검색
          </button>
        </form>
      </motion.section>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : fetchError ? (
        <ErrorState onRetry={fetchResults} />
      ) : !query.trim() || query.trim().length < 2 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
          검색어를 입력해주세요.
        </div>
      ) : !result?.items?.length ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <section
              key={category}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
            >
              <h2 className="text-sm font-semibold text-white/80 mb-3">
                {CATEGORY_LABELS[category] || category} ({items.length})
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <a
                    key={`${item.category}-${item.id}`}
                    href={item.url || "#"}
                    target={item.url?.startsWith("http") ? "_blank" : undefined}
                    rel={item.url?.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-colors"
                  >
                    <p className="text-white font-medium line-clamp-1">{item.title}</p>
                    {item.snippet && (
                      <p className="text-sm text-white/55 mt-1 line-clamp-2">{item.snippet}</p>
                    )}
                    <div className="mt-2 text-xs text-white/35 flex items-center gap-3">
                      <span>score {item.score.toFixed(2)}</span>
                      {item.published_at && <span>{formatTimeAgo(item.published_at)}</span>}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}

          {result.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-30"
              >
                이전
              </button>
              <span className="text-sm text-white/60">
                {page} / {result.total_pages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(result.total_pages, prev + 1))}
                disabled={page >= result.total_pages}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-30"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

