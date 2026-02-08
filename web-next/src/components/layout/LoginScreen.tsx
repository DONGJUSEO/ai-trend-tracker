"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { APP_NAME, APP_VERSION } from "@/lib/constants";

// ---------- Animated counter hook ----------
function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

// ---------- Stat card component ----------
function StatCard({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  const animated = useAnimatedCounter(value, 1400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
    >
      <span className="text-xl font-bold text-white/80 tabular-nums tracking-tight">
        {animated.toLocaleString()}
      </span>
      <span className="text-[11px] text-white/30 whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );
}

// ---------- Main component ----------
export default function LoginScreen() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (login(password)) {
      // Success - LayoutShell will re-render with authenticated state
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setPassword("");
    }
  }

  const tags = ["AI", "트렌드", "큐레이션", "실시간"];

  const stats = [
    { value: 1247, label: "추적 중인 AI 모델" },
    { value: 856, label: "수집된 논문" },
    { value: 2340, label: "모니터링 AI 뉴스" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center relative overflow-hidden">
      {/* ===== Animated mesh gradient background (stripe.com style) ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1 — red-500 blob */}
        <motion.div
          className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full opacity-[0.08]"
          style={{
            background:
              "radial-gradient(circle, rgb(239 68 68) 0%, transparent 70%)",
          }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 2 — orange-500 blob */}
        <motion.div
          className="absolute top-[10%] -right-[15%] w-[60vw] h-[60vw] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle, rgb(249 115 22) 0%, transparent 70%)",
          }}
          animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1.1, 1, 1.1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 3 — amber-500 blob */}
        <motion.div
          className="absolute -bottom-[20%] left-[20%] w-[55vw] h-[55vw] rounded-full opacity-[0.06]"
          style={{
            background:
              "radial-gradient(circle, rgb(245 158 11) 0%, transparent 70%)",
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 4 — purple-500 blob */}
        <motion.div
          className="absolute top-[40%] left-[50%] w-[50vw] h-[50vw] -translate-x-1/2 rounded-full opacity-[0.05]"
          style={{
            background:
              "radial-gradient(circle, rgb(168 85 247) 0%, transparent 70%)",
          }}
          animate={{
            x: ["-50%", "calc(-50% + 30px)", "-50%"],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 5 — red/orange crossfade stripe */}
        <motion.div
          className="absolute top-[25%] -left-[5%] w-[110%] h-[30vh] rotate-[-8deg] opacity-[0.04]"
          style={{
            background:
              "linear-gradient(90deg, rgb(239 68 68), rgb(249 115 22), rgb(168 85 247))",
          }}
          animate={{ x: [0, 30, 0], opacity: [0.04, 0.06, 0.04] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grain / noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* ===== Main content ===== */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4 flex flex-col items-center"
      >
        {/* --- Glassmorphic login card --- */}
        <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-red-900/10">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center mb-7"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(239,68,68,0.08)",
                  "0 0 40px rgba(239,68,68,0.18)",
                  "0 0 20px rgba(239,68,68,0.08)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-2xl mb-5 overflow-hidden"
            >
              <Image
                src="/logo.png"
                alt={APP_NAME}
                width={100}
                height={100}
                className="rounded-2xl"
                priority
              />
            </motion.div>

            {/* App name */}
            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {APP_NAME}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-sm text-white/50 mt-2.5 font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              AI 트렌드를 30초 만에 파악하세요
            </motion.p>

            {/* Tag chips */}
            <motion.div
              className="flex gap-1.5 mt-4 flex-wrap justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/30 bg-white/[0.02]"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* --- Password form --- */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <motion.div
              animate={shaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all text-center tracking-widest"
                autoFocus
                required
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={!password}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/20 text-white font-medium hover:from-red-500/30 hover:to-orange-500/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              로그인
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.p
            className="text-[10px] text-white/15 text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {APP_NAME} AI Trending {APP_VERSION}
          </motion.p>
        </div>

        {/* --- Live stats below the card --- */}
        <div className="mt-6 grid grid-cols-3 gap-3 w-full">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              delay={0.3 + i * 0.06}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
