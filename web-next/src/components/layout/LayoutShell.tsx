"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";
import LoginScreen from "./LoginScreen";

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0f0a0a]" : "bg-[#f5f0f0]"}`}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:ml-[280px]">
        <TopBar onMenuToggle={() => setMobileNavOpen(true)} />

        {/* Page content */}
        <main className="p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Footer with time */}
        <Footer />
      </div>
    </div>
  );
}

function Footer() {
  const [time, setTime] = useState("");
  const { theme } = useTheme();

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

  return (
    <footer className={`px-4 lg:px-8 py-3 border-t ${
      theme === "dark" ? "border-white/10" : "border-black/10"
    }`}>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-xs ${
          theme === "dark" ? "text-white/40" : "text-black/40"
        }`}>
          {time}
        </span>
        <span className={`text-[10px] ${
          theme === "dark" ? "text-white/20" : "text-black/20"
        }`}>
          KST
        </span>
      </div>
    </footer>
  );
}
