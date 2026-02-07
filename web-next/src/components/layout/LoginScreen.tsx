"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

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

  return (
    <div className="min-h-screen bg-[#0f0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? "rgba(239,68,68,0.06)" : "rgba(249,115,22,0.04)"
              }, transparent 70%)`,
            }}
            animate={{
              x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
              y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-red-900/10">
          {/* Logo with animations */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(239,68,68,0.1)",
                  "0 0 40px rgba(239,68,68,0.2)",
                  "0 0 20px rgba(239,68,68,0.1)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl mb-5 overflow-hidden"
            >
              <Image
                src="/logo.png"
                alt="Ain싸"
                width={100}
                height={100}
                className="rounded-2xl"
                priority
              />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Ain싸
            </motion.h1>

            <motion.p
              className="text-sm text-white/40 mt-2 tracking-wider uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              AI Trending
            </motion.p>

            <motion.div
              className="flex gap-1.5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {["AI", "트렌드", "큐레이션"].map((tag, i) => (
                <span
                  key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/30"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Password form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
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

          <motion.p
            className="text-[10px] text-white/15 text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            Ain싸 AI Trending v2.0
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
