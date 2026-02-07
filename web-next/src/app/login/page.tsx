"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-white">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground mt-2">
            시스템 관리 페이지에 접근하려면 비밀번호를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-white/70 mb-2"
            >
              관리자 비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
              autoFocus
              required
            />
          </div>

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

        <p className="text-xs text-white/20 text-center mt-6">
          Ain싸 AI Trending v2.0 - 관리자 전용
        </p>
      </motion.div>
    </div>
  );
}
