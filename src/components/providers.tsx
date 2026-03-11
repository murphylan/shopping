"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { useState } from "react";
import { CommandPalette } from "@/components/command-palette";

export function Providers({ children }: { children: React.ReactNode }) {
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
    <SessionProvider>
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
