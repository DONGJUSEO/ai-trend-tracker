"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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
      </div>
    </div>
  );
}
