"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import "server-only";
import { eq, desc, and, ilike } from "drizzle-orm";

import { isAdminEmail } from "@/lib/admin";
import { getCurrentUser } from "@/server/auth/require-auth";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import {
  adminProductCreateSchema,
  adminProductUpdateSchema,
  type AdminProductFilters,
} from "@/types/admin-product-types";

function revalidateProductPaths() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/admin/products");
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

async function generateUniqueBusinessId(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const businessId = `P${randomBytes(5).toString("hex").toUpperCase().slice(0, 10)}`;
    const [row] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.businessId, businessId))
      .limit(1);
    if (!row) return businessId;
  }
  throw new Error("无法生成商品编号");
}

export async function listAdminProducts(filters?: AdminProductFilters) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const conditions = [];
    if (filters?.keyword?.trim()) {
      conditions.push(ilike(products.name, `%${filters.keyword.trim()}%`));
    }
    if (filters?.category?.trim()) {
      conditions.push(eq(products.category, filters.category.trim()));
    }
    if (filters?.status === "active" || filters?.status === "inactive") {
      conditions.push(eq(products.status, filters.status));
    }

    const base = db
      .select({
        id: products.id,
        businessId: products.businessId,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        category: products.category,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products);

    const data =
      conditions.length > 0
        ? await base
            .where(and(...conditions))
            .orderBy(desc(products.updatedAt))
            .limit(5000)
        : await base.orderBy(desc(products.updatedAt)).limit(5000);

    return { success: true, data };
  } catch (error) {
    console.error("Failed to list admin products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败",
    };
  }
}

export async function createAdminProduct(payload: unknown) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const validated = adminProductCreateSchema.parse(payload);
    const businessId = await generateUniqueBusinessId();
    const now = new Date();

    const [created] = await db
      .insert(products)
      .values({
        businessId,
        name: validated.name,
        description: validated.description ?? null,
        price: validated.price,
        stock: validated.stock,
        imageUrl: validated.imageUrl?.trim() || null,
        category: validated.category?.trim() || null,
        status: validated.status,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: products.id,
        businessId: products.businessId,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        category: products.category,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      });

    revalidateProductPaths();
    revalidatePath(`/product/${businessId}`);

    return { success: true, data: created };
  } catch (error) {
    console.error("Failed to create product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "创建失败",
    };
  }
}

export async function updateAdminProductByBusinessId(businessId: string, payload: unknown) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const validated = adminProductUpdateSchema.parse(payload);
    const now = new Date();

    const [updated] = await db
      .update(products)
      .set({
        name: validated.name,
        description: validated.description ?? null,
        price: validated.price,
        stock: validated.stock,
        imageUrl: validated.imageUrl?.trim() || null,
        category: validated.category?.trim() || null,
        status: validated.status,
        updatedAt: now,
      })
      .where(eq(products.businessId, businessId))
      .returning({
        id: products.id,
        businessId: products.businessId,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        category: products.category,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      });

    if (!updated) {
      return { success: false, error: "商品不存在" };
    }

    revalidateProductPaths();
    revalidatePath(`/product/${businessId}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "更新失败",
    };
  }
}

export async function deleteAdminProductByBusinessId(businessId: string) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return { success: false, error: gate.error };
  }

  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.businessId, businessId))
      .returning({ businessId: products.businessId });

    if (!deleted) {
      return { success: false, error: "商品不存在" };
    }

    revalidateProductPaths();
    revalidatePath(`/product/${businessId}`);

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "删除失败",
    };
  }
}
