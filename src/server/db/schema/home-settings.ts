import { pgTable, uuid, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";

/** 首页横幅（单行，id 固定为 default） */
export const homeBannerConfig = pgTable("home_banner_config", {
  id: varchar("id", { length: 32 }).primaryKey(),
  title: varchar("title", { length: 128 }).notNull(),
  subtitle: varchar("subtitle", { length: 256 }).notNull(),
  /** Tailwind gradient 类名片段，如 from-pink-500 to-rose-500 */
  gradientClass: varchar("gradient_class", { length: 256 }).notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** 首页金刚区入口 */
export const homeQuickEntries = pgTable("home_quick_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: varchar("label", { length: 64 }).notNull(),
  iconKey: varchar("icon_key", { length: 32 }).notNull(),
  /** 跳转搜索页时的 keyword 参数 */
  searchKeyword: varchar("search_keyword", { length: 128 }).notNull(),
  /** 图标容器 Tailwind 类，如 bg-pink-50 text-pink-500 */
  colorClass: varchar("color_class", { length: 256 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
