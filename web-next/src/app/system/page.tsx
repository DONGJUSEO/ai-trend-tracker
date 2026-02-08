"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { SystemStatus, ServiceStatus, SchedulerJob } from "@/lib/types";
import CategoryIcon from "@/components/icons/CategoryIcon";

const headers = { "Content-Type": "application/json" };

const category = CATEGORIES.find((c) => c.id === "system")!;

function useAdminAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const expires = localStorage.getItem("admin_expires");

    if (!token || !expires) {
      setChecking(false);
      return;
    }

    if (new Date(expires) < new Date()) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_expires");
      setChecking(false);
      return;
    }

    // Verify token with server
    fetch("/api/v1/admin/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setAuthenticated(true);
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_expires");
        }
      })
      .catch(() => {
        // Server unreachable = deny access (never bypass)
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_expires");
      })
      .finally(() => setChecking(false));
  }, []);

  const login = async (password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_expires", data.expires_at);
        setAuthenticated(true);
        return null;
      }
      return "비밀번호가 올바르지 않습니다";
    } catch {
      return "서버에 연결할 수 없습니다";
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_expires");
    setAuthenticated(false);
  };

  return { authenticated, checking, login, logout };
}

const STATUS_INDICATOR: Record<
  string,
  { color: string; bg: string; label: string; pulse: boolean }
> = {
  healthy: {
    color: "bg-green-400",
    bg: "bg-green-500/20",
    label: "정상",
    pulse: true,
  },
  degraded: {
    color: "bg-amber-400",
    bg: "bg-amber-500/20",
    label: "저하됨",
    pulse: true,
  },
  down: {
    color: "bg-red-400",
    bg: "bg-red-500/20",
    label: "중단됨",
    pulse: false,
  },
};

const SERVICE_STATUS_COLORS: Record<
  string,
  { color: string; label: string }
