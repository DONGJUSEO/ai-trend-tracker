"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import type { GitHubProject, PaginatedResponse } from "@/lib/types";
import GlassmorphicCard from "@/components/shared/GlassmorphicCard";
import CategoryIcon from "@/components/icons/CategoryIcon";

const category = CATEGORIES.find((c) => c.id === "github")!;


// ─── Helpers ────────────────────────────────────────────────

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

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

// GitHub language colors (common languages)
const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  R: "#198CE7",
  Shell: "#89e051",
  Lua: "#000080",
  Julia: "#a270ba",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Zig: "#ec915c",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Clojure: "#db5855",
  CUDA: "#3A4E3A",
};

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || "#8b8b8b";
}

// ─── Tab Filter ─────────────────────────────────────────────

type TabId = "all" | "llm-nlp" | "cv" | "mlops" | "ai-agents" | "etc";

interface TabDef {
  id: TabId;
  label: string;
  keywords: string[];
}

const TABS: TabDef[] = [
  { id: "all", label: "전체", keywords: [] },
  {
    id: "llm-nlp",
    label: "LLM/NLP",
    keywords: ["llm", "gpt", "bert", "transformer", "language", "nlp", "text", "chat", "rag"],
  },
  {
    id: "cv",
    label: "CV",
    keywords: ["vision", "image", "video", "detection", "segmentation", "diffusion", "stable"],
  },
  {
    id: "mlops",
    label: "MLOps",
    keywords: ["mlops", "deploy", "serving", "kubernetes", "docker", "pipeline", "monitoring", "infra"],
  },
  {
    id: "ai-agents",
    label: "AI Agents",
    keywords: ["agent", "autogen", "crew", "langchain", "langgraph", "tool-use", "function-call"],
  },
  { id: "etc", label: "기타", keywords: [] },
];

function matchesTab(project: GitHubProject, tab: TabDef): boolean {
  if (tab.id === "all") return true;

  const searchable = [
    project.name,
    project.full_name,
    project.description,
    ...(project.topics || []),
    ...(project.keywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return tab.keywords.some((kw) => searchable.includes(kw));
}

function matchesAnyCategory(project: GitHubProject): boolean {
  return TABS.filter((t) => t.keywords.length > 0).some((t) => matchesTab(project, t));
}

function filterProjects(projects: GitHubProject[], tabId: TabId): GitHubProject[] {
  if (tabId === "all") return projects;
  if (tabId === "etc") return projects.filter((p) => !matchesAnyCategory(p));
  const tab = TABS.find((t) => t.id === tabId)!;
  return projects.filter((p) => matchesTab(p, tab));
}

// ─── Loading Skeleton ───────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-4 bg-white/10 rounded w-full mb-2" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
            <div className="h-10 w-20 bg-white/10 rounded-lg ml-4" />
          </div>
          <div className="flex gap-4 mb-3">
            <div className="h-4 w-12 bg-white/10 rounded" />
            <div className="h-4 w-12 bg-white/10 rounded" />
            <div className="h-4 w-16 bg-white/10 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-14 bg-white/10 rounded-full" />
            <div className="h-6 w-18 bg-white/10 rounded-full" />
            <div className="h-6 w-12 bg-white/10 rounded-full" />
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
                ? "bg-violet-500/20 border border-violet-500/40 text-violet-400 font-semibold"
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

// ─── Project Card ───────────────────────────────────────────

function ProjectCard({
  project,
  index,
}: {
  project: GitHubProject;
  index: number;
}) {
  const primaryDescription =
    project.summary || project.description || "설명이 없습니다.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <GlassmorphicCard className="p-6 h-full">
          <div className="flex items-start gap-4">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 className="text-white font-semibold text-base mb-1 truncate group-hover:text-violet-300 transition-colors">
                {project.full_name || project.name}
              </h3>

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
                {primaryDescription}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm mb-4">
                {/* Language */}
                {project.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(project.language),
                      }}
                    />
                    <span className="text-white/60">{project.language}</span>
                  </div>
                )}

                {/* Stars */}
                <div className="flex items-center gap-1 text-white/50">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span>{formatNumber(project.stars)}</span>
                </div>

                {/* Forks */}
                <div className="flex items-center gap-1 text-white/50">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span>{formatNumber(project.forks)}</span>
                </div>

                {/* Updated */}
                {project.updated_at && (
                  <span className="text-white/30 text-xs ml-auto">
                    {timeAgo(project.updated_at)} 업데이트
                  </span>
                )}
              </div>

              {/* Topics */}
              {project.topics && project.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.topics.slice(0, 6).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-md text-xs bg-violet-500/10 text-violet-300/70 border border-violet-500/10"
                    >
                      {topic}
                    </span>
                  ))}
                  {project.topics.length > 6 && (
                    <span className="px-2 py-0.5 rounded-md text-xs text-white/25">
                      +{project.topics.length - 6}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Star count - prominent */}
            <div className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/15">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-yellow-400 font-bold text-sm">
                {formatNumber(project.stars)}
              </span>
            </div>
          </div>
        </GlassmorphicCard>
      </a>
    </motion.div>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState({ filtered = false }: { filtered?: boolean }) {
  return (
    <GlassmorphicCard className="p-12" hover={false}>
      <div className="text-center">
        <div className="text-5xl mb-4 opacity-50">{filtered ? "🔍" : "💻"}</div>
        <h3 className="text-white/70 text-lg font-medium mb-2">
          {filtered
            ? "해당 카테고리에 맞는 프로젝트가 없습니다."
            : "데이터를 수집 중입니다..."}
        </h3>
        <p className="text-white/40 text-sm">
          {filtered
            ? "다른 탭을 선택해 보세요."
            : "GitHub AI 프로젝트 데이터가 곧 업데이트됩니다."}
        </p>
      </div>
    </GlassmorphicCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function GitHubPage() {
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filteredProjects = useMemo(
    () => filterProjects(projects, activeTab),
    [projects, activeTab]
  );

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/github/projects?page=${page}&page_size=20`
      );
      if (res.ok) {
        const json = await res.json();
        setProjects(json.projects || json.items || []);
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
    fetchProjects();
  }, [fetchProjects]);

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
                {category.name} - 트렌딩 AI 프로젝트
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
            {!loading && activeTab === "all" && tab.id !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                {filterProjects(projects, tab.id).length}
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
        ) : filteredProjects.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState filtered={projects.length > 0} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && filteredProjects.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
