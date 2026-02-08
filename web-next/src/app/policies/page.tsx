"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { apiFetcher } from "@/lib/fetcher";
import { timeAgo } from "@/lib/format";
import { AIPolicy } from "@/lib/types";
import CategoryIcon from "@/components/icons/CategoryIcon";
import ErrorState from "@/components/ui/ErrorState";


const category = CATEGORIES.find((c) => c.id === "policies")!;

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  enacted: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    label: "시행 중",
  },
  proposed: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "제안됨",
  },
  under_review: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "검토 중",
  },
  withdrawn: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    label: "철회됨",
  },
};

// Country/region tab definitions
type RegionTab = "전체" | "한국" | "미국" | "EU" | "중국" | "기타";

const REGION_TABS: RegionTab[] = ["전체", "한국", "미국", "EU", "중국", "기타"];

const REGION_KEYWORDS: Record<Exclude<RegionTab, "전체" | "기타">, string[]> = {
  한국: ["korea", "한국", "과기정통부", "개인정보보호", "기본법", "msit", "kisa"],
  미국: ["us", "united states", "america", "white house", "nist", "ftc", "congress"],
  EU: ["eu", "european", "europe", "gdpr", "ai act", "brussels"],
  중국: ["china", "chinese", "中国", "beijing"],
};

function matchesRegion(policy: AIPolicy, region: Exclude<RegionTab, "전체" | "기타">): boolean {
  const keywords = REGION_KEYWORDS[region];
  const fields = [
    policy.country,
    policy.description,
    policy.source,
    policy.title,
    policy.organization,
    policy.category,
  ]
    .filter(Boolean)
    .map((f) => f!.toLowerCase());

  return keywords.some((kw) =>
    fields.some((f) => f.includes(kw.toLowerCase()))
  );
}

function getPolicyRegion(policy: AIPolicy): RegionTab {
  const regionKeys: Exclude<RegionTab, "전체" | "기타">[] = ["한국", "미국", "EU", "중국"];
  for (const region of regionKeys) {
    if (matchesRegion(policy, region)) return region;
  }
  return "기타";
}

// Country flag mapping (common countries)
const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  USA: "🇺🇸",
  US: "🇺🇸",
  "South Korea": "🇰🇷",
  Korea: "🇰🇷",
  "Republic of Korea": "🇰🇷",
  China: "🇨🇳",
  Japan: "🇯🇵",
  "United Kingdom": "🇬🇧",
  UK: "🇬🇧",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  India: "🇮🇳",
  Brazil: "🇧🇷",
  "European Union": "🇪🇺",
  EU: "🇪🇺",
  Singapore: "🇸🇬",
  Israel: "🇮🇱",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Taiwan: "🇹🇼",
  "New Zealand": "🇳🇿",
  Norway: "🇳🇴",
  Finland: "🇫🇮",
  Denmark: "🇩🇰",
  Belgium: "🇧🇪",
  Austria: "🇦🇹",
  Ireland: "🇮🇪",
  Mexico: "🇲🇽",
  Indonesia: "🇮🇩",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Philippines: "🇵🇭",
  Malaysia: "🇲🇾",
  UAE: "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  Russia: "🇷🇺",
  Poland: "🇵🇱",
  Portugal: "🇵🇹",
  "Czech Republic": "🇨🇿",
  Romania: "🇷🇴",
  Hungary: "🇭🇺",
  Greece: "🇬🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  "South Africa": "🇿🇦",
  Nigeria: "🇳🇬",
  Kenya: "🇰🇪",
  Egypt: "🇪🇬",
  Turkey: "🇹🇷",
  Pakistan: "🇵🇰",
  Bangladesh: "🇧🇩",
  Global: "🌍",
  International: "🌐",
};

