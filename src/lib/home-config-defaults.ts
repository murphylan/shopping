import type { QuickEntryIconKey } from "@/lib/quick-entry-icons";
import type { HomePageConfig } from "@/types/home-config-types";

/** 数据库无 banner 行时的 fallback（与历史静态配置一致） */
export const DEFAULT_HOME_BANNER = {
  title: "新品首发",
  subtitle: "限时优惠 低至5折",
  gradientClass: "from-pink-500 to-rose-500",
} as const;

/** 种子与默认金刚区（label / searchKeyword） */
export const DEFAULT_HOME_QUICK_ENTRIES: {
  label: string;
  iconKey: QuickEntryIconKey;
  searchKeyword: string;
  colorClass: string;
  sortOrder: number;
}[] = [
  {
    label: "服饰",
    iconKey: "shirt",
    searchKeyword: "服饰",
    colorClass: "bg-pink-50 text-pink-500",
    sortOrder: 0,
  },
  {
    label: "数码",
    iconKey: "smartphone",
    searchKeyword: "数码",
    colorClass: "bg-blue-50 text-blue-500",
    sortOrder: 1,
  },
  {
    label: "美食",
    iconKey: "utensils",
    searchKeyword: "美食",
    colorClass: "bg-orange-50 text-orange-500",
    sortOrder: 2,
  },
  {
    label: "礼物",
    iconKey: "gift",
    searchKeyword: "礼物",
    colorClass: "bg-purple-50 text-purple-500",
    sortOrder: 3,
  },
  {
    label: "美妆",
    iconKey: "sparkles",
    searchKeyword: "美妆",
    colorClass: "bg-rose-50 text-rose-500",
    sortOrder: 4,
  },
  {
    label: "家居",
    iconKey: "sofa",
    searchKeyword: "家居",
    colorClass: "bg-green-50 text-green-500",
    sortOrder: 5,
  },
  {
    label: "图书",
    iconKey: "book",
    searchKeyword: "图书",
    colorClass: "bg-amber-50 text-amber-500",
    sortOrder: 6,
  },
  {
    label: "更多",
    iconKey: "more",
    searchKeyword: "更多",
    colorClass: "bg-gray-50 text-gray-500",
    sortOrder: 7,
  },
];

/** 接口失败或未迁移时，前台使用的完整默认首页配置 */
export function getDefaultHomePageConfig(): HomePageConfig {
  return {
    banner: {
      title: DEFAULT_HOME_BANNER.title,
      subtitle: DEFAULT_HOME_BANNER.subtitle,
      gradientClass: DEFAULT_HOME_BANNER.gradientClass,
    },
    quickEntries: DEFAULT_HOME_QUICK_ENTRIES.map((e, i) => ({
      id: `fallback-${i}`,
      label: e.label,
      iconKey: e.iconKey,
      searchKeyword: e.searchKeyword,
      colorClass: e.colorClass,
      sortOrder: e.sortOrder,
    })),
  };
}
