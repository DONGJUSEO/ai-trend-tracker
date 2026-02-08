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
import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={cn(
          "w-[280px] p-0 backdrop-blur-2xl border-r",
          isLight
            ? "bg-white/95 border-black/[0.06]"
            : "bg-[#0f0a0a]/95 border-white/10"
        )}
      >
        <SheetHeader className={cn(
          "px-6 py-6 border-b",
          isLight ? "border-black/[0.06]" : "border-white/10"
        )}>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AI봄"
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
                      ? isLight
                        ? "bg-black/[0.04] text-gray-900"
                        : "bg-white/10 text-white"
                      : isLight
                        ? "text-gray-500 hover:bg-black/[0.03] hover:text-gray-900"
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

                  <span className="w-7 text-center flex items-center justify-center">
                    {(() => {
                      const Icon = CATEGORY_ICONS[category.iconKey];
                      return Icon ? <Icon size={18} /> : null;
                    })()}
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
