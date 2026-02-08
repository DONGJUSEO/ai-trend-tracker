"use client";

import LivePulse from "./LivePulse";

interface NewsItem {
  title: string;
  source: string;
  url?: string;
}

export default function BreakingNewsTicker(_props: { items?: NewsItem[] }) {
  return <LivePulse />;
}
