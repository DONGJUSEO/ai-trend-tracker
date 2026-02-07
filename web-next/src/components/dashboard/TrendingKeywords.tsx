"use client";

import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";

interface TrendingKeyword {
  keyword: string;
  count: number;
  category: string;
  trend: "up" | "down" | "stable";
}

function getCategoryColor(category: string): string {
  const cat = CATEGORIES.find(
    (c) => c.id.toLowerCase() === category.toLowerCase()
  );
  return cat?.color ?? "#6B7280";
}

export default function TrendingKeywords({
  keywords,
}: {
  keywords: TrendingKeyword[];
}) {
  if (!keywords.length) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Trending Keywords</h2>
        <p className="text-muted-foreground text-sm">
          데이터를 수집 중입니다...
        </p>
      </div>
    );
  }

  // Sort by count descending, take top 30
  const sorted = [...keywords].sort((a, b) => b.count - a.count).slice(0, 30);
  const maxCount = sorted[0]?.count ?? 1;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Trending Keywords</h2>
        <span className="text-xs text-muted-foreground">{keywords.length}개 키워드</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sorted.map((kw, index) => {
          const ratio = kw.count / maxCount;
          // Scale font size from 0.75rem to 1.5rem based on count
          const fontSize = 0.75 + ratio * 0.75;
          const opacity = 0.5 + ratio * 0.5;
          const color = getCategoryColor(kw.category);

          return (
            <motion.span
              key={kw.keyword}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="inline-block px-3 py-1.5 rounded-full border cursor-pointer hover:scale-105 transition-transform"
              style={{
                fontSize: `${fontSize}rem`,
                color: color,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`,
                opacity,
              }}
              title={`${kw.keyword}: ${kw.count}회 (${kw.category})`}
            >
              {kw.keyword}
              {kw.trend === "up" && (
                <span className="text-green-400 ml-1 text-xs">{"\u2191"}</span>
              )}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
