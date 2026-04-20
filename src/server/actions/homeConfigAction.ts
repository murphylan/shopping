"use server";

import { revalidatePath } from "next/cache";
import "server-only";
import { asc, eq } from "drizzle-orm";

import { isAdminEmail } from "@/lib/admin";
import { DEFAULT_HOME_BANNER, DEFAULT_HOME_QUICK_ENTRIES } from "@/lib/home-config-defaults";
import { getCurrentUser } from "@/server/auth/require-auth";
import { db } from "@/server/db";
import { homeBannerConfig, homeQuickEntries } from "@/server/db/schema";
import {
  homeBannerUpdateSchema,
  homeQuickEntryCreateSchema,
  homeQuickEntryUpdateSchema,
  type HomePageConfig,
  type HomeQuickEntryPublic,
} from "@/types/home-config-types";

const BANNER_ROW_ID = "default";

function revalidateHomePaths() {
  revalidatePath("/");
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "未登录" };
  }
  if (!isAdminEmail(user.email)) {
    return { ok: false as const, error: "无权限" };
  }
  return { ok: true as const, user };
}

/** 商城首页用：无需登录 */
export async function getHomePageConfig(): Promise<
  { success: true; data: HomePageConfig } | { success: false; error: string }
> {
  try {
    const [bannerRow] = await db
      .select({
        title: homeBannerConfig.title,
        subtitle: homeBannerConfig.subtitle,
        gradientClass: homeBannerConfig.gradientClass,
      })
      .from(homeBannerConfig)
      .where(eq(homeBannerConfig.id, BANNER_ROW_ID))
      .limit(1);

    const banner = bannerRow ?? {
      title: DEFAULT_HOME_BANNER.title,
      subtitle: DEFAULT_HOME_BANNER.subtitle,
      gradientClass: DEFAULT_HOME_BANNER.gradientClass,
    };

    const rows = await db
      .select({
        id: homeQuickEntries.id,
        label: homeQuickEntries.label,
        iconKey: homeQuickEntries.iconKey,
        searchKeyword: homeQuickEntries.searchKeyword,
        colorClass: homeQuickEntries.colorClass,
        sortOrder: homeQuickEntries.sortOrder,
      })
      .from(homeQuickEntries)
      .where(eq(homeQuickEntries.enabled, true))
      .orderBy(asc(homeQuickEntries.sortOrder), asc(homeQuickEntries.createdAt))
      .limit(5000);

    let quickEntries: HomeQuickEntryPublic[];
    if (rows.length === 0) {
      quickEntries = DEFAULT_HOME_QUICK_ENTRIES.map((e, i) => ({
        id: `fallback-${i}`,
        label: e.label,
        iconKey: e.iconKey,
        searchKeyword: e.searchKeyword,
        colorClass: e.colorClass,
        sortOrder: e.sortOrder,
      }));
    } else {
      quickEntries = rows.map((r) => ({
        id: r.id,
        label: r.label,
        iconKey: r.iconKey,
        searchKeyword: r.searchKeyword,
        colorClass: r.colorClass,
        sortOrder: r.sortOrder,
      }));
    }

    return {
      success: true,
      data: { banner, quickEntries },
    };
  } catch (error) {
    console.error("getHomePageConfig:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "读取失败",
    };
  }
}

export async function updateHomeBanner(payload: unknown) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const validated = homeBannerUpdateSchema.parse(payload);
    const now = new Date();

    await db
      .insert(homeBannerConfig)
      .values({
        id: BANNER_ROW_ID,
        title: validated.title,
        subtitle: validated.subtitle,
        gradientClass: validated.gradientClass,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: homeBannerConfig.id,
        set: {
          title: validated.title,
          subtitle: validated.subtitle,
          gradientClass: validated.gradientClass,
          updatedAt: now,
        },
      });

    revalidateHomePaths();
    return { success: true, data: null };
  } catch (error) {
    console.error("updateHomeBanner:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "保存失败",
    };
  }
}

export async function listAdminHomeQuickEntries() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const rows = await db
      .select({
        id: homeQuickEntries.id,
        label: homeQuickEntries.label,
        iconKey: homeQuickEntries.iconKey,
        searchKeyword: homeQuickEntries.searchKeyword,
        colorClass: homeQuickEntries.colorClass,
        sortOrder: homeQuickEntries.sortOrder,
        enabled: homeQuickEntries.enabled,
        updatedAt: homeQuickEntries.updatedAt,
      })
      .from(homeQuickEntries)
      .orderBy(asc(homeQuickEntries.sortOrder), asc(homeQuickEntries.createdAt))
      .limit(5000);

    return { success: true, data: rows };
  } catch (error) {
    console.error("listAdminHomeQuickEntries:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败",
    };
  }
}

export async function createHomeQuickEntry(payload: unknown) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const validated = homeQuickEntryCreateSchema.parse(payload);
    const now = new Date();

    const [created] = await db
      .insert(homeQuickEntries)
      .values({
        label: validated.label,
        iconKey: validated.iconKey,
        searchKeyword: validated.searchKeyword,
        colorClass: validated.colorClass,
        sortOrder: validated.sortOrder,
        enabled: validated.enabled,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: homeQuickEntries.id,
        label: homeQuickEntries.label,
        iconKey: homeQuickEntries.iconKey,
        searchKeyword: homeQuickEntries.searchKeyword,
        colorClass: homeQuickEntries.colorClass,
        sortOrder: homeQuickEntries.sortOrder,
        enabled: homeQuickEntries.enabled,
        updatedAt: homeQuickEntries.updatedAt,
      });

    revalidateHomePaths();
    return { success: true, data: created };
  } catch (error) {
    console.error("createHomeQuickEntry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建失败",
    };
  }
}

export async function updateHomeQuickEntry(id: string, payload: unknown) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  if (!id?.trim()) {
    return { success: false, error: "缺少 id" };
  }

  try {
    const validated = homeQuickEntryUpdateSchema.parse(payload);
    const now = new Date();

    const [updated] = await db
      .update(homeQuickEntries)
      .set({
        label: validated.label,
        iconKey: validated.iconKey,
        searchKeyword: validated.searchKeyword,
        colorClass: validated.colorClass,
        sortOrder: validated.sortOrder,
        enabled: validated.enabled,
        updatedAt: now,
      })
      .where(eq(homeQuickEntries.id, id.trim()))
      .returning({
        id: homeQuickEntries.id,
        label: homeQuickEntries.label,
        iconKey: homeQuickEntries.iconKey,
        searchKeyword: homeQuickEntries.searchKeyword,
        colorClass: homeQuickEntries.colorClass,
        sortOrder: homeQuickEntries.sortOrder,
        enabled: homeQuickEntries.enabled,
        updatedAt: homeQuickEntries.updatedAt,
      });

    if (!updated) {
      return { success: false, error: "记录不存在" };
    }

    revalidateHomePaths();
    return { success: true, data: updated };
  } catch (error) {
    console.error("updateHomeQuickEntry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新失败",
    };
  }
}

export async function deleteHomeQuickEntry(id: string) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  if (!id?.trim()) {
    return { success: false, error: "缺少 id" };
  }

  try {
    const [deleted] = await db
      .delete(homeQuickEntries)
      .where(eq(homeQuickEntries.id, id.trim()))
      .returning({ id: homeQuickEntries.id });

    if (!deleted) {
      return { success: false, error: "记录不存在" };
    }

    revalidateHomePaths();
    return { success: true, data: deleted };
  } catch (error) {
    console.error("deleteHomeQuickEntry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "删除失败",
    };
  }
}