function getCountryFlag(country?: string): string {
  if (!country) return "🏳️";
  return (
    COUNTRY_FLAGS[country] ||
    // Try partial match
    Object.entries(COUNTRY_FLAGS).find(([key]) =>
      country.toLowerCase().includes(key.toLowerCase())
    )?.[1] ||
    "🏳️"
  );
}

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function stripHtml(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTimelineDate(policy: AIPolicy): Date | null {
  const value = policy.effective_date || policy.published_at;
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
                  ? "bg-indigo-500/30 border border-indigo-400/50 text-indigo-300"
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

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<AIPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeRegion, setActiveRegion] = useState<RegionTab>("전체");

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const json = await apiFetcher<{
        items?: AIPolicy[];
        total?: number;
        total_pages?: number;
      }>(
        `/api/v1/policies/?page=${page}&page_size=20`
      );
      setPolicies(json.items || []);
      setTotalPages(json.total_pages || Math.ceil((json.total || 0) / 20));
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const filteredPolicies = useMemo(() => {
    if (activeRegion === "전체") return policies;

    return policies.filter((policy) => {
      const policyRegion = getPolicyRegion(policy);

      if (activeRegion === "기타") {
        return policyRegion === "기타";
      }

      return policyRegion === activeRegion;
    });
  }, [policies, activeRegion]);

  const timelineItems = useMemo(() => {
    return filteredPolicies
      .map((policy) => {
        const date = getTimelineDate(policy);
        return {
          id: policy.id,
          title: policy.title,
          status: policy.status || "proposed",
          date,
          raw: policy,
        };
      })
      .filter((item) => item.date !== null)
      .sort((a, b) => (b.date!.getTime() - a.date!.getTime()))
      .slice(0, 8);
  }, [filteredPolicies]);

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
          <span className="text-4xl" style={{ color: category.color }}>
            <CategoryIcon iconKey={category.iconKey} size={34} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {category.koreanName}
            </h1>
            <p className="text-white/50 mt-1">
              AI 관련 정책 및 규제
            </p>
          </div>
          {!loading && (
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-indigo-400">
                {policies.length}
              </div>
              <div className="text-xs text-white/40">정책</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Region Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="inline-flex bg-white/5 border border-white/10 rounded-full p-1"
      >
        {REGION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRegion(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeRegion === tab
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/90 mb-4">정책 타임라인</h2>
        {timelineItems.length === 0 ? (
          <p className="text-xs text-white/50">타임라인 데이터가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {timelineItems.map((item, idx) => {
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.proposed;
              return (
                <div key={`${item.id}-${idx}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.bg} border border-white/20 mt-1`} />
                    {idx < timelineItems.length - 1 && <span className="w-px flex-1 bg-white/10 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-white font-medium">{item.title}</p>
                    <p className="text-xs text-white/45 mt-0.5">
                      {item.date?.toLocaleDateString("ko-KR")} · {style.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : fetchError && policies.length === 0 ? (
        <ErrorState onRetry={fetchPolicies} />
      ) : filteredPolicies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-4">📜</div>
          <p className="text-white/50 text-lg">
            등록된 정책이 없습니다
          </p>
          <p className="text-white/30 text-sm mt-2">
            데이터가 곧 업데이트됩니다
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRegion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {filteredPolicies.map((policy, idx) => {
              const statusKey = (policy.status || "proposed") as keyof typeof STATUS_STYLES;
              const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.proposed;
              const flag = getCountryFlag(policy.country);
              const policyUrl = policy.url || policy.source_url;
              const summaryText = stripHtml(policy.summary || policy.description);

              return (
                <motion.div
                  key={policy.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all group flex flex-col"
                >
                  {/* Header Row: Country + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{flag}</span>
                      <span className="text-white/60 text-sm font-medium">
                        {policy.country}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold text-base mb-2 group-hover:text-indigo-300 transition-colors">
                    {policyUrl ? (
                      <a
                        href={policyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {policy.title}
                      </a>
                    ) : (
                      policy.title
                    )}
                  </h3>

                  {/* Summary / Description fallback */}
                  {summaryText && (
                    <p className="text-indigo-300/80 text-sm mb-2 line-clamp-2">
                      {summaryText}
                    </p>
                  )}

                  {/* Organization */}
                  {policy.organization && (
                    <div className="flex items-center gap-1.5 mb-2">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="text-white/50 text-sm">
                        {policy.organization}
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
                  {policy.category && (
                    <div className="mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
                        {policy.category}
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-1 mb-3">
                    {policy.effective_date && (
                      <div className="flex items-center gap-2 text-sm text-white/50">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          시행일: {formatDate(policy.effective_date)}
                        </span>
                      </div>
                    )}
                    {policy.published_at && (
                      <div className="text-xs text-white/30">
                        발표: {timeAgo(policy.published_at)}
                      </div>
                    )}
                  </div>

                  {/* Keywords */}
                  {policy.keywords && policy.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {policy.keywords.map((kw, kwIdx) => (
                        <span
                          key={kwIdx}
                          className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-white/10 text-white/50"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Link */}
                  {policy.url && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <a
                        href={policy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
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
                        자세히 보기
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
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
