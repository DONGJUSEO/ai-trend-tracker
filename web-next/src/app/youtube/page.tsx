"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import type { YouTubeVideo } from "@/lib/types";
import GlassmorphicCard from "@/components/shared/GlassmorphicCard";
import CategoryIcon from "@/components/icons/CategoryIcon";

const category = CATEGORIES.find((c) => c.id === "youtube")!;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const headers = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

const KOREAN_CHANNELS = ["조코딩", "테디노트", "빵형의 개발도상국", "나도코딩", "노마드 코더", "안될공학", "잇섭", "코드팩토리", "생활코딩", "AI톡톡", "EO", "슈카월드", "딥다이브", "비전곰"];

type TabFilter = "all" | "korean" | "international";

const TABS: { id: TabFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "korean", label: "국내" },
  { id: "international", label: "해외" },
];

function isKoreanChannelName(channelName?: string): boolean {
  if (!channelName) return false;
  return KOREAN_CHANNELS.some((name) => channelName.includes(name));
}

function isKoreanVideo(video: YouTubeVideo): boolean {
  const lang = (video.channel_language || "").toLowerCase();
  if (lang.startsWith("ko")) return true;
  const channel = video.channel_name || video.channel_title || "";
  return isKoreanChannelName(channel);
}

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

function formatDuration(duration: string): string {
  // Handle ISO 8601 duration format (PT1H2M3S) or already formatted strings
  if (!duration) return "";
  if (duration.startsWith("PT")) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const h = match[1] ? `${match[1]}:` : "";
      const m = match[2] ? match[2].padStart(h ? 2 : 1, "0") : "0";
      const s = match[3] ? match[3].padStart(2, "0") : "00";
      return `${h}${m}:${s}`;
    }
  }
  return duration;
}

// ─── Loading Skeleton ───────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-white/10" />
          <div className="p-5">
            <div className="h-5 bg-white/10 rounded w-full mb-2" />
            <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
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
                ? "bg-red-500/20 border border-red-500/40 text-red-400 font-semibold"
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

// ─── Video Card ─────────────────────────────────────────────

function VideoCard({
  video,
  index,
}: {
  video: YouTubeVideo;
  index: number;
}) {
  const channelName = video.channel_name || video.channel_title || "Unknown Channel";
  const videoUrl = video.url || (video.video_id ? `https://www.youtube.com/watch?v=${video.video_id}` : "#");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <GlassmorphicCard className="overflow-hidden h-full">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-white/5 overflow-hidden">
            {video.thumbnail_url ? (
              <Image
                src={video.thumbnail_url}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}

            {/* Duration badge */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                {formatDuration(video.duration)}
              </span>
            )}

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-red-300 transition-colors">
              {video.title}
            </h3>

            {video.summary && (
              <p className="text-white/50 text-xs line-clamp-2 mb-2">
                {video.summary}
              </p>
            )}

            <p className="text-white/40 text-sm mb-3">{channelName}</p>

            <div className="flex items-center gap-3 text-xs text-white/40">
              {/* Views */}
              <div className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>조회수 {formatNumber(video.view_count)}</span>
              </div>

              {/* Likes */}
              <div className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span>{formatNumber(video.like_count)}</span>
              </div>

              {/* Published at */}
              <span className="ml-auto">
                {video.published_at ? timeAgo(video.published_at) : ""}
              </span>
            </div>
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
        <div className="text-5xl mb-4 opacity-50">📺</div>
        <h3 className="text-white/70 text-lg font-medium mb-2">
          데이터를 수집 중입니다...
        </h3>
        <p className="text-white/40 text-sm">
          YouTube AI 관련 영상 데이터가 곧 업데이트됩니다.
        </p>
      </div>
    </GlassmorphicCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function YouTubePage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const filteredVideos = useMemo(() => {
    if (activeTab === "all") return videos;
    if (activeTab === "korean") return videos.filter((v) => isKoreanVideo(v));
    return videos.filter((v) => !isKoreanVideo(v));
  }, [videos, activeTab]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/v1/youtube/videos?page=${page}&page_size=20`,
        { headers }
      );
      if (res.ok) {
        const json = await res.json();
        setVideos(json.videos || json.items || []);
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
    fetchVideos();
  }, [fetchVideos]);

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
                {category.name} - AI 관련 인기 영상
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
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 w-fit">
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
        ) : filteredVideos.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && videos.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
