"use client";

import { cn } from "@/lib/utils";

interface DateBadgeProps {
  date: string | Date;
  className?: string;
  showRelative?: boolean;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${Math.floor(diffDay / 365)}년 전`;
}

function formatKoreanDate(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function DateBadge({
  date,
  className,
  showRelative = true,
}: DateBadgeProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const koreanDate = formatKoreanDate(dateObj);
  const relativeTime = getRelativeTime(dateObj);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
      title={koreanDate}
    >
      <span>{koreanDate}</span>
      {showRelative && (
        <span className="text-muted-foreground/60">({relativeTime})</span>
      )}
    </span>
  );
}
