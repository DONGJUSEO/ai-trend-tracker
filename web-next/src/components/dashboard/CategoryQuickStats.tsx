"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import CategoryIcon from "@/components/icons/CategoryIcon";

interface CategoryStat {
  category: string;
  count: number;
  trend: "up" | "down" | "stable";
  change_percent: number;
  last_updated: string;
}

const trendArrow = {
  up: { icon: "\u2191", color: "text-green-400" },
  down: { icon: "\u2193", color: "text-red-400" },
  stable: { icon: "\u2192", color: "text-gray-400" },
};

export default function CategoryQuickStats({ stats }: { stats: CategoryStat[] }) {
  const categoryMap = CATEGORIES.filter((c) => c.id !== "dashboard" && c.id !== "system");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categoryMap.map((cat, index) => {
        const stat = stats.find(
          (s) => s.category.toLowerCase() === cat.id.toLowerCase()
        );
        const count = stat?.count ?? 0;
        const trend = stat?.trend ?? "stable";
        const arrow = trendArrow[trend];

        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={cat.href}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl" style={{ color: cat.color }}>
                    <CategoryIcon iconKey={cat.iconKey} size={20} />
                  </span>
                  <span className={`text-xs font-medium ${arrow.color}`}>
                    {arrow.icon} {stat?.change_percent ?? 0}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1 group-hover:text-white/70 transition-colors">
                  {cat.koreanName}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
