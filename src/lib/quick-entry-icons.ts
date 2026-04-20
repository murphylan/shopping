import {
  BookOpen,
  Gift,
  Laptop,
  MoreHorizontal,
  Package,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/** 金刚区可选图标（与后台下拉一致） */
export const QUICK_ENTRY_ICON_KEYS = [
  "shirt",
  "smartphone",
  "utensils",
  "gift",
  "sparkles",
  "sofa",
  "book",
  "more",
  "package",
  "laptop",
] as const;

export type QuickEntryIconKey = (typeof QUICK_ENTRY_ICON_KEYS)[number];

export const QUICK_ENTRY_ICONS: Record<QuickEntryIconKey, LucideIcon> = {
  shirt: Shirt,
  smartphone: Smartphone,
  utensils: UtensilsCrossed,
  gift: Gift,
  sparkles: Sparkles,
  sofa: Sofa,
  book: BookOpen,
  more: MoreHorizontal,
  package: Package,
  laptop: Laptop,
};

export function getQuickEntryIcon(key: string): LucideIcon {
  if (key in QUICK_ENTRY_ICONS) {
    return QUICK_ENTRY_ICONS[key as QuickEntryIconKey];
  }
  return Package;
}
