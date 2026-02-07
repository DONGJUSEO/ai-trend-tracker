"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu, RefreshCw, Sun, Moon, LogOut } from "lucide-react";
import { getCategoryByHref } from "@/lib/constants";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const category = getCategoryByHref(pathname);

  function handleRefresh() {
    router.refresh();
    window.location.reload();
  }

  return (
    <header className={`sticky top-0 z-30 w-full backdrop-blur-xl border-b ${
      theme === "dark"
        ? "bg-[#0f0a0a]/80 border-white/10"
        : "bg-white/80 border-black/10"
    }`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left: Mobile menu + Page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
            }`}
            aria-label="Toggle menu"
          >
            <Menu className={`w-5 h-5 ${theme === "dark" ? "text-white" : "text-gray-800"}`} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xl">{category.icon}</span>
            <div>
              <h2 className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                {category.name}
              </h2>
              <p className={`text-xs hidden sm:block ${
                theme === "dark" ? "text-white/50" : "text-gray-500"
              }`}>
                {category.koreanName}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-white/60 hover:text-white"
                : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
            }`}
            aria-label="새로고침"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-white/60 hover:text-white"
                : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
            }`}
            aria-label={theme === "dark" ? "라이트 모드" : "다크 모드"}
            title={theme === "dark" ? "라이트 모드" : "다크 모드"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-white/10 text-white/60 hover:text-white"
                : "hover:bg-black/5 text-gray-500 hover:text-gray-800"
            }`}
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
