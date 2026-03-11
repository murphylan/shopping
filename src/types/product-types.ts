import { z } from "zod";

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const productSchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  description: z.string().optional().nullable(),
  price: z.string().min(1, "价格不能为空"),
  stock: z.number().min(0, "库存不能为负"),
  imageUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export interface ProductFilters {
  keyword?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
