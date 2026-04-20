import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/server/actions/productAction";
import type { Product, ProductFilters } from "@/types/product-types";

export function useProducts(filters?: ProductFilters) {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await listProducts(filters);
      if (!res.success) throw new Error(res.error);
      return res.data as Product[];
    },
    staleTime: 0,
  });

  return {
    products: data ?? [],
    isPending,
    refetch,
  };
}
