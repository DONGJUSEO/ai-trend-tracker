"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { AIJob } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";
const headers = { "X-API-Key": API_KEY, "Content-Type": "application/json" };

const category = CATEGORIES.find((c) => c.id === "jobs")!;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "full-time": { bg: "bg-green-500/20", text: "text-green-400" },
  "part-time": { bg: "bg-blue-500/20", text: "text-blue-400" },
  contract: { bg: "bg-amber-500/20", text: "text-amber-400" },
  internship: { bg: "bg-purple-500/20", text: "text-purple-400" },
  remote: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
};

const TYPE_LABELS: Record<string, string> = {
  "full-time": "정규직",
  "part-time": "파트타임",
  contract: "계약직",
  internship: "인턴십",
  remote: "원격",
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  junior: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  mid: { bg: "bg-blue-500/20", text: "text-blue-400" },
  senior: { bg: "bg-orange-500/20", text: "text-orange-400" },
  lead: { bg: "bg-red-500/20", text: "text-red-400" },
};

const LEVEL_LABELS: Record<string, string> = {
  junior: "주니어",
  mid: "미들",
  senior: "시니어",
  lead: "리드",
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
                  ? "bg-cyan-500/30 border border-cyan-400/50 text-cyan-300"
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/v1/jobs/?page=${page}&page_size=20`,
          { headers }
        );
        if (res.ok) {
          const json = await res.json();
          setJobs(json.items || []);
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
              AI 분야 채용 정보
            </p>
          </div>
          {!loading && (
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-cyan-400">
                {jobs.length}
              </div>
              <div className="text-xs text-white/40">채용 공고</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-4">📋</div>
          <p className="text-white/50 text-lg">
            등록된 채용 공고가 없습니다
          </p>
          <p className="text-white/30 text-sm mt-2">
            데이터가 곧 업데이트됩니다
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {jobs.map((job, idx) => {
              const typeStyle = TYPE_COLORS[job.type] || TYPE_COLORS["full-time"];
              const levelStyle =
                LEVEL_COLORS[job.experience_level] || LEVEL_COLORS.mid;

              return (
                <motion.div
                  key={job.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Main Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title Row */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-base group-hover:text-cyan-300 transition-colors">
                            {job.url ? (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {job.title}
                              </a>
                            ) : (
                              job.title
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-white/60 text-sm font-medium">
                              {job.company}
                            </span>
                            <span className="text-white/20">|</span>
                            <div className="flex items-center gap-1.5 text-sm text-white/50">
                              <svg
                                className="w-3.5 h-3.5 text-white/30"
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
                              {job.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}
                        >
                          {TYPE_LABELS[job.type] || job.type}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${levelStyle.bg} ${levelStyle.text}`}
                        >
                          {LEVEL_LABELS[job.experience_level] ||
                            job.experience_level}
                        </span>
                        {job.salary_range && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                            {job.salary_range}
                          </span>
                        )}
                        {job.posted_at && (
                          <span className="text-xs text-white/30">
                            {timeAgo(job.posted_at)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {job.description && (
                        <p className="text-white/50 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {/* Requirements (first 3) */}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-white/30 mb-1.5 font-medium">
                            요구사항
                          </p>
                          <ul className="space-y-1">
                            {job.requirements.slice(0, 3).map((req, rIdx) => (
                              <li
                                key={rIdx}
                                className="text-sm text-white/50 flex items-start gap-2"
                              >
                                <span className="text-cyan-400/60 mt-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                                <span className="line-clamp-1">{req}</span>
                              </li>
                            ))}
                            {job.requirements.length > 3 && (
                              <li className="text-xs text-white/30 ml-5">
                                +{job.requirements.length - 3}개 더
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Skills Tags */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/80"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Apply Link */}
                    {job.url && (
                      <div className="lg:flex-shrink-0 lg:self-center">
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-500/25 hover:border-cyan-400/50 transition-all"
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
                          지원하기
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
}
