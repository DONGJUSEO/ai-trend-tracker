"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import type { AINews } from "@/lib/types";
import GlassmorphicCard from "@/components/shared/GlassmorphicCard";
import CategoryIcon from "@/components/icons/CategoryIcon";

const category = CATEGORIES.find((c) => c.id === "news")!;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const headers = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

const KOREAN_SOURCES = ["전자신문", "AI타임스", "블로터", "데일리안", "한국경제", "매일경제", "IT조선", "디지털타임스", "지디넷코리아", "테크M", "아이뉴스24", "뉴스1", "조선일보", "중앙일보", "동아일보"];

type TabFilter = "전체" | "국내" | "해외";
const TABS: TabFilter[] = ["전체", "국내", "해외"];

function isKoreanSource(source: string): boolean {
  return KOREAN_SOURCES.some((ks) => source.includes(ks));
}

// ─── Helpers ────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

function getSentimentConfig(sentiment?: "positive" | "negative" | "neutral") {
  switch (sentiment) {
    case "positive":
      return {
        label: "긍정",
        className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        dot: "bg-emerald-400",
      };
    case "negative":
      return {
        label: "부정",
        className: "bg-rose-500/15 text-rose-300 border-rose-500/20",
        dot: "bg-rose-400",
      };
    case "neutral":
      return {
        label: "중립",
        className: "bg-gray-500/15 text-gray-300 border-gray-500/20",
        dot: "bg-gray-400",
      };
    default:
      return null;
  }
}

function getCategoryBadgeStyle(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("ai") || c.includes("인공지능"))
    return "bg-violet-500/15 text-violet-300 border-violet-500/20";
  if (c.includes("tech") || c.includes("기술"))
    return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  if (c.includes("business") || c.includes("비즈니스"))
    return "bg-amber-500/15 text-amber-300 border-amber-500/20";
  if (c.includes("research") || c.includes("연구"))
    return "bg-cyan-500/15 text-cyan-300 border-cyan-500/20";
  if (c.includes("policy") || c.includes("정책"))
    return "bg-indigo-500/15 text-indigo-300 border-indigo-500/20";
  return "bg-white/10 text-white/60 border-white/10";
}

// ─── Loading Skeleton ───────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="h-40 bg-white/10" />
          <div className="p-5">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-16 bg-white/10 rounded-full" />
              <div className="h-5 w-12 bg-white/10 rounded-full" />
            </div>
            <div className="h-5 bg-white/10 rounded w-full mb-2" />
            <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-4 bg-white/10 rounded w-full mb-2" />
            <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
            <div className="flex gap-2">
              <div className="h-5 w-14 bg-white/10 rounded-full" />
              <div className="h-5 w-18 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pagination ─────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        이전
      </button>

      {getPageNumbers().map((p, idx) =>
        typeof p === "string" ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 py-2 text-white/30 text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              p === page
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold"
                : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
}

// ─── News Card ──────────────────────────────────────────────

function NewsCard({
  news,
  index,
}: {
  news: AINews;
  index: number;
}) {
  const sentimentConfig = getSentimentConfig(news.sentiment);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <a
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <GlassmorphicCard className="overflow-hidden h-full">
          {/* Optional image */}
          {news.image_url && !imageFailed && (
            <div className="relative h-44 bg-white/5 overflow-hidden">
              <Image
                src={news.image_url}
                alt={news.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-5">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* Source badge */}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                {news.source}
              </span>

              {/* Category badge */}
              {news.category && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeStyle(
                    news.category
                  )}`}
                >
                  {news.category}
                </span>
              )}

              {/* Sentiment indicator */}
              {sentimentConfig && (
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sentimentConfig.className}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${sentimentConfig.dot}`}
                  />
                  {sentimentConfig.label}
                </span>
              )}

              {/* Time */}
              {news.published_at && (
                <span className="text-xs text-white/30 ml-auto">
                  {timeAgo(news.published_at)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-white font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
              {news.title}
            </h3>

            {/* AI Summary */}
            {news.summary && (
              <p className="text-white/50 text-sm line-clamp-2 mb-2">
                {news.summary}
              </p>
            )}

            {/* Description */}
            <p className="text-white/45 text-sm leading-relaxed mb-4 line-clamp-3">
              {truncateText(news.description || news.excerpt || news.content || "", 150)}
            </p>

            {/* Keywords */}
            {news.keywords && news.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {news.keywords.slice(0, 5).map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/40 border border-white/5"
                  >
                    {kw}
                  </span>
                ))}
                {news.keywords.length > 5 && (
                  <span className="px-2 py-0.5 rounded-md text-xs text-white/25">
                    +{news.keywords.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </GlassmorphicCard>
      </a>
    </motion.div>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState() {
  return (
    <GlassmorphicCard className="p-12" hover={false}>
      <div className="text-center">
        <div className="text-5xl mb-4 opacity-50">📰</div>
        <h3 className="text-white/70 text-lg font-medium mb-2">
          데이터를 수집 중입니다...
        </h3>
        <p className="text-white/40 text-sm">
          AI 뉴스 데이터가 곧 업데이트됩니다.
        </p>
      </div>
    </GlassmorphicCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function NewsPage() {
  const [news, setNews] = useState<AINews[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<TabFilter>("전체");

  const filteredNews = useMemo(() => {
    if (activeTab === "전체") return news;
    if (activeTab === "국내") return news.filter((item) => isKoreanSource(item.source));
    return news.filter((item) => !isKoreanSource(item.source));
  }, [news, activeTab]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/news/news?page=${page}&page_size=20`,
        { headers }
      );
      if (res.ok) {
        const json = await res.json();
        setNews(json.news || json.items || []);
        setTotalPages(json.total_pages || Math.ceil((json.total || 0) / 20));
        setTotal(json.total || 0);
      }
    } catch {
      // API unavailable
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <GlassmorphicCard className="p-8" hover={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl" style={{ color: category.color }}>
              <CategoryIcon iconKey={category.iconKey} size={34} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {category.koreanName}
              </h1>
              <p className="text-white/50 mt-1">
                {category.name} - 최신 AI 뉴스
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {!loading && total > 0 && (
              <span className="text-sm text-white/40">
                총 {total.toLocaleString()}개
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <svg
                className="w-3.5 h-3.5 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              <span className="text-sm text-white/60">최신순</span>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Tab Filter */}
      <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-full w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : filteredNews.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((item, index) => (
                <NewsCard key={item.id} news={item} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && news.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
