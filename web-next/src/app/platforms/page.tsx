"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const headers = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

const category = CATEGORIES.find((c) => c.id === "platforms")!;

// API returns AITool items, not AIPlatform
interface AITool {
  id?: string;
  tool_name: string;
  tagline: string;
  description: string;
  category: string;
  pricing_model: string;
  price_range: string;
  free_tier_available: boolean;
  website: string;
  rating: number;
  upvotes?: number;
  is_trending?: boolean;
  use_cases: string[];
  supported_platforms: string[];
}

const CATEGORY_TABS = [
  { key: "all", label: "전체" },
  { key: "llm", label: "LLM/Chatbot" },
  { key: "image", label: "Image/Video" },
  { key: "audio", label: "Audio/Music" },
  { key: "code", label: "Code" },
  { key: "productivity", label: "Productivity" },
];

// Mapping function to match API category strings to filter tabs
function matchesCategory(toolCategory: string, filterKey: string): boolean {
  if (filterKey === "all") return true;
  const lower = toolCategory.toLowerCase();
  switch (filterKey) {
    case "llm":
      return (
        lower.includes("llm") ||
        lower.includes("chatbot") ||
        lower.includes("language") ||
        lower.includes("chat") ||
        lower.includes("conversational")
      );
    case "image":
      return (
        lower.includes("image") ||
        lower.includes("video") ||
        lower.includes("vision") ||
        lower.includes("visual") ||
        lower.includes("art") ||
        lower.includes("design")
      );
    case "audio":
      return (
        lower.includes("audio") ||
        lower.includes("music") ||
        lower.includes("speech") ||
        lower.includes("voice") ||
        lower.includes("sound")
      );
    case "code":
      return (
        lower.includes("code") ||
        lower.includes("developer") ||
        lower.includes("programming") ||
        lower.includes("coding")
      );
    case "productivity":
      return (
        lower.includes("productivity") ||
        lower.includes("writing") ||
        lower.includes("business") ||
        lower.includes("automation") ||
        lower.includes("workflow")
      );
    default:
      return true;
  }
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse"
        >
          <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-full mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
          <div className="flex gap-2">
            <div className="h-6 bg-white/10 rounded w-16" />
            <div className="h-6 bg-white/10 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalf && (
        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#halfGrad)"
            stroke="currentColor"
            strokeWidth="0.5"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-white/20"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-white/40 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
      >
        이전
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-9 h-9 rounded-lg text-sm transition-all ${
                page === pageNum
                  ? "bg-pink-500/30 border border-pink-400/50 text-pink-300"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
      >
        다음
      </button>
    </div>
  );
}

export default function PlatformsPage() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/v1/tools/?page=${page}&page_size=20`,
          { headers }
        );
        if (res.ok) {
          const json = await res.json();
          setTools(json.items || []);
          setTotalPages(json.total_pages || Math.ceil((json.total || 0) / 20));
        }
      } catch {
        // API unavailable
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => matchesCategory(tool.category || "", activeTab));
  }, [tools, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {category.koreanName}
            </h1>
            <p className="text-white/50 mt-1">
              AI 서비스 및 도구 모음
            </p>
          </div>
          {!loading && (
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-pink-400">
                {tools.length}
              </div>
              <div className="text-xs text-white/40">플랫폼</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-pink-500/20 border border-pink-400/50 text-pink-300"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredTools.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-white/50 text-lg">
            해당 카테고리의 플랫폼이 없습니다
          </p>
          <p className="text-white/30 text-sm mt-2">
            다른 카테고리를 선택해보세요
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredTools.map((tool, idx) => (
              <motion.div
                key={tool.id || tool.tool_name || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all group flex flex-col"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-semibold text-base truncate group-hover:text-pink-300 transition-colors">
                        {tool.tool_name}
                      </h3>
                      {tool.is_trending && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/20 text-orange-400 whitespace-nowrap">
                          Trending
                        </span>
                      )}
                    </div>
                    {tool.tagline && (
                      <p className="text-white/40 text-xs truncate">
                        {tool.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Badge + Pricing */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    {tool.category}
                  </span>
                  {tool.pricing_model && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {tool.pricing_model}
                    </span>
                  )}
                  {tool.free_tier_available && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      무료 티어
                    </span>
                  )}
                  {tool.price_range && (
                    <span className="text-xs text-white/40">
                      {tool.price_range}
                    </span>
                  )}
                </div>

                {/* Description */}
                {tool.description && (
                  <p className="text-white/50 text-sm mb-3 line-clamp-3 flex-1">
                    {tool.description}
                  </p>
                )}

                {/* Rating */}
                {tool.rating != null && tool.rating > 0 && (
                  <div className="mb-3 flex items-center gap-2">
                    <StarRating rating={tool.rating} />
                    {tool.upvotes != null && tool.upvotes > 0 && (
                      <span className="text-xs text-white/30">
                        ({tool.upvotes} upvotes)
                      </span>
                    )}
                  </div>
                )}

                {/* Use Cases Tags */}
                {tool.use_cases && tool.use_cases.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tool.use_cases.slice(0, 4).map((uc, ucIdx) => (
                      <span
                        key={ucIdx}
                        className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-white/50"
                      >
                        {uc}
                      </span>
                    ))}
                    {tool.use_cases.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md text-xs text-white/30">
                        +{tool.use_cases.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Supported Platforms */}
                {tool.supported_platforms && tool.supported_platforms.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-xs text-white/30">지원:</span>
                    {tool.supported_platforms.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-xs text-white/50"
                      >
                        {p}{pIdx < tool.supported_platforms.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* Website Link */}
                {tool.website && (
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      웹사이트 방문
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
}
