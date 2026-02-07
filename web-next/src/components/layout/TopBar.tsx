"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Clock } from "lucide-react";
import { getCategoryByHref } from "@/lib/constants";

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState("");

  const category = getCategoryByHref(pathname);

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const kstTime = now.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setCurrentTime(kstTime);
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left: Mobile menu + Page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xl">{category.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {category.name}
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {category.koreanName}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-xs sm:text-sm">{currentTime}</span>
          <span className="text-[10px] text-muted-foreground/60">KST</span>
        </div>
      </div>
    </header>
  );
}
