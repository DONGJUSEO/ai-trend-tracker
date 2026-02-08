"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { APP_NAME } from "@/lib/constants";

export default function LoginScreen() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (login(password)) {
      // Success
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f3] flex items-center justify-center relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-gray-100 px-10 py-12">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-gray-200/80 mb-6">
              <Image
                src="/AI봄.jpg"
                alt={APP_NAME}
                width={88}
                height={88}
                className="rounded-2xl"
                priority
              />
            </div>

            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
              {APP_NAME}
            </h1>

            <p className="text-[14px] text-gray-400 mt-2 font-medium">
              AI 트렌드를 한눈에 파악하세요
            </p>
          </motion.div>

          {/* Divider */}
          <div className="my-8 h-px bg-gray-100" />

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-2 ml-1">
                비밀번호
              </label>
              <motion.div
                animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-[15px]"
                  autoFocus
                  required
                />
              </motion.div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-[13px] text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={!password}
              className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-[15px] hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              로그인
            </motion.button>
          </motion.form>

          {/* Footer info */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <span className="text-[11px] text-gray-300">
              9개 카테고리 · 실시간 AI 트렌드 추적
            </span>
          </motion.div>
        </div>

        {/* Stats below card */}
        <motion.div
          className="mt-5 grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {[
            { label: "AI 모델", value: "1,200+" },
            { label: "AI 논문", value: "850+" },
            { label: "AI 뉴스", value: "2,300+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-3 px-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-sm"
            >
              <span className="text-[15px] font-bold text-gray-700">{stat.value}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Copyright */}
        <p className="text-center text-[10px] text-gray-300 mt-6">
          {APP_NAME} &middot; AI Trend Tracker
        </p>
      </motion.div>
    </div>
  );
}
