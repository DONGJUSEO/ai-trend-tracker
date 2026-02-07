"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CATEGORIES, APP_NAME, APP_VERSION } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 bg-[#0f0a0a]/95 backdrop-blur-2xl border-r border-white/10"
      >
        <SheetHeader className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ain싸"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <div>
              <SheetTitle className="text-lg font-bold text-gradient">
                {APP_NAME}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">{APP_VERSION}</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {CATEGORIES.map((category) => {
              const isActive =
                pathname === category.href ||
                (category.href !== "/" && pathname.startsWith(category.href));

              return (
                <Link
                  key={category.id}
                  href={category.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  {/* Active bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}

                  <span className="text-lg w-7 text-center">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="ml-auto text-[10px] opacity-50">
                    {category.koreanName}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
