"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wordcloud } from "@visx/wordcloud";
import { apiFetcher } from "@/lib/fetcher";

interface ExternalKeyword {
  keyword: string;
  count: number;
  weight: number;
  sources: string[];
  source?: string;
}

interface LegacyKeyword {
  keyword: string;
  count: number;
  category?: string;
  trend?: "up" | "down" | "stable";
}

interface CloudWord {
  text: string;
  value: number;
  keyword: string;
  count: number;
  sources: string[];
  group: KeywordGroup;
}

type KeywordGroup = "news" | "papers" | "youtube" | "models" | "code" | "etc";

function normalizeSources(keyword: ExternalKeyword): string[] {
  if (keyword.sources?.length) return keyword.sources;
  if (keyword.source) return [keyword.source];
  return [];
}

function resolveGroup(sources: string[]): KeywordGroup {
  const normalized = sources.map((source) => source.toLowerCase());
  if (normalized.some((source) => source.includes("youtube"))) return "youtube";
  if (normalized.some((source) => source.includes("paper") || source.includes("arxiv"))) {
    return "papers";
  }
  if (normalized.some((source) => source.includes("news") || source.includes("hackernews"))) {
    return "news";
  }
  if (normalized.some((source) => source.includes("huggingface"))) return "models";
  if (normalized.some((source) => source.includes("github"))) return "code";
  return "etc";
}

function groupColor(group: KeywordGroup): string {
  if (group === "news") return "#3b82f6";
  if (group === "papers") return "#22c55e";
  if (group === "youtube") return "#ef4444";
  if (group === "models") return "#8b5cf6";
  if (group === "code") return "#f59e0b";
  return "#94a3b8";
}

function groupRoute(group: KeywordGroup, keyword: string): string {
  if (group === "news") return "/news";
  if (group === "papers") return "/papers";
  if (group === "youtube") return "/youtube";
  if (group === "models") return "/huggingface";
  if (group === "code") return "/github";
  return `/search?q=${encodeURIComponent(keyword)}`;
}

function toCloudWords(keywords: ExternalKeyword[]): CloudWord[] {
  const sliced = keywords.slice(0, 50);
  return sliced.map((item) => {
    const sources = normalizeSources(item);
    const group = resolveGroup(sources);
    return {
      text: item.keyword,
      keyword: item.keyword,
      count: item.count,
      sources,
      group,
      value: Math.max(1, item.count + Math.round((item.weight || 0.1) * 10)),
    };
  });
}

export default function TrendingKeywords({
  keywords: legacyKeywords = [],
}: {
  keywords?: LegacyKeyword[];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [keywords, setKeywords] = useState<ExternalKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [width, setWidth] = useState(760);
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
        const json = await apiFetcher<{ keywords?: ExternalKeyword[]; updated_at?: string }>(
          "/api/v1/dashboard/external-trending-keywords?limit=50"
        );
        setKeywords(json.keywords || []);
        setUpdatedAt(json.updated_at || null);
      } catch {
        const fallback: ExternalKeyword[] = (legacyKeywords || []).map((item) => ({
          keyword: item.keyword,
          count: item.count,
          weight: item.count,
          sources: ["internal"],
          source: "internal",
        }));
        setKeywords(fallback);
      } finally {
        setLoading(false);
      }
    }
    fetchKeywords();
  }, [legacyKeywords]);

  const words = useMemo(() => toCloudWords(keywords), [keywords]);
  const wordMetaByText = useMemo(() => {
    const map = new Map<string, CloudWord>();
    for (const word of words) {
      map.set(word.text, word);
    }
    return map;
  }, [words]);

  const maxValue = useMemo(() => {
    if (!words.length) return 1;
    return Math.max(...words.map((word) => word.value));
  }, [words]);

  const minValue = useMemo(() => {
    if (!words.length) return 1;
    return Math.min(...words.map((word) => word.value));
  }, [words]);

  const cloudWidth = Math.max(320, width - 24);
  const cloudHeight = 320;

  const fontSize = (value: number): number => {
    if (maxValue === minValue) return 24;
    const ratio = (value - minValue) / (maxValue - minValue);
    return 12 + ratio * 36;
  };

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
            : `${words.length}개`}
        </span>
      </div>

      {loading ? (
        <div className="h-[320px] rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ) : words.length ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="h-[340px]"
        >
          <svg width={cloudWidth} height={cloudHeight}>
            <Wordcloud<CloudWord>
              words={words}
              width={cloudWidth}
              height={cloudHeight}
              font="Noto Sans KR"
              fontSize={(word) => fontSize(word.value)}
              padding={3}
              spiral="archimedean"
              rotate={() => 0}
              random={() => 0.42}
            >
              {(cloudWords) =>
                cloudWords.map((word) => (
                  (() => {
                    const wordText = word.text || "";
                    if (!wordText) return null;
                    const meta = wordMetaByText.get(wordText);
                    const group = meta?.group || "etc";
                    return (
                      <text
                        key={wordText}
                        fill={groupColor(group)}
                        textAnchor="middle"
                        transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                        fontSize={word.size}
                        fontFamily={word.font}
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push(groupRoute(group, meta?.keyword || wordText))}
                        onMouseMove={(event) => {
                          setTooltip({
                            x: event.clientX,
                            y: event.clientY,
                            keyword: meta?.keyword || wordText,
                            count: meta?.count || 0,
                            sources: meta?.sources || [],
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {wordText}
                      </text>
                    );
                  })()
                ))
              }
            </Wordcloud>
          </svg>
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
