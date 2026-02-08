"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";


interface LivePulseResponse {
  hot_item?: {
    category: string;
    title: string;
    summary?: string;
    url?: string;
    source?: string;
    published_at?: string;
    score?: number;
  } | null;
  today_stats?: {
    by_category?: Record<string, number>;
    total_today?: number;
    total_yesterday?: number;
    delta?: number;
    trending_keywords?: Array<{ keyword: string; count: number }>;
    next_conference?: { name?: string; d_day?: number | null };
  };
  recent_logs?: Array<{
    job_name: string;
    last_run: string;
    last_status?: string;
  }>;
  updated_at?: string;
}

function formatTimeAgo(value?: string) {
  if (!value) return "방금";
  const date = new Date(value);
  const diffMin = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

export default function LivePulse() {
  const [data, setData] = useState<LivePulseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/dashboard/live-pulse");
        if (!res.ok) throw new Error("live-pulse fetch failed");
        const json = await res.json();
        if (mounted) setData(json);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    const timer = setInterval(fetchData, 60_000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const deltaLabel = useMemo(() => {
    const delta = data?.today_stats?.delta ?? 0;
    if (delta > 0) return `+${delta}`;
    return String(delta);
  }, [data?.today_stats?.delta]);

  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-semibold text-white">AI 실시간 펄스</h2>
        <span className="text-xs text-white/50">
          {loading ? "업데이트 중..." : formatTimeAgo(data?.updated_at)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="text-xs text-rose-300 mb-2">🔥 오늘의 핫 토픽</div>
          {data?.hot_item ? (
            <>
              <div className="text-sm font-semibold text-white line-clamp-2">
                {data.hot_item.title}
              </div>
              <p className="text-xs text-white/60 mt-2 line-clamp-3">
                {data.hot_item.summary || "요약 데이터가 없습니다."}
              </p>
              <div className="text-[11px] text-white/40 mt-3">
                {data.hot_item.source || data.hot_item.category}
              </div>
            </>
          ) : (
            <div className="text-sm text-white/50">집계 데이터를 준비 중입니다.</div>
          )}
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="text-xs text-emerald-300 mb-2">📈 실시간 수치</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/80">
              <span>오늘 수집</span>
              <strong className="text-white">{data?.today_stats?.total_today ?? 0}건</strong>
            </div>
            <div className="flex justify-between text-white/70">
              <span>전일 대비</span>
              <strong className="text-emerald-300">{deltaLabel}</strong>
            </div>
            <div className="flex justify-between text-white/70">
              <span>트렌딩 키워드</span>
              <strong className="text-white text-xs">
                {(data?.today_stats?.trending_keywords || [])
                  .slice(0, 3)
                  .map((k) => k.keyword)
                  .join(" · ") || "-"}
              </strong>
            </div>
            <div className="flex justify-between text-white/70">
              <span>다음 컨퍼런스</span>
              <strong className="text-white text-xs">
                {data?.today_stats?.next_conference?.name
                  ? `D-${data.today_stats.next_conference.d_day ?? "-"}`
                  : "-"}
              </strong>
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="text-xs text-sky-300 mb-2">⚡ 최근 업데이트</div>
          <ul className="space-y-2">
            {(data?.recent_logs || []).slice(0, 5).map((log, idx) => (
              <li key={`${log.job_name}-${idx}`} className="text-xs text-white/70">
                <span className="text-white/90">{formatTimeAgo(log.last_run)}</span>{" "}
                {log.job_name}
              </li>
            ))}
            {!data?.recent_logs?.length && (
              <li className="text-xs text-white/50">최근 수집 로그가 없습니다.</li>
            )}
          </ul>
        </motion.article>
      </div>
    </section>
  );
}
