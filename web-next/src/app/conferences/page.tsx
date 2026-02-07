"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { AIConference } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const headers = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

const category = CATEGORIES.find((c) => c.id === "conferences")!;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  academic: { bg: "bg-blue-500/20", text: "text-blue-400" },
  industry: { bg: "bg-purple-500/20", text: "text-purple-400" },
  workshop: { bg: "bg-amber-500/20", text: "text-amber-400" },
  meetup: { bg: "bg-green-500/20", text: "text-green-400" },
};

const TYPE_LABELS: Record<string, string> = {
  academic: "학술",
  industry: "산업",
  workshop: "워크숍",
  meetup: "밋업",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse"
        >
          <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-full mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

function getCountdown(dateStr: string): string | null {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘 시작";
  if (diffDays === 1) return "내일 시작";
  if (diffDays < 7) return `${diffDays}일 후 시작`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 후 시작`;
  return `${diffDays}일 후 시작`;
}

function isUpcoming(conf: AIConference): boolean {
  const now = new Date();
  const start = new Date(conf.start_date);
  return start.getTime() > now.getTime();
}

function isOngoing(conf: AIConference): boolean {
  const now = new Date();
  const start = new Date(conf.start_date);
  const end = new Date(conf.end_date);
  return now >= start && now <= end;
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
                  ? "bg-blue-500/30 border border-blue-400/50 text-blue-300"
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

export default function ConferencesPage() {
  const [conferences, setConferences] = useState<AIConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/v1/conferences/?page=${page}&page_size=20`,
          { headers }
        );
        if (res.ok) {
          const json = await res.json();
          setConferences(json.items || []);
          setTotalPages(json.total_pages || 1);
        }
      } catch {
        // API unavailable
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const filteredConferences = useMemo(() => {
    if (filterType === "all") return conferences;
    return conferences.filter((c) => c.type === filterType);
  }, [conferences, filterType]);

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, AIConference[]> = {};
    filteredConferences.forEach((conf) => {
      const key = getMonthKey(conf.start_date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(conf);
    });
    // Sort by month key
    const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    return sorted;
  }, [filteredConferences]);

  const filterTabs = [
    { key: "all", label: "전체" },
    { key: "academic", label: "학술" },
    { key: "industry", label: "산업" },
    { key: "workshop", label: "워크숍" },
    { key: "meetup", label: "밋업" },
  ];

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
              AI 컨퍼런스 일정 및 이벤트
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterType === tab.key
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300"
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
      ) : filteredConferences.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-4">📅</div>
          <p className="text-white/50 text-lg">
            등록된 컨퍼런스가 없습니다
          </p>
          <p className="text-white/30 text-sm mt-2">
            데이터가 곧 업데이트됩니다
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filterType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {groupedByMonth.map(([monthKey, confs], groupIdx) => (
              <motion.div
                key={monthKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: groupIdx * 0.1 }}
              >
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <h2 className="text-lg font-bold text-white">
                    {getMonthLabel(monthKey)}
                  </h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-sm text-white/40">
                    {confs.length}개 이벤트
                  </span>
                </div>

                {/* Conference Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-6 border-l border-white/10 pl-6">
                  {confs.map((conf, idx) => {
                    const upcoming = isUpcoming(conf);
                    const ongoing = isOngoing(conf);
                    const countdown = getCountdown(conf.start_date);
                    const typeStyle = TYPE_COLORS[conf.type] || TYPE_COLORS.academic;

                    return (
                      <motion.div
                        key={conf.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-5 hover:bg-white/[0.08] transition-all group ${
                          ongoing
                            ? "border-green-400/30"
                            : upcoming
                            ? "border-amber-400/20"
                            : "border-white/10"
                        }`}
                      >
                        {/* Top Row: Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}
                          >
                            {TYPE_LABELS[conf.type] || conf.type}
                          </span>
                          {conf.is_virtual && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
                              온라인
                            </span>
                          )}
                          {ongoing && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 animate-pulse">
                              진행 중
                            </span>
                          )}
                          {upcoming && countdown && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                              {countdown}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-semibold text-base mb-2 group-hover:text-amber-300 transition-colors">
                          {conf.url ? (
                            <a
                              href={conf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {conf.name}
                            </a>
                          ) : (
                            conf.name
                          )}
                        </h3>

                        {/* Description */}
                        {conf.description && (
                          <p className="text-white/50 text-sm mb-3 line-clamp-2">
                            {conf.description}
                          </p>
                        )}

                        {/* Date & Location */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <svg
                              className="w-4 h-4 text-white/40"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {formatDate(conf.start_date)} ~ {formatDate(conf.end_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <svg
                              className="w-4 h-4 text-white/40"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{conf.location}</span>
                          </div>
                          {conf.submission_deadline && (
                            <div className="flex items-center gap-2 text-sm text-red-400/80">
                              <svg
                                className="w-4 h-4 text-red-400/60"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>
                                제출 마감: {formatDate(conf.submission_deadline)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Topics */}
                        {conf.topics && conf.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {conf.topics.map((topic, topicIdx) => (
                              <span
                                key={topicIdx}
                                className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-white/50"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
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
