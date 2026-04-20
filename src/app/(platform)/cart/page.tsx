"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Trash2, Minus, Plus, ChevronLeft, Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const productIdsKey = useMemo(() => items.map((i) => i.productId).join("|"), [items]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const idSet = new Set(items.map((i) => i.productId));
      if (idSet.size === 0) return new Set();
      if (prev.size === 0) return idSet;
      const next = new Set<string>();
      for (const id of prev) {
        if (idSet.has(id)) next.add(id);
      }
      for (const id of idSet) {
        if (!next.has(id)) next.add(id);
      }
      return next;
    });
    // 仅当购物车中的商品 id 集合变化时同步；避免 items 引用变化导致重复执行
    // eslint-disable-next-line react-hooks/exhaustive-deps -- items 与 productIdsKey 同步变化
  }, [productIdsKey]);

  const toggleSelect = useCallback((productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.productId));
    });
  }, [items]);

  const selectedTotal = useMemo(
    () =>
      items
        .filter((i) => selectedIds.has(i.productId))
        .reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items, selectedIds]
  );

  const selectedCount = useMemo(
    () => items.filter((i) => selectedIds.has(i.productId)).reduce((sum, i) => sum + i.quantity, 0),
    [items, selectedIds]
  );

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <ShoppingCart className="h-16 w-16 text-gray-300" />
        <p className="text-base font-medium text-gray-500">购物车空空如也</p>
        <p className="text-xs text-gray-400">快去挑选心仪的商品吧</p>
        <Button size="sm" className="mt-2 rounded-full px-8" onClick={() => router.push("/")}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          去逛逛
        </Button>
      </div>
    );
  }

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
        <h1 className="flex-1 text-center text-base font-medium text-gray-900">
          购物车({items.length})
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-gray-400 active:text-gray-600"
        >
          清空
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 space-y-2 p-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 rounded-xl bg-white p-3">
            <Checkbox
              checked={selectedIds.has(item.productId)}
              onCheckedChange={() => toggleSelect(item.productId)}
              className="shrink-0"
            />

            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-gray-300" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
              <p className="line-clamp-2 text-sm text-gray-800">{item.productName}</p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs text-red-500">¥</span>
                  <span className="text-base font-bold text-red-500">{item.price}</span>
                </div>
                <div className="flex items-center rounded-full border border-gray-200">
                  {item.quantity <= 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="flex h-6 w-7 items-center justify-center text-gray-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-6 w-7 items-center justify-center text-gray-500"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span className="min-w-[28px] text-center text-sm font-medium text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="flex h-6 w-7 items-center justify-center text-gray-500"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Checkout Bar */}
      <div className="sticky bottom-16 z-40 flex items-center border-t bg-white px-4 py-2 safe-area-bottom">
        <Checkbox
          checked={selectedIds.size === items.length && items.length > 0}
          onCheckedChange={toggleAll}
          className="shrink-0"
        />
        <span className="ml-2 text-sm text-gray-500">全选</span>
        <div className="flex-1 text-right">
          <span className="text-sm text-gray-600">合计 </span>
          <span className="text-xs text-red-500">¥</span>
          <span className="text-xl font-bold text-red-500">{selectedTotal.toFixed(2)}</span>
        </div>
        <Button disabled={selectedCount === 0} className="ml-4 rounded-full px-6" size="sm">
          结算({selectedCount})
        </Button>
      </div>
    </div>
  );
}
