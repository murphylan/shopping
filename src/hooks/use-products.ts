import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/server/actions/productAction";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { Product, ProductFilters } from "@/types/product-types";

export function useProducts(filters?: ProductFilters) {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await listProducts(filters);
      if (!res.success) throw new Error(res.error);
      const dbProducts = res.data as Product[];
      if (dbProducts.length > 0) return dbProducts;

      // 数据库无数据时使用 mock 数据，支持关键词过滤
      let mockResult = [...MOCK_PRODUCTS];
      if (filters?.keyword?.trim()) {
        const kw = filters.keyword.trim().toLowerCase();
        mockResult = mockResult.filter(
          (p) =>
            p.name.toLowerCase().includes(kw) ||
            p.category?.toLowerCase().includes(kw) ||
            p.description?.toLowerCase().includes(kw)
        );
      }
      if (filters?.category) {
        mockResult = mockResult.filter((p) => p.category === filters.category);
      }
      return mockResult;
    },
    staleTime: 0,
  });

  return {
    products: data ?? [],
    isPending,
    refetch,
  };
}
