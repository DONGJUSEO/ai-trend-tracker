"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { getCategoryByHref } from "@/lib/constants";
import { pushRecentItem } from "@/lib/user-preferences";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!isAuthenticated) return;
    const category = getCategoryByHref(pathname);
    pushRecentItem({
      id: category.id,
      title: category.koreanName,
      category: category.id,
      url: category.href,
    });
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (!isAuthenticated && !isLoginRoute) {
      router.replace("/login");
      return;
    }
    if (isAuthenticated && isLoginRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoginRoute, router]);

  if (!isAuthenticated && isLoginRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0f0a0a]" : "bg-[#faf8f6]"}`}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        <TopBar onMenuToggle={() => setMobileNavOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>

        {/* Footer with time */}
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  const [time, setTime] = useState<string | null>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const kst = now.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(kst);
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <footer className={`px-4 lg:px-8 py-3 border-t ${
      isLight ? "border-black/[0.06]" : "border-white/10"
    }`}>
      <div className="flex items-center gap-2">
        <Clock className={`w-3.5 h-3.5 ${
          isLight ? "text-gray-400" : "text-white/30"
        }`} />
        <span className={`font-mono text-xs tracking-wide ${
          isLight ? "text-gray-500" : "text-white/50"
        }`}>
          {time}
        </span>
        <span className={`text-[10px] font-medium ${
          isLight ? "text-gray-400" : "text-white/30"
        }`}>
          KST
        </span>
      </div>
    </footer>
  );
}
