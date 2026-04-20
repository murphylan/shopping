"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import type { Session } from "next-auth";

import { CommandPalette } from "@/components/command-palette";
import { useCartStore } from "@/hooks/use-cart-store";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
          },
        },
      })
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <CommandPalette>
            <NextTopLoader showSpinner={false} />
            {children}
            <Toaster position="top-center" richColors />
          </CommandPalette>
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
}
