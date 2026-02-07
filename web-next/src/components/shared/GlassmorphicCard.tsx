"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradientBorder?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
}

export default function GlassmorphicCard({
  children,
  className,
  hover = true,
  gradientBorder = false,
  gradientFrom = "#667eea",
  gradientTo = "#764ba2",
  onClick,
}: GlassmorphicCardProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (gradientBorder) {
    return (
      <motion.div
        whileHover={hover ? { scale: 1.01 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn("relative rounded-2xl p-[1px]", className)}
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}40, ${gradientTo}40)`,
        }}
        onClick={onClick}
      >
        <div
          className={cn(
            "backdrop-blur-xl rounded-2xl h-full",
            isLight ? "bg-white/92" : "bg-[#0a0a0f]/80",
            hover && "transition-all duration-300",
            hover && (isLight ? "hover:bg-white/95" : "hover:bg-white/[0.03]")
          )}
        >
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "backdrop-blur-xl rounded-2xl transition-all duration-300",
        isLight
          ? "bg-white/85 border border-black/[0.06] shadow-sm"
          : "bg-white/5 border border-white/10",
        hover &&
          (isLight
            ? "hover:bg-white/95 hover:shadow-md hover:border-black/[0.1]"
            : "hover:bg-white/[0.08] hover:border-white/[0.15]"),
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
