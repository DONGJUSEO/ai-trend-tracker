"use client";

import { motion } from "framer-motion";

interface KeywordTrend {
  keyword: string;
  count: number;
  weight: number;
}

export default function TrendMomentumChart({
  keywords,
}: {
  keywords: KeywordTrend[];
}) {
  if (!keywords.length) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          키워드 모멘텀
        </h2>
        <p className="text-muted-foreground text-sm">
          데이터를 수집 중입니다...
        </p>
      </div>
    );
  }

  const top10 = keywords.slice(0, 10);
  const maxCount = top10[0]?.count ?? 1;

  const barColors = [
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
    "#6366F1",
    "#EF4444",
    "#84CC16",
    "#F97316",
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">키워드 모멘텀</h2>
        <span className="text-xs text-muted-foreground">
          Top {top10.length} 키워드
        </span>
      </div>

      <div className="space-y-3">
        {top10.map((kw, index) => {
          const ratio = kw.count / maxCount;
          const color = barColors[index % barColors.length];

          return (
            <motion.div
              key={kw.keyword}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-white w-28 truncate shrink-0">
                {kw.keyword}
              </span>
              <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className="h-full rounded-full flex items-center justify-end pr-2"
                  style={{ backgroundColor: `${color}80` }}
                >
                  <span className="text-xs text-white font-medium">
                    {kw.count}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
