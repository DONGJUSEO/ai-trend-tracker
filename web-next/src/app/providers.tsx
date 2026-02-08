"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import LayoutShell from "@/components/layout/LayoutShell";
import { SWRConfig } from "swr";
import { apiFetcher } from "@/lib/fetcher";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: apiFetcher,
        revalidateOnFocus: false,
        dedupingInterval: 15000,
        refreshInterval: 60000,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
