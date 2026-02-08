"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import CategoryIcon from "@/components/icons/CategoryIcon";


type RoleKey =
  | "all"
  | "backend"
  | "frontend"
  | "ai_sw"
  | "data_scientist"
  | "vision"
  | "llm"
  | "robotics"
  | "on_premise"
  | "mlops"
  | "research";

interface JobItem {
  id: number;
  job_title: string;
  company_name?: string;
  location?: string;
  is_remote?: boolean;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  required_skills?: string[];
  keywords?: string[];
  role_category?: string;
  created_at: string;
  job_url?: string;
}

interface TrendingSkill {
  skill: string;
  count: number;
}

interface JobsResponse {
  total: number;
  items: JobItem[];
  page: number;
  page_size: number;
  total_pages: number;
  trending_skills?: TrendingSkill[];
}

const ROLE_TABS: Array<{ key: RoleKey; label: string }> = [
  { key: "all", label: "전체" },
  { key: "backend", label: "백엔드" },
  { key: "frontend", label: "프론트엔드" },
  { key: "ai_sw", label: "AI SW" },
  { key: "data_scientist", label: "데이터사이언티스트" },
  { key: "vision", label: "비전" },
  { key: "llm", label: "LLM" },
  { key: "robotics", label: "로봇공학" },
  { key: "on_premise", label: "온프레미스" },
  { key: "mlops", label: "MLOps" },
  { key: "research", label: "리서치" },
];

const ROLE_LABEL: Record<string, string> = {
  backend: "백엔드",
  frontend: "프론트엔드",
  ai_sw: "AI SW",
  data_scientist: "데이터사이언티스트",
  vision: "비전",
  llm: "LLM",
  robotics: "로봇공학",
  on_premise: "온프레미스",
  mlops: "MLOps",
  research: "리서치",
};

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "급여 협의";
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }
  return `$${(min || max || 0).toLocaleString()}+`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const diffDay = Math.floor(diff / 86400000);
  if (diffDay <= 0) return "오늘";
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;
  return `${Math.floor(diffDay / 30)}개월 전`;
}

function stripHtml(text?: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function JobsPage() {
  const category = CATEGORIES.find((c) => c.id === "jobs")!;
  const [activeRole, setActiveRole] = useState<RoleKey>("all");
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/v1/jobs/?page=${page}&page_size=30`
        );
        if (!res.ok) throw new Error("jobs fetch failed");
        const json: JobsResponse = await res.json();
        setJobs(json.items || []);
        setTrendingSkills((json.trending_skills || []).slice(0, 10));
        setTotalPages(json.total_pages || 1);
      } catch {
        setJobs([]);
        setTrendingSkills([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [page]);

  const filtered = useMemo(() => {
    if (activeRole === "all") return jobs;
    return jobs.filter((job) => (job.role_category || "").toLowerCase() === activeRole);
  }, [jobs, activeRole]);

  const maxSkillCount = Math.max(...trendingSkills.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <CategoryIcon iconKey={category.iconKey} size={34} />
          <div>
            <h1 className="text-2xl font-bold text-white">{category.koreanName}</h1>
            <p className="text-white/50 mt-1">직무별 AI 채용 동향과 핵심 스킬</p>
          </div>
        </div>
      </motion.div>

      <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/90 mb-3">트렌딩 스킬 TOP 10</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {trendingSkills.map((item) => (
            <div key={item.skill} className="flex items-center gap-2">
              <div className="w-28 text-xs text-white/70 truncate">{item.skill}</div>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-400/80"
                  style={{ width: `${(item.count / maxSkillCount) * 100}%` }}
                />
              </div>
              <div className="w-8 text-right text-xs text-white/60">{item.count}</div>
            </div>
          ))}
          {!trendingSkills.length && (
            <div className="text-xs text-white/50">트렌딩 스킬 집계 데이터가 없습니다.</div>
          )}
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-2 overflow-x-auto">
        <div className="flex min-w-max gap-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveRole(tab.key)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                activeRole === tab.key
                  ? "bg-cyan-500/30 border border-cyan-300/40 text-cyan-200"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white/50">
          해당 카테고리 채용 공고가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-base">
                    {job.job_url ? (
                      <a
                        href={job.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {job.job_title}
                      </a>
                    ) : (
                      job.job_title
                    )}
                  </h3>
                  <div className="mt-1 text-sm text-white/70">
                    <strong className="text-white/90">{job.company_name || "미공개"}</strong>
                    <span className="mx-2 text-white/30">·</span>
                    <span>{job.location || "Remote"}</span>
                    {job.is_remote ? (
                      <span className="ml-2 inline-flex rounded-full border border-emerald-300/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200">
                        Remote
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-white/60">{formatSalary(job.salary_min, job.salary_max)}</div>
                  <div className="mt-1 text-[11px] text-white/50">{timeAgo(job.created_at)}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-300/35 bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-200">
                  {ROLE_LABEL[job.role_category || ""] || "AI SW"}
                </span>
                {(job.required_skills || []).slice(0, 5).map((skill) => (
                  <span
                    key={`${job.id}-${skill}`}
                    className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {job.description && (
                <p className="mt-3 text-sm text-white/55 line-clamp-2">
                  {stripHtml(job.description)}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-40"
          >
            이전
          </button>
          <div className="text-sm text-white/70">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
