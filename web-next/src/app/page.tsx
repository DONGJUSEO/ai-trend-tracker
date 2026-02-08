"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CATEGORIES, APP_NAME } from "@/lib/constants";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { useTheme } from "@/lib/theme-context";

// ─── API Config ─────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const HEADERS = {
  "X-API-Key": API_KEY,
  "Content-Type": "application/json",
};

// ─── Types ──────────────────────────────────────────────────
interface SummaryCategory {
  name: string;
  total: number;
  recent_7d: number;
  last_update: string | null;
}

interface SummaryResponse {
  total_items: number;
  total_recent_7d: number;
  categories: Record<string, SummaryCategory>;
}

interface KeywordItem {
  keyword: string;
  count: number;
  weight: number;
}

interface CategoryStat {
  category: string;
  name: string;
  total: number;
  recent_7d: number;
  prev_7d: number;
  trend: "up" | "down" | "stable";
  last_update: string | null;
}

interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  published_date: string;
  summary: string;
}

interface HuggingFaceItem {
  model_name: string;
  author: string;
  downloads: number;
  likes: number;
  task: string;
  summary: string;
}

interface PaperItem {
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  published_date: string;
}

interface GitHubItem {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
}

interface ConferenceItem {
  conference_name: string;
  location: string;
  start_date: string;
  tier: string;
}

// ─── Helpers ────────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}주 전`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${Math.floor(diffMonth / 12)}년 전`;
}

function getCategoryColor(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.color ?? "#6B7280";
}

