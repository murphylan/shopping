"use client";

import { useProducts } from "@/hooks/use-products";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";
import { useCallback } from "react";

export default function ProductsPage() {
  const { products, isPending } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 flex h-11 shrink-0 items-center bg-white px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="flex-1 text-center text-base font-medium text-gray-900">全部商品</h1>
        <Link href="/cart" className="flex h-8 w-8 items-center justify-center">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
        </Link>
      </div>

      {/* Product Grid */}
      {isPending ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Package className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-400">暂无商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3">
          {products.map((product) => (
            <div key={product.businessId} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="relative aspect-square bg-gray-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
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
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm leading-tight text-gray-800">{product.name}</h3>
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
    </div>
  );
}
