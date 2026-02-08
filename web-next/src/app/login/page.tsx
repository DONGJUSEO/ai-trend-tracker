"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

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
        router.push("/");
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

      <div className="relative z-10 w-full max-w-xl">
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
          <p className="text-white/55 mt-2">관리자 인증 후 대시보드에 접속합니다</p>

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
      </div>
    </div>
  );
}
