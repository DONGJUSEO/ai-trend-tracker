"use client";

import { motion } from "framer-motion";

const KOREA_CONFERENCES = [
  {
    name: "ICML 2026",
    fullName: "International Conference on Machine Learning",
    date: "7월 6일 - 11일",
    location: "서울",
    tier: "A*",
    color: "#3B82F6",
  },
  {
    name: "KDD 2026",
    fullName: "Knowledge Discovery and Data Mining",
    date: "8월 9일 - 13일",
    location: "제주",
    tier: "A*",
    color: "#8B5CF6",
  },
];

export default function KoreaAIHighlight() {
  return (
    <div className="bg-gradient-to-r from-red-600/10 via-orange-600/10 to-amber-600/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🇰🇷</span>
        <h2 className="text-lg font-semibold text-white">
          2026 한국의 해 - AI 학회
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
          특별 세션
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {KOREA_CONFERENCES.map((conf, index) => (
          <motion.div
            key={conf.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-lg" style={{ color: conf.color }}>
                {conf.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold">
                {conf.tier}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{conf.fullName}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/80">📅 {conf.date}</span>
              <span className="text-white/80">📍 {conf.location}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        전 세계 AI 연구자들이 한국으로 모입니다
      </p>
    </div>
  );
}
