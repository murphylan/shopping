import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminProduct,
  deleteAdminProductByBusinessId,
  listAdminProducts,
  updateAdminProductByBusinessId,
} from "@/server/actions/adminProductAction";
import type {
  AdminProductCreateData,
  AdminProductFilters,
  AdminProductUpdateData,
} from "@/types/admin-product-types";
import type { Product } from "@/types/product-types";

export function useAdminProducts(filters?: AdminProductFilters) {
  const queryClient = useQueryClient();

  const { data, isPending, refetch } = useQuery({
    queryKey: ["admin-products", filters],
    queryFn: async () => {
      const res = await listAdminProducts(filters);
      if (!res.success) throw new Error(res.error);
      return res.data as Product[];
    },
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: AdminProductCreateData) => {
      const res = await createAdminProduct(payload);
      if (!res.success) throw new Error(res.error || "创建失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => console.error("创建失败:", error),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: AdminProductUpdateData;
    }) => {
      const res = await updateAdminProductByBusinessId(businessId, payload);
      if (!res.success) throw new Error(res.error || "更新失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => console.error("更新失败:", error),
  });

  const deleteMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const res = await deleteAdminProductByBusinessId(businessId);
      if (!res.success) throw new Error(res.error || "删除失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => console.error("删除失败:", error),
  });

  return {
    products: data ?? [],
    isPending,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
