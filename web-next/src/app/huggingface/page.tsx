"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import type { HuggingFaceModel, PaginatedResponse } from "@/lib/types";
import GlassmorphicCard from "@/components/shared/GlassmorphicCard";

const category = CATEGORIES.find((c) => c.id === "huggingface")!;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const headers = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

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
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base truncate">
                {model.name}
              </h3>
              <p className="text-white/40 text-sm mt-0.5">
                {model.author}
              </p>
            </div>
            {model.pipeline_tag && (
              <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-category-huggingface/15 text-category-huggingface border border-category-huggingface/20">
                {model.pipeline_tag}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
            {model.description || "설명이 없습니다."}
          </p>

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
            {model.last_modified && (
              <span className="text-white/40 text-xs ml-auto">
                {timeAgo(model.last_modified)}
              </span>
            )}
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/huggingface/?page=${page}&page_size=20`,
        { headers }
      );
      if (res.ok) {
        const json: PaginatedResponse<HuggingFaceModel> = await res.json();
        setModels(json.items || []);
        setTotalPages(json.total_pages || 1);
        setTotal(json.total || 0);
      }
    } catch {
      // API unavailable
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
            <span className="text-4xl">{category.icon}</span>
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
