"use client";

import { motion } from "framer-motion";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "데이터를 불러올 수 없습니다",
  message = "서버에 연결할 수 없거나 오류가 발생했습니다.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
    >
      <div className="text-4xl mb-4">
        <svg
          className="w-12 h-12 mx-auto text-red-400/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-white/60 text-lg font-medium">{title}</p>
      <p className="text-white/30 text-sm mt-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white/70 hover:bg-white/15 hover:text-white transition-all text-sm font-medium"
        >
          다시 시도
        </button>
      )}
    </motion.div>
  );
}
