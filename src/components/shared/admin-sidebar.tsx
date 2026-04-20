"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LayoutGrid,
  Package,
  Store,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useAdminSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useAdminSidebar must be used inside AdminSidebarProvider");
  return ctx;
}

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">{children}</div>
    </SidebarContext.Provider>
  );
}

const navItems = [
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/home", label: "首页配置", icon: LayoutGrid },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useAdminSidebar();

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-14" : "w-44"
      )}
    >
      <div className="flex h-12 items-center justify-between border-b px-3">
        {!collapsed && (
          <Link href="/admin/products" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="size-5 text-primary" />
            <span>管理后台</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              const linkClasses = cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              );

              const link = (
                <Link href={href} className={linkClasses}>
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );

              return (
                <li key={href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </TooltipProvider>

      <div className="border-t p-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <Store className="size-4 shrink-0" />
                {!collapsed && <span>返回商城</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                返回商城
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}

export function AdminSidebarTrigger() {
  const { collapsed, setCollapsed } = useAdminSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
    >
      <LayoutDashboard className="size-4" />
    </Button>
  );
}