> = {
  running: { color: "bg-green-400", label: "실행 중" },
  stopped: { color: "bg-gray-400", label: "중지됨" },
  error: { color: "bg-red-400", label: "오류" },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
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
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins <= 0) return "방금 전";
      return `${diffMins}분 전`;
    }
    return `${diffHours}시간 전`;
  }
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function InlineAdminLogin({ onLogin }: { onLogin: (password: string) => Promise<string | null> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await onLogin(password);
    if (err) {
      setError(err);
      setPassword("");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <span className="text-4xl inline-flex" style={{ color: category.color }}>
            <CategoryIcon iconKey={category.iconKey} size={34} />
          </span>
          <h1 className="text-xl font-bold text-white mt-3">시스템 관리</h1>
          <p className="text-sm text-white/40 mt-2">
            관리자 비밀번호를 입력하세요
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-center tracking-widest"
            autoFocus
            required
          />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

interface CategoryStatItem {
  category: string;
  name: string;
  total: number;
  recent_7d: number;
  prev_7d: number;
  trend: "up" | "down" | "stable";
  last_update: string | null;
}

export default function SystemPage() {
  const { authenticated, checking, login, logout } = useAdminAuth();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, statsRes] = await Promise.allSettled([
        fetch(`/api/v1/system/status`, { headers }),
        fetch(`/api/v1/dashboard/category-stats`, { headers }),
      ]);
      if (statusRes.status === "fulfilled" && statusRes.value.ok) {
        setSystemStatus(await statusRes.value.json());
      }
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const data = await statsRes.value.json();
        setCategoryStats(data.categories ?? []);
      }
    } catch {
      // API unavailable
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    if (!authenticated || checking) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus, authenticated, checking]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white/50">인증 확인 중...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <InlineAdminLogin onLogin={login} />;
  }

  const handleRefresh = () => {
    setLoading(true);
    fetchStatus();
  };

  const statusInfo = systemStatus
    ? STATUS_INDICATOR[systemStatus.status] || STATUS_INDICATOR.down
    : STATUS_INDICATOR.down;

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
              시스템 상태 및 관리
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-white/30">
              마지막 갱신: {lastRefresh.toLocaleTimeString("ko-KR")}
            </span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-all text-sm disabled:opacity-30"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-all text-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </motion.div>

      {loading && !systemStatus ? (
        <LoadingSkeleton />
      ) : !systemStatus ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="text-4xl mb-4">🔌</div>
          <p className="text-white/50 text-lg">
            시스템에 연결할 수 없습니다
          </p>
          <p className="text-white/30 text-sm mt-2">
            API 서버가 실행 중인지 확인해주세요
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:bg-white/15 transition-all text-sm"
          >
            다시 시도
          </button>
        </motion.div>
      ) : (
        <>
          {/* System Status Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              시스템 상태
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-2">상태</p>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full ${statusInfo.color}`}
                    />
                    {statusInfo.pulse && (
                      <div
                        className={`absolute inset-0 w-3 h-3 rounded-full ${statusInfo.color} animate-ping opacity-75`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      systemStatus.status === "healthy"
                        ? "text-green-400"
                        : systemStatus.status === "degraded"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Uptime */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-2">업타임</p>
                <p className="text-lg font-bold text-white">
                  {systemStatus.uptime}
                </p>
              </div>

              {/* Version */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-2">버전</p>
                <p className="text-lg font-bold text-white">
                  {systemStatus.version}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Services */}
          {systemStatus.services && systemStatus.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
                서비스 목록
              </h2>
              <div className="space-y-2">
                {systemStatus.services.map(
                  (service: ServiceStatus, idx: number) => {
                    const svcStatus =
                      SERVICE_STATUS_COLORS[service.status] ||
                      SERVICE_STATUS_COLORS.stopped;

                    return (
                      <motion.div
                        key={service.name || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${svcStatus.color}`}
                            />
                            {service.status === "running" && (
                              <div
                                className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${svcStatus.color} animate-ping opacity-50`}
                              />
                            )}
                          </div>
                          <span className="text-white/80 text-sm font-medium">
                            {service.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {service.response_time_ms != null && (
                            <span className="text-xs text-white/30">
                              {service.response_time_ms}ms
                            </span>
                          )}
                          <span
                            className={`text-xs font-medium ${
                              service.status === "running"
                                ? "text-green-400"
                                : service.status === "error"
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          >
                            {svcStatus.label}
                          </span>
                          {service.last_check && (
                            <span className="text-xs text-white/20">
                              {timeAgo(service.last_check)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </motion.div>
          )}

          {/* Database & Crawler Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Database Info */}
            {systemStatus.database && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                  데이터베이스
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">상태</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          systemStatus.database.status === "connected" ||
                          systemStatus.database.status === "healthy"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          systemStatus.database.status === "connected" ||
                          systemStatus.database.status === "healthy"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {systemStatus.database.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">용량</span>
                    <span className="text-white font-medium text-sm">
                      {systemStatus.database.size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">컬렉션</span>
                    <span className="text-white font-medium text-sm">
                      {systemStatus.database.collections}개
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Crawler Info */}
            {systemStatus.crawler && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  크롤러
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">상태</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          systemStatus.crawler.status === "running" ||
                          systemStatus.crawler.status === "idle"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          systemStatus.crawler.status === "running" ||
                          systemStatus.crawler.status === "idle"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {systemStatus.crawler.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">
                      활성 작업
                    </span>
                    <span className="text-white font-medium text-sm">
                      {systemStatus.crawler.active_jobs}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">
                      오늘 완료
                    </span>
                    <span className="text-green-400 font-medium text-sm">
                      {systemStatus.crawler.completed_today}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/50 text-sm">
                      오늘 실패
                    </span>
                    <span
                      className={`font-medium text-sm ${
                        systemStatus.crawler.failed_today > 0
                          ? "text-red-400"
                          : "text-white/60"
                      }`}
                    >
                      {systemStatus.crawler.failed_today}개
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Crawl Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white/40"
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
              크롤 스케줄
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4">
                <p className="text-xs text-white/40 mb-1">마지막 크롤</p>
                <p className="text-white font-medium text-sm">
                  {systemStatus.last_crawl
                    ? formatDateTime(systemStatus.last_crawl)
                    : "-"}
                </p>
                {systemStatus.last_crawl && (
                  <p className="text-xs text-white/30 mt-1">
                    {timeAgo(systemStatus.last_crawl)}
                  </p>
                )}
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4">
                <p className="text-xs text-white/40 mb-1">다음 크롤</p>
                <p className="text-white font-medium text-sm">
                  {systemStatus.next_crawl
                    ? formatDateTime(systemStatus.next_crawl)
                    : "-"}
                </p>
                {systemStatus.next_crawl && (
                  <p className="text-xs text-blue-400/60 mt-1">
                    {(() => {
                      const now = new Date();
                      const next = new Date(systemStatus.next_crawl);
                      const diffMs = next.getTime() - now.getTime();
                      if (diffMs <= 0) return "곧 실행 예정";
                      const diffMins = Math.floor(diffMs / (1000 * 60));
                      if (diffMins < 60) return `${diffMins}분 후`;
                      const diffHours = Math.floor(diffMins / 60);
                      if (diffHours < 24) return `${diffHours}시간 후`;
                      return `${Math.floor(diffHours / 24)}일 후`;
                    })()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Category Data Stats (moved from dashboard) */}
          {categoryStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                카테고리별 데이터 현황
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {categoryStats.map((stat) => {
                  const displayCategory = stat.category === "tools" ? "platforms" : stat.category;
                  const catDef = CATEGORIES.find((c) => c.id === displayCategory);
                  const color = catDef?.color ?? "#6B7280";
                  const trendArrow = stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→";
                  const trendColor =
                    stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-white/40";

                  return (
                    <div
                      key={stat.category}
                      className="bg-white/[0.03] border border-white/5 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {catDef && (
                          <span style={{ color }}>
                            <CategoryIcon iconKey={catDef.iconKey} size={16} />
                          </span>
                        )}
                        <span className="text-xs font-medium text-white/60 truncate">{stat.name}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xl font-bold text-white">{stat.total.toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-bold ${trendColor}`}>{trendArrow}</span>
                          <span className="text-xs text-white/40">{stat.recent_7d > 0 ? `+${stat.recent_7d}` : stat.recent_7d}</span>
                        </div>
                      </div>
                      {stat.last_update && (
                        <p className="text-[10px] text-white/25 mt-2">{timeAgo(stat.last_update)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
