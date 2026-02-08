"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { CATEGORIES, APP_NAME } from "@/lib/constants";
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

function useKSTClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const y = kst.getFullYear();
      const m = kst.getMonth() + 1;
      const d = kst.getDate();
      const day = days[kst.getDay()];
      const h = kst.getHours();
      const ampm = h < 12 ? "오전" : "오후";
      const h12 = h % 12 || 12;
      const min = String(kst.getMinutes()).padStart(2, "0");
      const sec = String(kst.getSeconds()).padStart(2, "0");
      return `${y}년 ${m}월 ${d}일 (${day}) ${ampm} ${h12}:${min}:${sec}`;
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const kstTime = useKSTClock();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[280px] z-40 glass-sidebar">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-6 py-6 border-b",
        isLight ? "border-black/[0.06]" : "border-white/10"
      )}>
        <Image
          src="/AI봄.jpg"
          alt="AI봄"
          width={44}
          height={44}
          className="rounded-xl"
        />
        <div>
          <h1 className="text-lg font-bold text-gradient">{APP_NAME}</h1>
          <p className="text-xs text-muted-foreground">AI Trend Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {CATEGORIES.map((category, index) => {
            const isActive =
              pathname === category.href ||
              (category.href !== "/" && pathname.startsWith(category.href));

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
              >
                <Link
                  href={category.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                    isActive
                      ? isLight
                        ? "bg-black/[0.04] text-gray-900"
                        : "bg-white/10 text-white"
                      : isLight
                        ? "text-gray-500 hover:bg-black/[0.03] hover:text-gray-900"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: isLight
                          ? `linear-gradient(135deg, ${category.color}10, ${category.color}05)`
                          : `linear-gradient(135deg, ${category.color}15, ${category.color}08)`,
                        boxShadow: isLight
                          ? `inset 0 0 0 1px ${category.color}20`
                          : `inset 0 0 0 1px ${category.color}30, 0 0 20px ${category.color}10`,
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Active bar on left */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ backgroundColor: category.color }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <span className="relative z-10 w-7 text-center flex items-center justify-center">
                    {(() => {
                      const Icon = CATEGORY_ICONS[category.iconKey];
                      return Icon ? <Icon size={18} /> : null;
                    })()}
                  </span>

                  {/* Name */}
                  <span className="relative z-10 text-sm font-medium truncate">
                    {category.name}
                  </span>

                  {/* Korean name on hover */}
                  <span
                    className={cn(
                      "ml-auto text-[10px] relative z-10 transition-opacity duration-200",
                      isActive
                        ? "opacity-60"
                        : "opacity-0 group-hover:opacity-40"
                    )}
                  >
                    {category.koreanName}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Footer — KST Clock */}
      <div className={cn(
        "px-4 py-3 border-t",
        isLight ? "border-black/[0.06]" : "border-white/10"
      )}>
        <div className="flex items-center gap-2 justify-center">
          <Clock size={12} className="text-muted-foreground flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground whitespace-nowrap">
            {kstTime || "로딩 중..."}
          </p>
        </div>
      </div>
    </aside>
  );
}
