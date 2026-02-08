"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const WordCloud = dynamic(() => import("react-d3-cloud"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "test1234";

interface ExternalKeyword {
  keyword: string;
  count: number;
  weight: number;
  sources: string[];
}

interface LegacyKeyword {
  keyword: string;
  count: number;
  category?: string;
  trend?: "up" | "down" | "stable";
}

interface WordDatum {
  text: string;
  value: number;
}

function inferColor(keyword: string): string {
  const k = keyword.toLowerCase();
  if (["llm", "gpt", "claude", "gemini", "llama", "mistral", "qwen"].some((t) => k.includes(t))) {
    return "#ef4444";
  }
  if (["vision", "multimodal", "diffusion", "sora", "runway", "dall-e"].some((t) => k.includes(t))) {
    return "#22c55e";
  }
  if (["mlops", "serving", "inference", "vllm", "tensorrt", "onnx"].some((t) => k.includes(t))) {
    return "#3b82f6";
  }
  if (["regulation", "policy", "ai act"].some((t) => k.includes(t))) {
    return "#f59e0b";
  }
  if (["safety", "alignment", "hallucination"].some((t) => k.includes(t))) {
    return "#ec4899";
  }
  return "#a78bfa";
}

export default function TrendingKeywords({
  keywords: legacyKeywords = [],
}: {
  keywords?: LegacyKeyword[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(760);
  const [keywords, setKeywords] = useState<ExternalKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    keyword: string;
    count: number;
    sources: string[];
  } | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.max(320, Math.floor(entries[0].contentRect.width));
      setWidth(nextWidth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchKeywords() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/v1/dashboard/external-trending-keywords?limit=50`,
          { headers: { "X-API-Key": API_KEY } }
        );
        if (!res.ok) throw new Error("키워드 요청 실패");
        const json = await res.json();
        setKeywords(json.keywords || []);
        setUpdatedAt(json.updated_at || null);
      } catch {
        const fallback = (legacyKeywords || []).map((item) => ({
          keyword: item.keyword,
          count: item.count,
          weight: item.count,
          sources: ["internal"],
        }));
        setKeywords(fallback);
      } finally {
        setLoading(false);
      }
    }
    fetchKeywords();
  }, [legacyKeywords]);

  const byKeyword = useMemo(() => {
    const map = new Map<string, ExternalKeyword>();
    for (const item of keywords) map.set(item.keyword, item);
    return map;
  }, [keywords]);

  const cloudData = useMemo<WordDatum[]>(() => {
    if (!keywords.length) return [];
    return keywords.slice(0, 50).map((item) => ({
      text: item.keyword,
      value: Math.max(8, Math.round((item.weight || 0.1) * 100) + item.count),
    }));
  }, [keywords]);

  const onWordClick = useCallback(
    (_event: unknown, datum: { text: string }) => {
      router.push(`/search?q=${encodeURIComponent(datum.text)}`);
    },
    [router]
  );

  const onWordMouseOver = useCallback(
    (event: MouseEvent, datum: { text: string }) => {
      const keyword = byKeyword.get(datum.text);
      if (!keyword) return;
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        keyword: keyword.keyword,
        count: keyword.count,
        sources: keyword.sources || [],
      });
    },
    [byKeyword]
  );

  const onWordMouseOut = useCallback(() => setTooltip(null), []);

  return (
    <div
      ref={containerRef}
      className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">실시간 트렌딩 키워드</h2>
        <span className="text-xs text-white/50">
          {loading
            ? "불러오는 중..."
            : updatedAt
            ? `업데이트 ${new Date(updatedAt).toLocaleTimeString("ko-KR")}`
            : `${keywords.length}개`}
        </span>
      </div>

      {loading ? (
        <div className="h-[320px] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ) : cloudData.length ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="h-[340px]"
        >
          <WordCloud
            data={cloudData}
            width={width - 24}
            height={320}
            rotate={() => 0}
            padding={3}
            font="Noto Sans KR"
            fontWeight="600"
            fontSize={(word: { value: number }) =>
              Math.max(12, Math.min(48, Math.log2(word.value + 2) * 8))
            }
            fill={(d: { text: string }) => inferColor(d.text)}
            onWordClick={onWordClick}
            onWordMouseOver={onWordMouseOver}
            onWordMouseOut={onWordMouseOut}
          />
        </motion.div>
      ) : (
        <div className="h-[320px] rounded-xl bg-white/5 border border-white/10 grid place-items-center text-sm text-white/50">
          키워드 데이터를 수집 중입니다.
        </div>
      )}

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-white/15 bg-black/85 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="font-semibold">{tooltip.keyword}</div>
          <div className="text-white/70">빈도 {tooltip.count}</div>
          <div className="text-white/60">
            출처 {tooltip.sources.join(", ") || "unknown"}
          </div>
        </div>
      )}
    </div>
  );
}
