"use server";

import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import "server-only";
import type { ProductFilters } from "@/types/product-types";

export async function listProducts(filters?: ProductFilters) {
  try {
    const conditions = [eq(products.status, "active")];
    if (filters?.keyword?.trim()) {
      conditions.push(ilike(products.name, `%${filters.keyword.trim()}%`));
    }
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }

    const data = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(5000);

    return { success: true, data };
  } catch (error) {
    console.error("Failed to list products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败",
    };
  }
}

export async function getProductByBusinessId(businessId: string) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.businessId, businessId))
      .limit(1);

    if (!product) {
      return { success: false, error: "商品不存在" };
    }
    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to get product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败",
    };
  }
}

export async function searchProducts(keyword: string) {
  try {
    const data = await db
      .select()
      .from(products)
      .where(and(eq(products.status, "active"), ilike(products.name, `%${keyword.trim()}%`)))
      .orderBy(desc(products.createdAt))
      .limit(50);

    return { success: true, data };
  } catch (error) {
    console.error("Failed to search products:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "搜索失败",
    };
  }
}
