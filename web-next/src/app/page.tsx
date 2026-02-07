"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/dashboard/HeroSection";
import CategoryQuickStats from "@/components/dashboard/CategoryQuickStats";
import TrendingKeywords from "@/components/dashboard/TrendingKeywords";
import TrendMomentumChart from "@/components/dashboard/TrendMomentumChart";
import BreakingNewsTicker from "@/components/dashboard/BreakingNewsTicker";
import KoreaAIHighlight from "@/components/dashboard/KoreaAIHighlight";
import WeeklyDigest from "@/components/dashboard/WeeklyDigest";

// ─── Fallback data ───────────────────────────────────────────
const FALLBACK_NEWS = [
  { title: "ICML 2026이 서울에서 개최됩니다 (7월 6-11일)", source: "학회" },
  { title: "KDD 2026이 제주에서 개최됩니다 (8월 9-13일)", source: "학회" },
  { title: "AI 기본법이 2026년 1월부터 시행되었습니다", source: "정책" },
  { title: "AI Trend Tracker v2.0 - 프리미엄 대시보드 출시", source: "시스템" },
];

// ─── Types matching actual API response ──────────────────────
interface SummaryCategory {
  name: string;
  total: number;
  recent_7d: number;
  last_update: string | null;
}

interface SummaryResponse {
  total_items: number;
  total_recent_7d: number;
  total_categories: number;
  timestamp: string;
  categories: Record<string, SummaryCategory>;
}

interface KeywordsResponse {
  total_keywords: number;
  unique_keywords: number;
  top_keywords: { keyword: string; count: number; weight: number }[];
}

interface CategoryStatResponse {
  timestamp: string;
  categories: {
    category: string;
    name: string;
    total: number;
    recent_7d: number;
    prev_7d: number;
    trend: "up" | "down" | "stable";
    last_update: string | null;
  }[];
}

function formatKST(date: Date): string {
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [topKeywords, setTopKeywords] = useState<
    { keyword: string; count: number; weight: number }[]
  >([]);
  const [categoryStats, setCategoryStats] = useState<
    {
      category: string;
      count: number;
      trend: "up" | "down" | "stable";
      change_percent: number;
      last_updated: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "";
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "test1234";
      const headers = {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      };

      try {
        const [summaryRes, keywordsRes, statsRes] = await Promise.allSettled([
          fetch(`${apiUrl}/api/v1/dashboard/summary`, { headers }),
          fetch(`${apiUrl}/api/v1/dashboard/trending-keywords`, { headers }),
          fetch(`${apiUrl}/api/v1/dashboard/category-stats`, { headers }),
        ]);

        if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
          const data: SummaryResponse = await summaryRes.value.json();
          setSummary(data);
        }

        if (keywordsRes.status === "fulfilled" && keywordsRes.value.ok) {
          const data: KeywordsResponse = await keywordsRes.value.json();
          setTopKeywords(data.top_keywords || []);
        }

        if (statsRes.status === "fulfilled" && statsRes.value.ok) {
          const data: CategoryStatResponse = await statsRes.value.json();
          if (data.categories) {
            // Map "tools" category to "platforms" for frontend
            const mapped = data.categories.map((s) => {
              const catKey =
                s.category === "tools" ? "platforms" : s.category;
              const changePct =
                s.prev_7d > 0
                  ? Math.round(
                      ((s.recent_7d - s.prev_7d) / s.prev_7d) * 100
                    )
                  : s.recent_7d > 0
                  ? 100
                  : 0;
              return {
                category: catKey,
                count: s.total,
                trend: s.trend,
                change_percent: changePct,
                last_updated: s.last_update || "-",
              };
            });
            setCategoryStats(mapped);
          }
        }
      } catch {
        // API unavailable - use fallback data
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // Adapt keywords for TrendingKeywords component (needs category field)
  const trendingKeywords = topKeywords.map((kw) => ({
    keyword: kw.keyword,
    count: kw.count,
    category: "general",
    trend: "stable" as const,
  }));

  const heroStats = {
    totalData: summary?.total_items ?? 0,
    trendingKeywords: topKeywords.length,
    lastUpdated: summary?.timestamp
      ? formatKST(new Date(summary.timestamp))
      : formatKST(new Date()),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loaders */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
              <div className="h-6 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <HeroSection stats={heroStats} />

      {/* Breaking News Ticker */}
      <BreakingNewsTicker items={FALLBACK_NEWS} />

      {/* Korea AI Highlight - 2026 Conferences */}
      <KoreaAIHighlight />

      {/* Category Quick Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          카테고리 현황
        </h2>
        <CategoryQuickStats stats={categoryStats} />
      </div>

      {/* Two-column: Keywords + Momentum Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendingKeywords keywords={trendingKeywords} />
        <TrendMomentumChart keywords={topKeywords} />
      </div>

      {/* Weekly Digest */}
      <WeeklyDigest />
    </div>
  );
}
