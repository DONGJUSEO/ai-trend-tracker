"use client";

import { motion } from "framer-motion";

interface DigestItem {
  category: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const DIGEST_ITEMS: DigestItem[] = [
  {
    category: "학회",
    icon: "🎤",
    title: "ICML 2026 서울 개최 확정",
    description:
      "세계 최대 머신러닝 학회 ICML이 올해 7월 서울에서 개최됩니다. A* 등급 학회로 전 세계 AI 연구자들이 모일 예정입니다.",
    color: "#F59E0B",
  },
  {
    category: "정책",
    icon: "📜",
    title: "AI 기본법 시행 (2026.01)",
    description:
      "대한민국 AI 기본법이 2026년 1월부터 시행되었습니다. 고영향 AI 분류, AI 생성물 표시 의무 등이 포함됩니다.",
    color: "#6366F1",
  },
  {
    category: "플랫폼",
    icon: "🤖",
    title: "AI 플랫폼 경쟁 심화",
    description:
      "ChatGPT, Gemini, Claude, Grok 등 주요 AI 플랫폼들이 멀티모달, 에이전트 기능을 강화하며 경쟁이 더욱 치열해지고 있습니다.",
    color: "#EC4899",
  },
  {
    category: "오픈소스",
    icon: "💻",
    title: "오픈소스 AI 모델 생태계 확대",
    description:
      "Meta Llama, Mistral, Stable Diffusion 등 오픈소스 AI 모델들의 성능이 상용 모델에 근접하며 생태계가 급격히 확대되고 있습니다.",
    color: "#8B5CF6",
  },
];

export default function WeeklyDigest() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">위클리 다이제스트</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
            AI 큐레이션
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          2026년 2월 첫째 주
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIGEST_ITEMS.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/[0.08] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{item.icon}</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}20`,
                }}
              >
                {item.category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
