"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useSWR from "swr";
import { apiFetcher } from "@/lib/fetcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface DashboardSummary {
  total_items: number;
  categories: Record<string, { total: number }>;
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: summary } = useSWR<DashboardSummary>(
    "/api/v1/dashboard/summary",
    apiFetcher,
    { refreshInterval: 60000 }
  );

  const trackedModels = summary?.categories?.huggingface?.total ?? 1247;
  const trackedNews = summary?.categories?.news?.total ?? 2340;
  const trackedPapers = summary?.categories?.papers?.total ?? 856;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_expires", data.expires_at);
        router.push("/system");
      } else {
        setError("비밀번호가 올바르지 않습니다");
      }
    } catch {
      setError("서버에 연결할 수 없습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0b0a09]">
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-20 h-[40rem] w-[40rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,86,48,0.28), rgba(255,86,48,0))" }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-20 h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,189,89,0.20), rgba(255,189,89,0))" }}
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 gap-6 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 lg:p-10"
        >
          <p className="inline-flex px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-4">
            AI봄 Admin
          </p>
          <h1 className="text-3xl font-bold text-white">관리자 로그인</h1>
          <p className="text-white/55 mt-2">AI 트렌드를 30초 만에 파악하세요</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-white/70 mb-2">
                관리자 비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 outline-none focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/20"
                required
                autoFocus
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500/40 to-amber-500/30 border border-orange-300/25 text-white font-medium hover:from-orange-500/50 hover:to-amber-500/40 transition-all disabled:opacity-30"
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 lg:p-10"
        >
          <h2 className="text-white text-lg font-semibold mb-4">실시간 통계</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="추적 중인 AI 모델" value={trackedModels} />
            <StatCard label="수집된 논문" value={trackedPapers} />
            <StatCard label="모니터링 뉴스" value={trackedNews} />
          </div>

          <h3 className="text-white/70 text-sm mt-7 mb-3">대시보드 미리보기</h3>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <div className="h-3 w-3/4 rounded bg-white/20 blur-[0.3px]" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-14 rounded-xl bg-white/10" />
              <div className="h-14 rounded-xl bg-white/10" />
              <div className="h-14 rounded-xl bg-white/10" />
            </div>
            <div className="h-24 rounded-xl bg-white/10" />
            <div className="h-16 rounded-xl bg-white/10" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-white text-lg font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="text-white/45 text-xs mt-1">{label}</p>
    </div>
  );
}

