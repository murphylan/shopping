"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/hooks/use-cart-store";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Badge } from "@/components/ui/badge";
import {
  Shirt,
  Smartphone,
  UtensilsCrossed,
  Gift,
  Sparkles,
  Sofa,
  BookOpen,
  MoreHorizontal,
  ShoppingCart,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useCallback } from "react";

const categories = [
  { icon: Shirt, label: "服饰", color: "bg-pink-50 text-pink-500" },
  { icon: Smartphone, label: "数码", color: "bg-blue-50 text-blue-500" },
  { icon: UtensilsCrossed, label: "美食", color: "bg-orange-50 text-orange-500" },
  { icon: Gift, label: "礼物", color: "bg-purple-50 text-purple-500" },
  { icon: Sparkles, label: "美妆", color: "bg-rose-50 text-rose-500" },
  { icon: Sofa, label: "家居", color: "bg-green-50 text-green-500" },
  { icon: BookOpen, label: "图书", color: "bg-amber-50 text-amber-500" },
  { icon: MoreHorizontal, label: "更多", color: "bg-gray-50 text-gray-500" },
];

import { MOCK_BANNERS } from "@/lib/mock-data";

export default function HomePage() {
  const { products, isPending } = useProducts();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = useCallback(
    (product: (typeof products)[0]) => {
      addItem({
        productId: product.businessId,
        productName: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl ?? undefined,
      });
      toast.success(`已加入购物车`);
    },
    [addItem]
  );

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 pb-16">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <Image
          src="/images/logo.png"
          alt="H5 小商城"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg"
        />
        <span className="text-base font-semibold text-gray-900">H5 小商城</span>
      </div>

      {/* Banner */}
      <div className="px-4">
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${MOCK_BANNERS[0].bg} px-5 py-6 text-white`}
        >
          <div className="relative z-10">
            <h2 className="text-xl font-bold">{MOCK_BANNERS[0].title}</h2>
            <p className="mt-1 text-sm text-white/80">{MOCK_BANNERS[0].subtitle}</p>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-2 h-20 w-20 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-5">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/search?keyword=${encodeURIComponent(cat.label)}`}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color}`}
              >
                <cat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <h2 className="text-base font-semibold text-gray-900">推荐商品</h2>
        <Link href="/products" className="text-xs text-gray-400">
          查看全部
        </Link>
      </div>

      {/* Product Grid */}
      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Package className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-400">暂无商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-4">
          {products.map((product) => (
            <div key={product.businessId} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <Link href={`/product/${product.businessId}`}>
                <div className="relative aspect-square bg-gray-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 512px) 50vw, 256px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  {product.category && (
                    <Badge
                      variant="secondary"
                      className="absolute left-2 top-2 bg-white/90 text-[10px]"
                    >
                      {product.category}
                    </Badge>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link href={`/product/${product.businessId}`}>
                  <h3 className="line-clamp-2 text-sm leading-tight text-gray-800">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <span className="text-xs text-red-500">¥</span>
                    <span className="text-lg font-bold text-red-500">{product.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white active:scale-95"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
