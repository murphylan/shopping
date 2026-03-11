"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/search", icon: Search, label: "搜索" },
  { href: "/cart", icon: ShoppingCart, label: "购物车", showBadge: true },
  { href: "/me", icon: User, label: "我的" },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur-sm safe-area-bottom">
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                isActive ? "text-primary font-medium" : "text-gray-400 active:text-gray-600"
              )}
            >
              <span className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                {item.showBadge && itemCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
