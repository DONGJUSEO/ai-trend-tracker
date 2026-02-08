"use client";

import { CATEGORY_ICONS } from "@/components/icons/CategoryIcons";

interface CategoryIconProps {
  iconKey: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({ iconKey, size = 20, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[iconKey];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

