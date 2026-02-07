"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
            "bg-[#0a0a0f]/80 backdrop-blur-xl rounded-2xl h-full",
            hover && "hover:bg-white/[0.03] transition-all duration-300"
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
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
        hover &&
          "hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
