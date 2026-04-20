"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User,
  LogIn,
  LogOut,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
  { icon: Package, label: "我的订单", href: "#" },
  { icon: Heart, label: "我的收藏", href: "#" },
  { icon: MapPin, label: "收货地址", href: "#" },
  { icon: Settings, label: "设置", href: "#" },
];

export default function MePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const items = session?.user?.isAdmin
    ? [{ icon: LayoutDashboard, label: "管理后台", href: "/admin/products" }, ...menuItems]
    : menuItems;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("已退出登录");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* User Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pb-8 pt-12 text-white">
        {session?.user ? (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold">{session.user.name || "用户"}</p>
              <p className="text-sm text-white/70">{session.user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => router.push("/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                登录 / 注册
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="-mt-4 mx-4 rounded-xl bg-white shadow-sm">
        {items.map((item, index) => {
          const rowClass = `flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 ${
            index < items.length - 1 ? "border-b border-gray-100" : ""
          }`;
          const inner = (
            <>
              <item.icon className="h-5 w-5 text-gray-500" />
              <span className="flex-1 text-sm text-gray-800">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </>
          );
          return item.href !== "#" ? (
            <Link key={item.label} href={item.href} className={rowClass}>
              {inner}
            </Link>
          ) : (
            <button key={item.label} type="button" className={rowClass}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      {session?.user && (
        <div className="mt-6 px-4">
          <Button variant="outline" className="w-full rounded-xl" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      )}
    </div>
  );
}
