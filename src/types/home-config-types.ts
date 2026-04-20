import { z } from "zod";

import { QUICK_ENTRY_ICON_KEYS } from "@/lib/quick-entry-icons";

export const BANNER_GRADIENT_PRESETS = [
  { value: "from-pink-500 to-rose-500", label: "粉玫" },
  { value: "from-blue-500 to-cyan-500", label: "青蓝" },
  { value: "from-violet-500 to-purple-600", label: "紫罗兰" },
  { value: "from-emerald-500 to-teal-600", label: "翠绿" },
  { value: "from-orange-500 to-amber-600", label: "暖橙" },
  { value: "from-slate-600 to-slate-800", label: "深灰" },
] as const;

export const QUICK_ENTRY_COLOR_PRESETS = [
  { value: "bg-pink-50 text-pink-500", label: "粉" },
  { value: "bg-blue-50 text-blue-500", label: "蓝" },
  { value: "bg-orange-50 text-orange-500", label: "橙" },
  { value: "bg-purple-50 text-purple-500", label: "紫" },
  { value: "bg-rose-50 text-rose-500", label: "玫" },
  { value: "bg-green-50 text-green-500", label: "绿" },
  { value: "bg-amber-50 text-amber-500", label: "琥珀" },
  { value: "bg-gray-50 text-gray-500", label: "灰" },
  { value: "bg-cyan-50 text-cyan-600", label: "青" },
  { value: "bg-indigo-50 text-indigo-600", label: "靛" },
] as const;

const iconKeyEnum = z.enum(QUICK_ENTRY_ICON_KEYS);

export const homeBannerUpdateSchema = z.object({
  title: z.string().trim().min(1, "请输入主标题").max(128),
  subtitle: z.string().trim().max(256),
  gradientClass: z.string().trim().min(1).max(256),
});

export type HomeBannerUpdateData = z.infer<typeof homeBannerUpdateSchema>;

export const homeQuickEntryCreateSchema = z.object({
  label: z.string().trim().min(1, "请输入名称").max(64),
  iconKey: iconKeyEnum,
  searchKeyword: z.string().trim().min(1, "请输入搜索关键词").max(128),
  colorClass: z.string().trim().min(1).max(256),
  sortOrder: z.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

export type HomeQuickEntryCreateData = z.infer<typeof homeQuickEntryCreateSchema>;

export const homeQuickEntryUpdateSchema = homeQuickEntryCreateSchema;

export type HomeQuickEntryUpdateData = z.infer<typeof homeQuickEntryUpdateSchema>;

export type HomeBannerPublic = {
  title: string;
  subtitle: string;
  gradientClass: string;
};

export type HomeQuickEntryPublic = {
  id: string;
  label: string;
  iconKey: string;
  searchKeyword: string;
  colorClass: string;
  sortOrder: number;
};

export type HomePageConfig = {
  banner: HomeBannerPublic;
  quickEntries: HomeQuickEntryPublic[];
};
