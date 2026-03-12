"use client";

import { use, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Package,
  Share2,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useProduct } from "@/hooks/use-product";
import { useCartStore } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { product, isPending } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem(
      {
        productId: product.businessId,
        productName: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl ?? undefined,
      },
      quantity
    );
    toast.success(`已加入购物车`);
  }, [addItem, product, quantity]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    addItem(
      {
        productId: product.businessId,
        productName: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl ?? undefined,
      },
      quantity
    );
    router.push("/cart");
  }, [addItem, product, quantity, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <Package className="h-16 w-16 text-gray-300" />
        <p className="text-sm text-gray-500">商品不存在</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-white pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:scale-95"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 512px) 100vw, 512px"
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-20 w-20 text-gray-300" />
          </div>
        )}
      </div>

      {/* Price & Name */}
      <div className="px-4 pt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-red-500">¥</span>
          <span className="text-2xl font-bold text-red-500">{product.price}</span>
        </div>
        <h1 className="mt-2 text-base font-semibold leading-snug text-gray-900">{product.name}</h1>
        {product.category && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {product.category}
          </Badge>
        )}
      </div>

      {/* Service Tags */}
      <div className="mt-4 flex gap-4 border-y border-gray-100 px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Truck className="h-3.5 w-3.5" />
          <span>包邮</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>正品保障</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>7天退换</span>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="px-4 pt-4">
          <h2 className="text-sm font-semibold text-gray-900">商品详情</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.description}</p>
        </div>
      )}

      {/* Stock */}
      <div className="px-4 pt-4">
        <p className="text-xs text-gray-400">库存：{product.stock} 件</p>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white safe-area-bottom">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          {/* Quantity */}
          <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-6 w-6 items-center justify-center rounded active:bg-gray-100"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="flex h-6 w-6 items-center justify-center rounded active:bg-gray-100"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add to Cart */}
          <Button variant="outline" className="flex-1" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            加入购物车
          </Button>

          {/* Buy Now */}
          <Button className="flex-1" onClick={handleBuyNow}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            立即购买
          </Button>
        </div>
      </div>
    </div>
  );
}
