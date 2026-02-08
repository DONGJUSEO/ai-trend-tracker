"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { apiFetcher } from "@/lib/fetcher";
import { timeAgo } from "@/lib/format";
import type { AIPaper } from "@/lib/types";
import GlassmorphicCard from "@/components/shared/GlassmorphicCard";
import CategoryIcon from "@/components/icons/CategoryIcon";
import ErrorState from "@/components/ui/ErrorState";

const category = CATEGORIES.find((c) => c.id === "papers")!;


// ─── Helpers ────────────────────────────────────────────────

function formatAuthors(authors: string[]): string {
  if (!authors || authors.length === 0) return "저자 미상";
  if (authors.length <= 3) return authors.join(", ");
  return `${authors.slice(0, 3).join(", ")} 외 ${authors.length - 3}명`;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

// Assign a consistent color to each keyword based on its hash
const KEYWORD_COLORS = [
  "bg-blue-500/15 text-blue-300 border-blue-500/20",
  "bg-purple-500/15 text-purple-300 border-purple-500/20",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  "bg-amber-500/15 text-amber-300 border-amber-500/20",
  "bg-rose-500/15 text-rose-300 border-rose-500/20",
  "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  "bg-teal-500/15 text-teal-300 border-teal-500/20",
];

function getKeywordColor(keyword: string): string {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
  }
  return KEYWORD_COLORS[Math.abs(hash) % KEYWORD_COLORS.length];
}

// ─── Source badge color map ─────────────────────────────────

function getSourceStyle(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("arxiv")) return "bg-red-500/15 text-red-300 border-red-500/20";
  if (s.includes("semantic")) return "bg-blue-500/15 text-blue-300 border-blue-500/20";
  if (s.includes("pubmed")) return "bg-green-500/15 text-green-300 border-green-500/20";
  if (s.includes("acl") || s.includes("neurips") || s.includes("icml"))
    return "bg-purple-500/15 text-purple-300 border-purple-500/20";
  return "bg-white/10 text-white/60 border-white/10";
}

// ─── Tab Filter ─────────────────────────────────────────────

type TabId = "all" | "nlp" | "cv" | "ml" | "rl" | "multimodal";

interface TabDef {
  id: TabId;
  label: string;
  keywords: string[];
}

const TABS: TabDef[] = [
  { id: "all", label: "전체", keywords: [] },
  {
    id: "nlp",
    label: "NLP",
    keywords: ["nlp", "language", "text", "translation", "gpt", "llm", "transformer", "bert"],
  },
  {
    id: "cv",
    label: "CV",
    keywords: ["vision", "image", "video", "detection", "segmentation", "yolo"],
  },
  {
    id: "ml",
    label: "ML",
    keywords: ["learning", "optimization", "neural", "training", "architecture"],
  },
  {
    id: "rl",
    label: "강화학습",
    keywords: ["reinforcement", "rl", "reward", "policy", "agent"],
  },
  {
    id: "multimodal",
    label: "멀티모달",
    keywords: ["multimodal", "vision-language", "vlm", "cross-modal"],
  },
];

function matchesTab(paper: AIPaper, tab: TabDef): boolean {
  if (tab.id === "all") return true;

  const topic = (paper.topic || "").toLowerCase();
  const topicByTab: Record<Exclude<TabId, "all">, string[]> = {
    nlp: ["nlp", "language"],
    cv: ["cv", "vision"],
    ml: ["ml", "machine"],
    rl: ["강화학습", "reinforcement"],
    multimodal: ["멀티모달", "multimodal"],
  };
  if (topic && topicByTab[tab.id].some((t) => topic.includes(t))) {
    return true;
  }

  const paperKeywords = [
    ...(paper.keywords || []),
    ...(paper.categories || []),
  ].map((k) => k.toLowerCase());

  const paperText = `${paper.title} ${paper.abstract}`.toLowerCase();

  return tab.keywords.some(
    (tk) =>
      paperKeywords.some((pk) => pk.includes(tk)) || paperText.includes(tk)
  );
}

// ─── Loading Skeleton ───────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="h-6 bg-white/10 rounded w-3/4" />
            <div className="h-5 w-16 bg-white/10 rounded-full ml-3" />
          </div>
          <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-full mb-2" />
          <div className="h-4 bg-white/10 rounded w-full mb-2" />
          <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-white/10 rounded-full" />
            <div className="h-6 w-20 bg-white/10 rounded-full" />
            <div className="h-6 w-14 bg-white/10 rounded-full" />
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
                ? "bg-blue-500/20 border border-blue-500/40 text-blue-400 font-semibold"
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

// ─── Paper Card ─────────────────────────────────────────────

