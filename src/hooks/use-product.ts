import { useQuery } from "@tanstack/react-query";
import { getProductByBusinessId } from "@/server/actions/productAction";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/types/product-types";

export function useProduct(businessId: string) {
  const { data, isPending } = useQuery({
    queryKey: ["product", businessId],
    queryFn: async () => {
      const res = await getProductByBusinessId(businessId);
      if (res.success && res.data) return res.data as Product;

      const mock = MOCK_PRODUCTS.find((p) => p.businessId === businessId);
      if (mock) return mock;

      throw new Error(res.error ?? "商品不存在");
    },
    enabled: !!businessId,
  });

  return { product: data, isPending };
}
