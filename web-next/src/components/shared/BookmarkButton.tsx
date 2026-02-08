"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/user-preferences";

interface BookmarkButtonProps {
  id: string;
  title: string;
  url?: string;
  category: string;
  className?: string;
}

export default function BookmarkButton({
  id,
  title,
  url,
  category,
  className = "",
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(id, category));
  }, [id, category]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ id, title, url, category });
        setSaved((prev) => !prev);
      }}
      className={`inline-flex items-center justify-center rounded-lg border p-1.5 transition-colors ${
        saved
          ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
          : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
      } ${className}`}
      aria-label={saved ? "북마크 해제" : "북마크 저장"}
      title={saved ? "북마크 해제" : "북마크 저장"}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}

