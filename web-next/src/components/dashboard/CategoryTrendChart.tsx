"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface CategoryItem {
  name: string;
  total: number;
  recent_7d: number;
}

export default function CategoryTrendChart({
  categories,
  isLight,
}: {
  categories: CategoryItem[];
  isLight: boolean;
}) {
  const sorted = useMemo(
    () => [...categories].sort((a, b) => b.total - a.total).slice(0, 9),
    [categories]
  );

  const option = useMemo(() => {
    const labels = sorted.map((item) => item.name);
    const totals = sorted.map((item) => item.total);
    const recents = sorted.map((item) => item.recent_7d);

    return {
      animationDuration: 700,
      animationEasing: "cubicOut",
      grid: { left: 12, right: 12, top: 30, bottom: 12, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: isLight ? "rgba(17,24,39,0.92)" : "rgba(0,0,0,0.85)",
        borderWidth: 0,
        textStyle: { color: "#fff" },
      },
      legend: {
        top: 0,
        textStyle: { color: isLight ? "#374151" : "#d1d5db", fontSize: 11 },
      },
      xAxis: {
        type: "value",
        axisLabel: { color: isLight ? "#4b5563" : "#9ca3af" },
        splitLine: {
          lineStyle: {
            color: isLight ? "rgba(17,24,39,0.08)" : "rgba(255,255,255,0.08)",
          },
        },
      },
      yAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          color: isLight ? "#374151" : "#d1d5db",
          fontSize: 11,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: "전체",
          type: "bar",
          data: totals,
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: "#f97316",
          },
        },
        {
          name: "최근 7일",
          type: "bar",
          data: recents,
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 8, 8, 0],
            color: "#22d3ee",
          },
        },
      ],
    };
  }, [isLight, sorted]);

  if (!sorted.length) {
    return (
      <div className="h-[320px] rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-sm text-white/50">
        카테고리 통계 데이터를 준비 중입니다.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className={`text-sm font-semibold mb-2 ${isLight ? "text-gray-800" : "text-white"}`}>
        카테고리 데이터 분포 (ECharts)
      </div>
      <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
    </div>
  );
}

