/**
 * 初始化演示数据：用户（普通 + 管理员，含密码哈希）与商品（含图片 URL）。
 * 用法：pnpm db:seed（需先配置 .env.local 中的 DATABASE_URL，并已执行迁移或 push）
 */
import bcrypt from "bcryptjs";
import { and, count, eq, inArray, notInArray } from "drizzle-orm";

import { DEFAULT_HOME_BANNER, DEFAULT_HOME_QUICK_ENTRIES } from "@/lib/home-config-defaults";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { closeDb, db } from "@/server/db";
import { homeBannerConfig, homeQuickEntries, products, users } from "@/server/db/schema";

/** 与 seed 配套；须与 `src/lib/admin.ts` 默认 ADMIN_EMAILS 中的管理员邮箱一致 */
const SEED_ACCOUNTS = [
  {
    id: "1",
    email: "user@example.com",
    name: "普通用户",
    password: "user123",
    role: "普通用户" as const,
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "管理员",
    password: "admin123",
    role: "管理员" as const,
  },
];

async function seedUsers() {
  const seedIds = SEED_ACCOUNTS.map((a) => a.id);
  const seedEmails = SEED_ACCOUNTS.map((a) => a.email);

  // 释放「种子邮箱」但 id 非种子 id 的旧行，否则会出现 email 唯一与固定 id 插入同时冲突
  await db
    .delete(users)
    .where(and(inArray(users.email, seedEmails), notInArray(users.id, seedIds)));

  for (const account of SEED_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await db
      .insert(users)
      .values({
        id: account.id,
        email: account.email,
        name: account.name,
        passwordHash,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: account.email,
          name: account.name,
          passwordHash,
          updatedAt: new Date(),
        },
      });
  }
}

function printAccountSummary() {
  const line = "─".repeat(56);
  console.log("");
  console.log(line);
  console.log("[seed] 初始化账号（生产环境请立即修改密码）");
  console.log(line);
  for (const a of SEED_ACCOUNTS) {
    const tag = a.role === "管理员" ? "（登录后进入管理后台）" : "（商城前台）";
    console.log(`  ${a.role.padEnd(6)}  ${a.email}`);
    console.log(`         密码: ${a.password}  ${tag}`);
  }
  console.log(line);
  console.log("");
}

async function seedProducts() {
  let n = 0;
  for (const p of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values({
        businessId: p.businessId,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        category: p.category,
        status: p.status,
      })
      .onConflictDoUpdate({
        target: products.businessId,
        set: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
          category: p.category,
          status: p.status,
          updatedAt: new Date(),
        },
      });
    n += 1;
  }
  console.log(`[seed] products: ${n} rows (business_id upsert)`);
}

const HOME_BANNER_ROW_ID = "default";

async function seedHomePage() {
  const [bannerExists] = await db
    .select({ id: homeBannerConfig.id })
    .from(homeBannerConfig)
    .where(eq(homeBannerConfig.id, HOME_BANNER_ROW_ID))
    .limit(1);

  if (!bannerExists) {
    const now = new Date();
    await db.insert(homeBannerConfig).values({
      id: HOME_BANNER_ROW_ID,
      title: DEFAULT_HOME_BANNER.title,
      subtitle: DEFAULT_HOME_BANNER.subtitle,
      gradientClass: DEFAULT_HOME_BANNER.gradientClass,
      updatedAt: now,
    });
    console.log("[seed] home_banner_config: inserted default row");
  }

  const [entryCountRow] = await db.select({ n: count() }).from(homeQuickEntries);
  const entryCount = Number(entryCountRow?.n ?? 0);
  if (entryCount === 0) {
    const now = new Date();
    for (const e of DEFAULT_HOME_QUICK_ENTRIES) {
      await db.insert(homeQuickEntries).values({
        label: e.label,
        iconKey: e.iconKey,
        searchKeyword: e.searchKeyword,
        colorClass: e.colorClass,
        sortOrder: e.sortOrder,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`[seed] home_quick_entries: ${DEFAULT_HOME_QUICK_ENTRIES.length} rows`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[seed] DATABASE_URL is missing. Set it in .env.local");
    process.exit(1);
  }

  console.log("[seed] start");
  await seedUsers();
  printAccountSummary();
  await seedHomePage();
  await seedProducts();
  console.log("[seed] done");
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
    if (process.exitCode) process.exit(process.exitCode);
  });