function PaperCard({
  paper,
  index,
}: {
  paper: AIPaper;
  index: number;
}) {
  const linkUrl = paper.pdf_url || paper.url;
  const primarySummary = paper.summary || paper.abstract || "설명이 없습니다.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <GlassmorphicCard className="p-6">
        <div className="flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0"
            >
              <h3 className="text-white font-semibold text-base leading-snug hover:text-blue-300 transition-colors">
                {paper.title}
              </h3>
            </a>
            <div className="flex items-center gap-2 shrink-0">
              {paper.source && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSourceStyle(
                    paper.source
                  )}`}
                >
                  {paper.source}
                </span>
              )}
              {paper.pdf_url && (
                <a
                  href={paper.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500/25 transition-colors"
                >
                  PDF
                </a>
              )}
            </div>
          </div>

          {/* AI Korean Summary (fallback: abstract) */}
          <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
            {primarySummary}
          </p>

          {/* Date badge + Conference badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {paper.published_date && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {new Date(paper.published_date).toLocaleDateString("ko-KR")} ({timeAgo(paper.published_date)})
              </span>
            )}
            {paper.conference_name && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">
                {paper.conference_name}{paper.conference_year ? ` ${paper.conference_year}` : ""}
              </span>
            )}
          </div>

          {/* Authors & citations */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/50">
              {formatAuthors(paper.authors)}
            </span>
            {paper.citations !== undefined && paper.citations > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="text-white/40">
                  인용 {paper.citations.toLocaleString()}회
                </span>
              </>
            )}
          </div>

          {/* Abstract */}
          {paper.summary && paper.abstract && (
            <p className="text-white/45 text-sm leading-relaxed">
              {truncateText(paper.abstract, 200)}
            </p>
          )}

          {/* Categories & Keywords */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {paper.categories &&
              paper.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/50 border border-white/5"
                >
                  {cat}
                </span>
              ))}
            {paper.keywords &&
              paper.keywords.slice(0, 6).map((kw) => (
                <span
                  key={kw}
                  className={`px-2 py-0.5 rounded-md text-xs border ${getKeywordColor(
                    kw
                  )}`}
                >
                  {kw}
                </span>
              ))}
            {paper.keywords && paper.keywords.length > 6 && (
              <span className="px-2 py-0.5 rounded-md text-xs text-white/30">
                +{paper.keywords.length - 6}
              </span>
            )}
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState() {
  return (
    <GlassmorphicCard className="p-12" hover={false}>
      <div className="text-center">
        <div className="text-5xl mb-4 opacity-50">📄</div>
        <h3 className="text-white/70 text-lg font-medium mb-2">
          데이터를 수집 중입니다...
        </h3>
        <p className="text-white/40 text-sm">
          AI 논문 데이터가 곧 업데이트됩니다.
        </p>
      </div>
    </GlassmorphicCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function PapersPage() {
  const [papers, setPapers] = useState<AIPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filteredPapers = useMemo(() => {
    if (activeTab === "all") return papers;
    const tab = TABS.find((t) => t.id === activeTab)!;
    return papers.filter((paper) => matchesTab(paper, tab));
  }, [papers, activeTab]);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const json = await apiFetcher<{
        papers?: AIPaper[];
        items?: AIPaper[];
        total?: number;
        total_pages?: number;
      }>(
        `/api/v1/papers/?page=${page}&page_size=20`
      );
      setPapers(json.papers || json.items || []);
      setTotalPages(json.total_pages || Math.ceil((json.total || 0) / 20));
      setTotal(json.total || 0);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

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
                {category.name} - 최신 AI 연구 논문
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

      {/* Tab Filters */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {tab.label}
            {!loading && activeTab !== tab.id && tab.id !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                {papers.filter((p) => matchesTab(p, tab)).length}
              </span>
            )}
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
        ) : fetchError && papers.length === 0 ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorState onRetry={fetchPapers} />
          </motion.div>
        ) : filteredPapers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {activeTab !== "all" && papers.length > 0 ? (
              <GlassmorphicCard className="p-12" hover={false}>
                <div className="text-center">
                  <div className="text-5xl mb-4 opacity-50">🔍</div>
                  <h3 className="text-white/70 text-lg font-medium mb-2">
                    해당 분야의 논문이 없습니다
                  </h3>
                  <p className="text-white/40 text-sm">
                    다른 탭을 선택하거나 전체 목록을 확인하세요.
                  </p>
                </div>
              </GlassmorphicCard>
            ) : (
              <EmptyState />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`content-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-4">
              {filteredPapers.map((paper, index) => (
                <PaperCard key={paper.id} paper={paper} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && filteredPapers.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
