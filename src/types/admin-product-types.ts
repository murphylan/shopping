import { z } from "zod";

export interface AdminProductFilters {
  keyword?: string;
  category?: string;
  status?: string;
}

export const adminProductCreateSchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  description: z.string().optional().nullable(),
  price: z.string().min(1, "价格不能为空"),
  stock: z.number().int().min(0, "库存不能为负"),
  imageUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]),
});

export type AdminProductCreateData = z.infer<typeof adminProductCreateSchema>;

export const adminProductUpdateSchema = adminProductCreateSchema;

export type AdminProductUpdateData = z.infer<typeof adminProductUpdateSchema>;
