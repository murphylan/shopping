import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHomeQuickEntry,
  deleteHomeQuickEntry,
  getHomePageConfig,
  listAdminHomeQuickEntries,
  updateHomeBanner,
  updateHomeQuickEntry,
} from "@/server/actions/homeConfigAction";
import type { HomeBannerUpdateData, HomeQuickEntryCreateData } from "@/types/home-config-types";

export function useAdminHomeBanner() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["home-page-config"],
    queryFn: async () => {
      const res = await getHomePageConfig();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    staleTime: 0,
  });

  const updateBannerMutation = useMutation({
    mutationFn: async (payload: HomeBannerUpdateData) => {
      const res = await updateHomeBanner(payload);
      if (!res.success) throw new Error(res.error || "保存失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["home-page-config"] });
    },
    onError: (error) => console.error("updateHomeBanner:", error),
  });

  return {
    banner: query.data?.banner,
    isBannerPending: query.isPending,
    updateBannerMutation,
  };
}

export function useAdminHomeQuickEntries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-home-quick-entries"],
    queryFn: async () => {
      const res = await listAdminHomeQuickEntries();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: HomeQuickEntryCreateData) => {
      const res = await createHomeQuickEntry(payload);
      if (!res.success) throw new Error(res.error || "创建失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-home-quick-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["home-page-config"] });
    },
    onError: (error) => console.error("createHomeQuickEntry:", error),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: HomeQuickEntryCreateData }) => {
      const res = await updateHomeQuickEntry(id, payload);
      if (!res.success) throw new Error(res.error || "更新失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-home-quick-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["home-page-config"] });
    },
    onError: (error) => console.error("updateHomeQuickEntry:", error),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteHomeQuickEntry(id);
      if (!res.success) throw new Error(res.error || "删除失败");
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-home-quick-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["home-page-config"] });
    },
    onError: (error) => console.error("deleteHomeQuickEntry:", error),
  });

  return {
    entries: query.data ?? [],
    isPending: query.isPending,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
