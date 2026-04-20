import { useQuery } from "@tanstack/react-query";
import { getProductByBusinessId } from "@/server/actions/productAction";
import type { Product } from "@/types/product-types";

export function useProduct(businessId: string) {
  const { data, isPending } = useQuery({
    queryKey: ["product", businessId],
    queryFn: async () => {
      const res = await getProductByBusinessId(businessId);
      if (!res.success || !res.data) {
        throw new Error(res.error ?? "商品不存在");
      }
      return res.data as Product;
    },
    enabled: !!businessId,
  });

  return { product: data, isPending };
}