// ─── Skeleton Component ─────────────────────────────────────
function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} style={style} />;
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [hfModels, setHfModels] = useState<HuggingFaceItem[]>([]);
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [githubProjects, setGithubProjects] = useState<GitHubItem[]>([]);
  const [conferences, setConferences] = useState<ConferenceItem[]>([]);

  // ── Data Fetching ──
  useEffect(() => {
    async function fetchAll() {
      const [
        summaryRes,
        keywordsRes,
        statsRes,
        newsRes,
        hfRes,
        papersRes,
        githubRes,
        confRes,
      ] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/dashboard/summary`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/dashboard/trending-keywords?limit=20`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/dashboard/category-stats`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/news/news?page=1&page_size=5`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/huggingface/?page=1&page_size=3`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/papers/?page=1&page_size=3`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/github/projects?page=1&page_size=3`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/conferences/?page=1&page_size=3&upcoming=true`, { headers: HEADERS }),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
        setSummary(await summaryRes.value.json());
      }
      if (keywordsRes.status === "fulfilled" && keywordsRes.value.ok) {
        const data = await keywordsRes.value.json();
        setKeywords(data.top_keywords ?? []);
      }
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const data = await statsRes.value.json();
        setCategoryStats(data.categories ?? []);
      }
      if (newsRes.status === "fulfilled" && newsRes.value.ok) {
        const data = await newsRes.value.json();
        setNews(data.news ?? []);
      }
      if (hfRes.status === "fulfilled" && hfRes.value.ok) {
        const data = await hfRes.value.json();
        setHfModels(data.items ?? []);
      }
      if (papersRes.status === "fulfilled" && papersRes.value.ok) {
        const data = await papersRes.value.json();
        setPapers(data.papers ?? []);
      }
      if (githubRes.status === "fulfilled" && githubRes.value.ok) {
        const data = await githubRes.value.json();
        setGithubProjects(data.items ?? []);
      }
      if (confRes.status === "fulfilled" && confRes.value.ok) {
        const data = await confRes.value.json();
        setConferences(data.items ?? []);
      }

      setLoading(false);
    }

    fetchAll();
  }, []);

  // ── Derived data ──
  const categoriesTracked = summary ? Object.keys(summary.categories).length : 0;

  // ════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero skeleton */}
        <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-purple-500/20 animate-gradient" style={{ backgroundSize: "200% 200%" }} />
          <div className="relative z-10 space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-6 w-72" />
            <div className="flex gap-6 mt-8">
              <Skeleton className="h-20 w-40 rounded-xl" />
              <Skeleton className="h-20 w-40 rounded-xl" />
              <Skeleton className="h-20 w-40 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Ticker skeleton */}
        <Skeleton className="h-10 w-full rounded-xl" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>

        {/* Category stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>

        {/* Keywords skeleton */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-full" style={{ width: `${60 + Math.random() * 60}px` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDERED DASHBOARD
  // ════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: HERO - "AI Pulse"
          ═══════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl p-8 lg:p-12"
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(249,115,22,0.12) 25%, rgba(168,85,247,0.15) 50%, rgba(59,130,246,0.12) 75%, rgba(239,68,68,0.18) 100%)",
            backgroundSize: "200% 200%",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(239,68,68,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168,85,247,0.12) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-2">
              <span className="text-gradient">{APP_NAME}</span>
            </h1>
            <p className="text-lg text-white/60 font-medium">
              AI Trending &mdash; 실시간 AI 트렌드 펄스
            </p>
          </motion.div>

          {/* Stat counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-4 lg:gap-6 mt-8"
          >
            {[
              { label: "전체 데이터", value: summary?.total_items ?? 0, suffix: "" },
              { label: "최근 7일 추가", value: summary?.total_recent_7d ?? 0, suffix: "+" },
              { label: "트래킹 카테고리", value: categoriesTracked, suffix: "개" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className={`${
                  isLight
                    ? "bg-white/60 border-black/5"
                    : "bg-white/[0.08] border-white/10"
                } backdrop-blur-xl border rounded-2xl px-6 py-4 min-w-[140px]`}
              >
                <div className="text-2xl lg:text-3xl font-bold text-gradient">
                  {formatNumber(stat.value)}{stat.suffix}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: BREAKING NEWS TICKER
          ═══════════════════════════════════════════════════════ */}
      {news.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`${
            isLight
              ? "bg-white/60 border-black/5"
              : "bg-white/5 border-white/10"
          } backdrop-blur-xl border rounded-2xl overflow-hidden`}
        >
          <div className="relative flex items-center h-12">
            {/* Label */}
            <div className="flex-shrink-0 px-4 h-full flex items-center bg-red-500/20 border-r border-red-500/30 z-10">
              <span className="text-red-400 font-bold text-xs uppercase tracking-wider">LIVE</span>
            </div>

            {/* Scrolling container */}
            <div className="overflow-hidden flex-1 relative">
              <div
                className="flex items-center gap-8 whitespace-nowrap"
                style={{
                  animation: `marquee ${Math.max(news.length * 8, 30)}s linear infinite`,
                }}
              >
                {/* Duplicate items for seamless loop */}
                {[...news, ...news].map((item, idx) => (
                  <a
                    key={`${item.id}-${idx}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 flex-shrink-0 hover:text-red-400 transition-colors"
                  >
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 uppercase"
                    >
                      {item.source}
                    </span>
                    <span className="text-sm text-white/70">{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Inline marquee keyframes */}
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: "지금 뜨는 것들" - 2x2 Grid
          ═══════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <span className="text-2xl">🔥</span> 지금 뜨는 것들
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Card: HuggingFace Models ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor("huggingface")}20` }}
              >
                {(() => {
                  const Icon = CATEGORY_ICONS["huggingface"];
                  return Icon ? <Icon size={20} className="text-[#FFD21E]" /> : null;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">이번 주 뜨는 AI 모델</h3>
                <p className="text-xs text-white/40">Hugging Face</p>
              </div>
            </div>
            <div className="space-y-3">
              {hfModels.length > 0 ? (
                hfModels.map((model, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl ${
                      isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"
                    } transition-colors`}
                  >
                    <span className="text-lg font-bold text-white/20 mt-0.5 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{model.model_name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{model.author} &middot; {model.task || "general"}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-white/30">⬇ {formatNumber(model.downloads)}</span>
                        <span className="text-xs text-white/30">❤ {formatNumber(model.likes)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/30 text-center py-4">데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>

          {/* ── Card: Papers ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor("papers")}20` }}
              >
                {(() => {
                  const Icon = CATEGORY_ICONS["papers"];
                  return Icon ? <Icon size={20} className="text-blue-400" /> : null;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">이번 주 뜨는 논문</h3>
                <p className="text-xs text-white/40">AI Papers</p>
              </div>
            </div>
            <div className="space-y-3">
              {papers.length > 0 ? (
                papers.map((paper, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl ${
                      isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"
                    } transition-colors`}
                  >
                    <span className="text-lg font-bold text-white/20 mt-0.5 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white line-clamp-2">{paper.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">
                        {Array.isArray(paper.authors) ? paper.authors.slice(0, 3).join(", ") : ""}
                        {Array.isArray(paper.authors) && paper.authors.length > 3 ? " 외" : ""}
                      </p>
                      {paper.published_date && (
                        <span className="text-xs text-white/30">{timeAgo(paper.published_date)}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/30 text-center py-4">데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>

          {/* ── Card: GitHub ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor("github")}20` }}
              >
                {(() => {
                  const Icon = CATEGORY_ICONS["github"];
                  return Icon ? <Icon size={20} className="text-purple-400" /> : null;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">이번 주 뜨는 GitHub</h3>
                <p className="text-xs text-white/40">GitHub Trending</p>
              </div>
            </div>
            <div className="space-y-3">
              {githubProjects.length > 0 ? (
                githubProjects.map((repo, i) => (
                  <a
                    key={i}
                    href={`https://github.com/${repo.full_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-xl ${
                      isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"
                    } transition-colors block`}
                  >
                    <span className="text-lg font-bold text-white/20 mt-0.5 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{repo.full_name}</p>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{repo.description}</p>
                      <div className="flex gap-3 mt-1 items-center">
                        <span className="text-xs text-white/30">⭐ {formatNumber(repo.stars)}</span>
                        <span className="text-xs text-white/30">🍴 {formatNumber(repo.forks)}</span>
                        {repo.language && (
                          <span className="text-xs text-white/30">{repo.language}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-sm text-white/30 text-center py-4">데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>

          {/* ── Card: News ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getCategoryColor("news")}20` }}
              >
                {(() => {
                  const Icon = CATEGORY_ICONS["news"];
                  return Icon ? <Icon size={20} className="text-emerald-400" /> : null;
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">최신 AI 뉴스</h3>
                <p className="text-xs text-white/40">AI News</p>
              </div>
            </div>
            <div className="space-y-3">
              {news.length > 0 ? (
                news.slice(0, 3).map((item, i) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-xl ${
                      isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"
                    } transition-colors block`}
                  >
                    <span className="text-lg font-bold text-white/20 mt-0.5 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          {item.source}
                        </span>
                        {item.published_date && (
                          <span className="text-xs text-white/30">{timeAgo(item.published_date)}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-sm text-white/30 text-center py-4">데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: CATEGORY STATS GRID
          ═══════════════════════════════════════════════════════ */}
      {categoryStats.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            {(() => {
              const Icon = CATEGORY_ICONS["dashboard"];
              return Icon ? <Icon size={22} className="text-white/70" /> : null;
            })()}
            카테고리 현황
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {categoryStats.map((stat, i) => {
              const displayCategory = stat.category === "tools" ? "platforms" : stat.category;
              const color = getCategoryColor(displayCategory);
              const trendArrow = stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→";
              const trendColor =
                stat.trend === "up"
                  ? "text-green-400"
                  : stat.trend === "down"
                  ? "text-red-400"
                  : "text-white/40";
              const Icon = CATEGORY_ICONS[displayCategory];

              return (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.05, duration: 0.3 }}
                  className={`${
                    isLight
                      ? "bg-white/60 border-black/5 hover:bg-white/80"
                      : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                  } backdrop-blur-xl border rounded-xl p-4 transition-all duration-300 cursor-default`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {Icon ? (
                      <span style={{ color }}>
                        <Icon size={18} />
                      </span>
                    ) : (
                      <span className="text-lg" />
                    )}
                    <span className="text-xs font-medium text-white/60 truncate">
                      {stat.name}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-white">
                      {formatNumber(stat.total)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${trendColor}`}>
                        {trendArrow}
                      </span>
                      <span className="text-xs text-white/40">
                        {stat.recent_7d > 0 ? `+${stat.recent_7d}` : stat.recent_7d}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: TRENDING KEYWORDS (Tag Cloud)
          ═══════════════════════════════════════════════════════ */}
      {keywords.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <span className="text-2xl">🏷️</span> 트렌딩 키워드
          </h2>

          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => {
              // Scale font size based on count relative to max
              const maxCount = Math.max(...keywords.map((k) => k.count), 1);
              const ratio = kw.count / maxCount;
              const fontSize = 12 + ratio * 12; // 12px to 24px
              const opacity = 0.5 + ratio * 0.5; // 0.5 to 1.0

              return (
                <motion.span
                  key={kw.keyword}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.03, duration: 0.3 }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full border transition-all duration-200 cursor-default ${
                    isLight
                      ? "bg-white/60 border-black/10 hover:bg-white/80 text-gray-800"
                      : "bg-white/[0.06] border-white/10 hover:bg-white/[0.12] text-white"
                  }`}
                  style={{ fontSize: `${fontSize}px`, opacity }}
                >
                  {kw.keyword}
                  <span className="ml-1.5 text-[10px] text-white/30 font-mono">
                    {kw.count}
                  </span>
                </motion.span>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: UPCOMING CONFERENCES
          ═══════════════════════════════════════════════════════ */}
      {conferences.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            {(() => {
              const Icon = CATEGORY_ICONS["conferences"];
              return Icon ? <Icon size={22} className="text-white/70" /> : null;
            })()}
            다가오는 컨퍼런스
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {conferences.map((conf, i) => {
              const tierColor =
                conf.tier === "A*"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : conf.tier === "A"
                  ? "bg-gray-300/20 text-gray-300 border-gray-300/30"
                  : "bg-white/10 text-white/60 border-white/20";

              const formattedDate = conf.start_date
                ? new Date(conf.start_date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 + i * 0.1, duration: 0.4 }}
                  className={`${
                    isLight
                      ? "bg-white/60 border-black/5 hover:bg-white/80"
                      : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                  } backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex-1 mr-2">
                      {conf.conference_name}
                    </h3>
                    {conf.tier && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${tierColor}`}
                      >
                        {conf.tier}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {conf.location && (
                      <p className="text-xs text-white/50 flex items-center gap-1.5">
                        <span className="text-white/30">📍</span> {conf.location}
                      </p>
                    )}
                    {formattedDate && (
                      <p className="text-xs text-white/50 flex items-center gap-1.5">
                        <span className="text-white/30">📅</span> {formattedDate}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}
    </div>
  );
}
