"use client";

import { AdminSidebar, AdminSidebarProvider } from "@/components/shared/admin-sidebar";
import { AdminTopNav } from "@/components/shared/admin-top-nav";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-0 flex min-h-0 flex-col overflow-hidden bg-background">
      <AdminSidebarProvider>
        <AdminSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopNav />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-2 pb-4 md:px-6 md:pt-3 md:pb-6">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
          </main>
        </div>
      </AdminSidebarProvider>
    </div>
  );
}
