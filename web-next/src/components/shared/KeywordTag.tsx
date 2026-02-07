"use client";

import { cn } from "@/lib/utils";

interface KeywordTagProps {
  keyword: string;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export default function KeywordTag({
  keyword,
  color,
  onClick,
  className,
}: KeywordTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        "bg-white/10 backdrop-blur-sm border border-white/10",
        "transition-all duration-200",
        onClick &&
          "cursor-pointer hover:bg-white/[0.15] hover:border-white/20 active:scale-95",
        !onClick && "cursor-default",
        className
      )}
      style={
        color
          ? {
              backgroundColor: `${color}15`,
              borderColor: `${color}30`,
              color: color,
            }
          : undefined
      }
    >
      {keyword}
    </button>
  );
}
