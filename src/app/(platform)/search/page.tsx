"use client";

import { Suspense, useCallback } from "react";
import { useQueryState } from "nuqs";
import { useProducts } from "@/hooks/use-products";
import { Badge } from "@/components/ui/badge";
import { Search, X, ShoppingCart, Package } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";

const hotKeywords = ["手机", "耳机", "T恤", "零食", "护肤", "家居"];

function SearchContent() {
  const [keyword, setKeyword] = useQueryState("keyword", { defaultValue: "" });
  const { products, isPending } = useProducts(
    keyword?.trim() ? { keyword: keyword.trim() } : undefined
  );
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-white px-4 pb-3 pt-3">
        <div className="relative flex items-center rounded-full bg-gray-100">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索商品"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value || null)}
            autoFocus
            className="h-9 w-full rounded-full bg-transparent pl-9 pr-9 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword(null)}
              className="absolute right-3 text-gray-400 active:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : keyword?.trim() ? (
        products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Search className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-400">未找到「{keyword}」相关商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {products.map((product) => (
              <div
                key={product.businessId}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
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
                  <h3 className="line-clamp-2 text-sm leading-tight text-gray-800">
                    {product.name}
                  </h3>
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
        )
      ) : (
        /* Hot Keywords */
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700">热门搜索</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {hotKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setKeyword(kw)}
                className="rounded-full bg-white px-4 py-1.5 text-sm text-gray-600 shadow-sm active:bg-gray-50"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
