"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  lines?: number;
  type?: "card" | "list" | "text";
  className?: string;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded-lg bg-white/5 animate-pulse",
        className
      )}
    />
  );
}

export default function LoadingSkeleton({
  lines = 3,
  type = "text",
  className,
}: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div
        className={cn(
          "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4",
          className
        )}
      >
        <SkeletonLine className="h-6 w-3/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonLine className="h-6 w-16 rounded-full" />
          <SkeletonLine className="h-6 w-20 rounded-full" />
          <SkeletonLine className="h-6 w-14 rounded-full" />
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-4"
          >
            <SkeletonLine className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // type === "text"
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/5" : i % 2 === 0 ? "w-full" : "w-4/5"
          )}
        />
      ))}
    </div>
  );
}
