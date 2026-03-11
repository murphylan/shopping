"use client";

import { useRouter } from "next/navigation";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  type ActionImpl,
} from "kbar";
import { Search, Package, ShoppingCart, Home } from "lucide-react";

function SearchResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === "string") {
          return (
            <div className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {item}
            </div>
          );
        }
        const action = item as ActionImpl;
        return (
          <div className={`flex items-center gap-3 px-4 py-3 ${active ? "bg-accent" : ""}`}>
            {action.icon}
            <span className="text-sm">{action.name}</span>
          </div>
        );
      }}
      maxHeight={400}
    />
  );
}

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = [
    {
      id: "home",
      name: "首页",
      shortcut: ["h"],
      keywords: "首页 home",
      perform: () => router.push("/"),
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: "products",
      name: "商品列表",
      shortcut: ["p"],
      keywords: "商品 products",
      perform: () => router.push("/products"),
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "search",
      name: "商品搜索",
      shortcut: ["s"],
      keywords: "搜索 search",
      perform: () => router.push("/search"),
      icon: <Search className="h-4 w-4" />,
    },
    {
      id: "cart",
      name: "购物车",
      shortcut: ["c"],
      keywords: "购物车 cart",
      perform: () => router.push("/cart"),
      icon: <ShoppingCart className="h-4 w-4" />,
    },
  ];

  return (
    <KBarProvider actions={actions}>
      {children}
      <KBarPortal>
        <KBarPositioner className="z-50 bg-black/50">
          <KBarAnimator className="w-full max-w-lg overflow-hidden rounded-lg border bg-background shadow-lg">
            <div className="flex items-center border-b px-4">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <KBarSearch
                className="flex-1 bg-transparent py-3 pl-3 text-sm outline-none"
                placeholder="搜索或输入命令..."
              />
            </div>
            <SearchResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>
  );
}
