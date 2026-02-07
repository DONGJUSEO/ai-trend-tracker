"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface HeroStats {
  totalData: number;
  trendingKeywords: number;
  lastUpdated: string;
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  return <motion.span>{rounded}</motion.span>;
}

export default function HeroSection({ stats }: { stats: HeroStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-orange-600/15 to-amber-600/20 animate-gradient" style={{ backgroundSize: "200% 200%" }} />
      <div className="absolute inset-0 bg-[#0f0a0a]/60 backdrop-blur-sm" />

      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Title */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              Ain싸
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 ml-2">
                AI Trending
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mt-2 text-lg"
            >
              AI 업계의 모든 트렌드를 한눈에, 한글로
            </motion.p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-white">
                <AnimatedCounter value={stats.totalData} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Data</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-red-400">
                <AnimatedCounter value={stats.trendingKeywords} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Trending Keywords</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-sm font-mono text-orange-400">
                {stats.lastUpdated}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Last Updated (KST)</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
