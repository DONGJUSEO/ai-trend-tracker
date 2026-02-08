"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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

interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  published_date: string;
  summary: string;
}

interface HuggingFaceItem {
  model_id: string;
  model_name: string;
  author: string;
  downloads: number;
  likes: number;
  task: string;
  summary: string;
  url: string;
  last_modified: string;
}

interface PaperItem {
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  published_date: string;
  url: string;
  arxiv_id: string;
}

interface GitHubItem {
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
}

interface ConferenceItem {
  conference_name: string;
  location: string;
  start_date: string;
  end_date: string;
  tier: string;
  website_url: string;
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
  const [guideOpen, setGuideOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aibom-guide-collapsed") !== "true";
    }
    return true;
  });
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
        newsRes,
        hfRes,
        papersRes,
        githubRes,
        confRes,
      ] = await Promise.allSettled([
        fetch(`${API_URL}/api/v1/dashboard/summary`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/dashboard/trending-keywords?limit=20`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/news/news?page=1&page_size=10`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/huggingface/?page=1&page_size=10`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/papers/?page=1&page_size=10`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/github/projects?page=1&page_size=10`, { headers: HEADERS }),
        fetch(`${API_URL}/api/v1/conferences/?page=1&page_size=5&upcoming=true`, { headers: HEADERS }),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
        setSummary(await summaryRes.value.json());
      }
      if (keywordsRes.status === "fulfilled" && keywordsRes.value.ok) {
        const data = await keywordsRes.value.json();
        setKeywords(data.top_keywords ?? []);
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

  // ── Guide toggle handler ──
  const toggleGuide = () => {
    const next = !guideOpen;
    setGuideOpen(next);
    localStorage.setItem("aibom-guide-collapsed", next ? "false" : "true");
  };

  // ════════════════════════════════════════════════════════════
  // RENDERED DASHBOARD
  // ════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════
          SECTION 0: APP GUIDE (collapsible)
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {guideOpen ? (
          <motion.section
            key="guide"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`relative ${isLight ? "bg-white/70 border-black/5" : "bg-white/5 border-white/10"} backdrop-blur-xl border rounded-2xl p-6`}>
              <button
                onClick={toggleGuide}
                className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isLight ? "hover:bg-black/5 text-gray-400" : "hover:bg-white/10 text-white/40"}`}
                aria-label="가이드 닫기"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className={`text-lg font-bold mb-3 ${isLight ? "text-gray-900" : "text-white"}`}>
                {APP_NAME}에 오신 것을 환영합니다!
              </h3>

              <div className={`space-y-3 text-sm ${isLight ? "text-gray-600" : "text-white/60"}`}>
                <p>{APP_NAME}은 AI 업계의 최신 트렌드를 한 화면에서 파악할 수 있는 올인원 큐레이션 서비스입니다.</p>

                <div>
                  <p className="font-semibold mb-1">9개 카테고리 실시간 추적</p>
                  <p className="text-xs leading-relaxed">HuggingFace 트렌딩 모델 · YouTube AI 채널 · 최신 AI 논문 · AI 뉴스 (국내/해외) · GitHub 트렌딩 · 컨퍼런스 일정 · AI 플랫폼 · AI 채용 · AI 정책</p>
                </div>

                <div>
                  <p className="font-semibold mb-1">사용 방법</p>
                  <ol className="text-xs space-y-0.5 list-decimal list-inside">
                    <li>좌측 사이드바에서 관심 카테고리를 선택하세요</li>
                    <li>상단 검색바로 키워드를 검색하세요 (전체 카테고리 통합 검색)</li>
                    <li>각 카테고리의 탭 필터로 세부 분류를 확인하세요</li>
                  </ol>
                </div>

                <p className="text-xs opacity-70">
                  데이터 수집 주기: 뉴스 1시간 | 유튜브 4시간 | 허깅페이스/깃헙 6시간 | 논문 12시간 | 컨퍼런스/정책 매일 | 플랫폼 매주
                </p>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.button
            key="guide-toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleGuide}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
              isLight
                ? "bg-white/60 border border-black/5 text-gray-500 hover:bg-white/80"
                : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {APP_NAME} 가이드 보기
          </motion.button>
        )}
      </AnimatePresence>

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
            <p className={`text-lg font-medium ${isLight ? "text-gray-500" : "text-white/60"}`}>
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
                <div className={`text-sm mt-1 ${isLight ? "text-gray-500" : "text-white/50"}`}>{stat.label}</div>
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
          SECTION 3: "지금 뜨는 것들" - 2x2 Grid (Top 10, scrollable)
          ═══════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <h2 className={`text-xl font-bold mb-5 flex items-center gap-2 ${isLight ? "text-gray-900" : "text-white"}`}>
          <span className="text-2xl">🔥</span> 지금 뜨는 것들
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Card: HuggingFace Models ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={`${isLight ? "bg-white/70 border-black/5" : "bg-white/5 border-white/10"} backdrop-blur-xl border rounded-2xl p-6 group hover:border-white/20 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor("huggingface")}20` }}>
                  {(() => { const Icon = CATEGORY_ICONS["huggingface"]; return Icon ? <Icon size={20} className="text-[#FFD21E]" /> : null; })()}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isLight ? "text-gray-900" : "text-white"}`}>이번 주 뜨는 AI 모델</h3>
                  <p className={`text-xs ${isLight ? "text-gray-400" : "text-white/40"}`}>Hugging Face Top 10</p>
                </div>
              </div>
              <Link href="/huggingface" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">전체 보기 →</Link>
            </div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {hfModels.length > 0 ? (
                hfModels.map((model, i) => (
                  <a
                    key={i}
                    href={model.url || `https://huggingface.co/${model.model_id || model.model_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-xl ${isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"} transition-colors`}
                  >
                    <span className={`text-lg font-bold mt-0.5 w-5 text-right flex-shrink-0 ${isLight ? "text-gray-300" : "text-white/20"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isLight ? "text-gray-900" : "text-white"}`}>{model.model_name}</p>
                      <p className={`text-xs mt-0.5 ${isLight ? "text-gray-400" : "text-white/40"}`}>{model.author} · {model.task || "general"}</p>
                      <div className="flex gap-3 mt-1">
                        <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>⬇ {formatNumber(model.downloads)}</span>
                        <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>❤ {formatNumber(model.likes)}</span>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className={`text-sm text-center py-4 ${isLight ? "text-gray-400" : "text-white/30"}`}>데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>

          {/* ── Card: Papers ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className={`${isLight ? "bg-white/70 border-black/5" : "bg-white/5 border-white/10"} backdrop-blur-xl border rounded-2xl p-6 group hover:border-white/20 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor("papers")}20` }}>
                  {(() => { const Icon = CATEGORY_ICONS["papers"]; return Icon ? <Icon size={20} className="text-blue-400" /> : null; })()}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isLight ? "text-gray-900" : "text-white"}`}>이번 주 뜨는 논문</h3>
                  <p className={`text-xs ${isLight ? "text-gray-400" : "text-white/40"}`}>AI Papers Top 10</p>
                </div>
              </div>
              <Link href="/papers" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">전체 보기 →</Link>
            </div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {papers.length > 0 ? (
                papers.map((paper, i) => (
                  <a
                    key={i}
                    href={paper.url || (paper.arxiv_id ? `https://arxiv.org/abs/${paper.arxiv_id}` : "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-xl ${isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"} transition-colors`}
                  >
                    <span className={`text-lg font-bold mt-0.5 w-5 text-right flex-shrink-0 ${isLight ? "text-gray-300" : "text-white/20"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium line-clamp-2 ${isLight ? "text-gray-900" : "text-white"}`}>{paper.title}</p>
                      <p className={`text-xs mt-0.5 truncate ${isLight ? "text-gray-400" : "text-white/40"}`}>
                        {Array.isArray(paper.authors) ? paper.authors.slice(0, 3).join(", ") : ""}
                        {Array.isArray(paper.authors) && paper.authors.length > 3 ? " 외" : ""}
                      </p>
                      {paper.published_date && (
                        <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>{timeAgo(paper.published_date)}</span>
                      )}
                    </div>
                  </a>
                ))
              ) : (
                <p className={`text-sm text-center py-4 ${isLight ? "text-gray-400" : "text-white/30"}`}>데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>

          {/* ── Card: GitHub ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className={`${isLight ? "bg-white/70 border-black/5" : "bg-white/5 border-white/10"} backdrop-blur-xl border rounded-2xl p-6 group hover:border-white/20 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor("github")}20` }}>
                  {(() => { const Icon = CATEGORY_ICONS["github"]; return Icon ? <Icon size={20} className="text-purple-400" /> : null; })()}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isLight ? "text-gray-900" : "text-white"}`}>이번 주 뜨는 GitHub</h3>
                  <p className={`text-xs ${isLight ? "text-gray-400" : "text-white/40"}`}>GitHub Trending Top 10</p>
                </div>
              </div>
              <Link href="/github" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">전체 보기 →</Link>
            </div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {githubProjects.length > 0 ? (
                githubProjects.map((repo, i) => (
                  <a
                    key={i}
                    href={repo.url || `https://github.com/${repo.full_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-xl ${isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"} transition-colors`}
                  >
                    <span className={`text-lg font-bold mt-0.5 w-5 text-right flex-shrink-0 ${isLight ? "text-gray-300" : "text-white/20"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isLight ? "text-gray-900" : "text-white"}`}>{repo.full_name}</p>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isLight ? "text-gray-400" : "text-white/40"}`}>{repo.description}</p>
                      <div className="flex gap-3 mt-1 items-center">
                        <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>⭐ {formatNumber(repo.stars)}</span>
                        <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>🍴 {formatNumber(repo.forks)}</span>
                        {repo.language && <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>{repo.language}</span>}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className={`text-sm text-center py-4 ${isLight ? "text-gray-400" : "text-white/30"}`}>데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>

          {/* ── Card: News ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className={`${isLight ? "bg-white/70 border-black/5" : "bg-white/5 border-white/10"} backdrop-blur-xl border rounded-2xl p-6 group hover:border-white/20 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getCategoryColor("news")}20` }}>
                  {(() => { const Icon = CATEGORY_ICONS["news"]; return Icon ? <Icon size={20} className="text-emerald-400" /> : null; })()}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isLight ? "text-gray-900" : "text-white"}`}>최신 AI 뉴스</h3>
                  <p className={`text-xs ${isLight ? "text-gray-400" : "text-white/40"}`}>AI News Top 10</p>
                </div>
              </div>
              <Link href="/news" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">전체 보기 →</Link>
            </div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {news.length > 0 ? (
                news.map((item, i) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-xl ${isLight ? "hover:bg-black/[0.03]" : "hover:bg-white/[0.05]"} transition-colors`}
                  >
                    <span className={`text-lg font-bold mt-0.5 w-5 text-right flex-shrink-0 ${isLight ? "text-gray-300" : "text-white/20"}`}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium line-clamp-2 ${isLight ? "text-gray-900" : "text-white"}`}>{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{item.source}</span>
                        {item.published_date && (
                          <span className={`text-xs ${isLight ? "text-gray-400" : "text-white/30"}`}>{timeAgo(item.published_date)}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className={`text-sm text-center py-4 ${isLight ? "text-gray-400" : "text-white/30"}`}>데이터를 불러오는 중...</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

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
