import { useQuery } from "@tanstack/react-query";

import { getDefaultHomePageConfig } from "@/lib/home-config-defaults";
import { getHomePageConfig } from "@/server/actions/homeConfigAction";

export function useHomePageConfig() {
  return useQuery({
    queryKey: ["home-page-config"],
    queryFn: async () => {
      const res = await getHomePageConfig();
      if (!res.success) {
        return getDefaultHomePageConfig();
      }
      return res.data;
    },
    staleTime: 60_000,
  });
}
