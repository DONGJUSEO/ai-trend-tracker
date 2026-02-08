"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { apiFetcher } from "@/lib/fetcher";
import { formatNumber, timeAgo } from "@/lib/format";
import type { HuggingFaceModel } from "@/lib/types";
import GlassmorphicCard from "@/components/shared/GlassmorphicCard";
import CategoryIcon from "@/components/icons/CategoryIcon";
import ErrorState from "@/components/ui/ErrorState";

const category = CATEGORIES.find((c) => c.id === "huggingface")!;


// ─── Pipeline Tag Color ─────────────────────────────────────

const TASK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // NLP — blue
  "text-generation": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  "text-classification": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  "fill-mask": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  "translation": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  "question-answering": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  "summarization": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  "feature-extraction": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  // CV — green
  "text-to-image": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  "image-classification": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  "object-detection": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  "image-segmentation": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
  // Audio — purple
  "speech-to-text": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/25" },
  "text-to-speech": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/25" },
  "audio-classification": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/25" },
  // Video — orange
  "text-to-video": { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/25" },
};

const DEFAULT_TASK_COLOR = { bg: "bg-category-huggingface/15", text: "text-category-huggingface", border: "border-category-huggingface/20" };

function getTaskColor(task?: string) {
  if (!task) return DEFAULT_TASK_COLOR;
  return TASK_COLORS[task] || DEFAULT_TASK_COLOR;
}

// ─── Helpers ────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
            </div>
            <div className="h-6 w-20 bg-white/10 rounded-full" />
          </div>
          <div className="h-4 bg-white/10 rounded w-full mb-2" />
          <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
          <div className="flex gap-4 mb-3">
            <div className="h-4 w-16 bg-white/10 rounded" />
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
                ? "bg-category-huggingface/20 border border-category-huggingface/40 text-category-huggingface font-semibold"
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

// ─── Model Card ─────────────────────────────────────────────

function ModelCard({
  model,
  index,
}: {
  model: HuggingFaceModel;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <a
        href={model.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <GlassmorphicCard className="p-6 h-full">
          {/* Date badge - top right */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(model.task || model.pipeline_tag) && (() => {
                const taskKey = model.task || model.pipeline_tag || "";
                const color = getTaskColor(taskKey);
                return (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}>
                    {model.task_ko || taskKey}
                  </span>
                );
              })()}
            </div>
            {(() => {
              const dateStr = model.created_at || model.last_modified || model.collected_at;
              return (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {dateStr
                    ? `${formatDate(dateStr)} (${timeAgo(dateStr)})`
                    : "날짜 정보 없음"}
                </span>
              );
            })()}
          </div>

          {/* Header */}
          <div className="mb-3">
            <h3 className="text-white font-semibold text-base truncate">
              {model.model_name || model.name}
            </h3>
            <p className="text-white/40 text-sm mt-0.5">
              {model.author}
            </p>
          </div>

          {/* Description - prefer AI summary over raw description */}
          {(model.summary || model.description) && (
            <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
              {model.summary || model.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-white/60">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{formatNumber(model.downloads)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{formatNumber(model.likes)}</span>
            </div>
          </div>

          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {model.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/50 border border-white/5"
                >
                  {tag}
                </span>
              ))}
              {model.tags.length > 5 && (
                <span className="px-2 py-0.5 rounded-md text-xs text-white/30">
                  +{model.tags.length - 5}
                </span>
              )}
            </div>
          )}
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
        <div className="text-5xl mb-4 opacity-50">🤗</div>
        <h3 className="text-white/70 text-lg font-medium mb-2">
          데이터를 수집 중입니다...
        </h3>
        <p className="text-white/40 text-sm">
          Hugging Face 모델 데이터가 곧 업데이트됩니다.
        </p>
      </div>
    </GlassmorphicCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function HuggingFacePage() {
  const [models, setModels] = useState<HuggingFaceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const json = await apiFetcher<{
        items?: HuggingFaceModel[];
        total?: number;
        total_pages?: number;
      }>(
        `/api/v1/huggingface/?page=${page}&page_size=20`
      );
      setModels(json.items || []);
      setTotalPages(json.total_pages || Math.ceil((json.total || 0) / 20));
      setTotal(json.total || 0);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

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
                {category.name} - 트렌딩 모델 및 데이터셋
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
        ) : fetchError && models.length === 0 ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorState onRetry={fetchModels} />
          </motion.div>
        ) : models.length === 0 ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {models.map((model, index) => (
                <ModelCard key={model.id} model={model} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && models.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
