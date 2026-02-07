"use client";

import { motion, useReducedMotion } from "framer-motion";

interface NewsItem {
  title: string;
  source: string;
  url?: string;
}

export default function BreakingNewsTicker({ items }: { items: NewsItem[] }) {
  const shouldReduce = useReducedMotion();

  if (!items.length) return null;

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 bg-red-500/20 border-r border-white/10 px-4 py-3">
          <span className="text-red-400 text-xs font-bold tracking-wider">BREAKING</span>
        </div>

        {/* Scrolling area */}
        <div className="overflow-hidden flex-1 py-3 group">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={
              shouldReduce
                ? {}
                : {
                    x: ["0%", "-50%"],
                  }
            }
            transition={
              shouldReduce
                ? {}
                : {
                    x: {
                      duration: items.length * 4,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }
            }
            style={{ willChange: "transform" }}
            // Pause on hover via CSS
            onHoverStart={(e) => {
              const target = e.target as HTMLElement;
              target.style.animationPlayState = "paused";
            }}
          >
            {doubled.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-sm">
                <span className="text-white/90">{item.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                  {item.source}
                </span>
                <span className="text-white/20 mx-2">|</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
