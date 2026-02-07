"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import LayoutShell from "@/components/layout/LayoutShell";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LayoutShell>{children}</LayoutShell>
      </AuthProvider>
    </ThemeProvider>
  );
}
