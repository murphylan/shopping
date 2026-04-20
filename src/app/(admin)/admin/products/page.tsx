"use client";

import * as React from "react";
import Link from "next/link";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { AdminProductFormSheet } from "@/components/shared/admin-product-form-sheet";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { cn } from "@/lib/utils";
import type { AdminProductCreateData, AdminProductFilters } from "@/types/admin-product-types";
import type { Product } from "@/types/product-types";

const TABLE_ID = "admin-products";

type SortField = "businessId" | "name" | "category" | "price" | "stock" | "updatedAt";

interface ColumnDef {
  id: string;
  label: string;
  hideable: boolean;
  sortable?: boolean;
  sortField?: SortField;
}

function formatDate(value: Date | string) {
  try {
    return new Date(value).toLocaleString("zh-CN");
  } catch {
    return "—";
  }
}

function toTime(value: Date | string): number {
  try {
    return new Date(value).getTime();
  } catch {
    return 0;
  }
}

function AdminProductActionsCell({
  product,
  onEdit,
  onDeleteClick,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDeleteClick: (p: Product) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="操作菜单">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => {
            onEdit(product);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          编辑
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            onDeleteClick(product);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminProductsPage() {
  const { start, done } = useTopLoader();
  const [keywordInput, setKeywordInput] = React.useState("");
  const [filters, setFilters] = React.useState<AdminProductFilters>({});

  const { products, isPending, createMutation, updateMutation, deleteMutation } =
    useAdminProducts(filters);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);

  const [sortField, setSortField] = React.useState<SortField | null>("updatedAt");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const columns = React.useMemo<ColumnDef[]>(
    () => [
      {
        id: "businessId",
        label: "商品编号",
        hideable: true,
        sortable: true,
        sortField: "businessId",
      },
      {
        id: "name",
        label: "名称",
        hideable: false,
        sortable: true,
        sortField: "name",
      },
      {
        id: "category",
        label: "分类",
        hideable: true,
        sortable: true,
        sortField: "category",
      },
      {
        id: "price",
        label: "价格",
        hideable: true,
        sortable: true,
        sortField: "price",
      },
      {
        id: "stock",
        label: "库存",
        hideable: true,
        sortable: true,
        sortField: "stock",
      },
      { id: "status", label: "状态", hideable: true },
      {
        id: "updatedAt",
        label: "更新时间",
        hideable: true,
        sortable: true,
        sortField: "updatedAt",
      },
      { id: "actions", label: "操作", hideable: false },
    ],
    []
  );

  const defaultColumnVisibility = React.useMemo<Record<string, boolean>>(() => ({}), []);

  const [columnVisibility, setColumnVisibility] =
    React.useState<Record<string, boolean>>(defaultColumnVisibility);

  const hasRestoredColVis = React.useRef(false);

  React.useEffect(() => {
    if (hasRestoredColVis.current) return;
    hasRestoredColVis.current = true;
    try {
      const saved = localStorage.getItem(`dt-col-vis-${TABLE_ID}`);
      if (saved) setColumnVisibility(JSON.parse(saved) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (!hasRestoredColVis.current) return;
    try {
      localStorage.setItem(`dt-col-vis-${TABLE_ID}`, JSON.stringify(columnVisibility));
    } catch {
      /* ignore */
    }
  }, [columnVisibility]);

  const isColumnVisible = React.useCallback(
    (columnId: string) => columnVisibility[columnId] !== false,
    [columnVisibility]
  );

  const toggleColumnVisibility = React.useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false,
    }));
  }, []);

  const resetColumnVisibility = React.useCallback(() => {
    setColumnVisibility(defaultColumnVisibility);
    try {
      localStorage.removeItem(`dt-col-vis-${TABLE_ID}`);
    } catch {
      /* ignore */
    }
  }, [defaultColumnVisibility]);

  const isColumnVisibilityModified = React.useMemo(
    () => JSON.stringify(columnVisibility) !== JSON.stringify(defaultColumnVisibility),
    [columnVisibility, defaultColumnVisibility]
  );

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        keyword: keywordInput.trim() || undefined,
      }));
    }, 320);
    return () => window.clearTimeout(t);
  }, [keywordInput]);

  const handleSort = React.useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  const SortIcon = React.useCallback(
    ({ field }: { field: SortField }) => {
      if (sortField !== field) {
        return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
      }
      return sortDirection === "asc" ? (
        <ArrowUp className="ml-1 h-3 w-3" />
      ) : (
        <ArrowDown className="ml-1 h-3 w-3" />
      );
    },
    [sortField, sortDirection]
  );

  const sortedProducts = React.useMemo(() => {
    const list = [...products];
    if (!sortField) return list;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "businessId":
          cmp = a.businessId.localeCompare(b.businessId);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = (a.category ?? "").localeCompare(b.category ?? "");
          break;
        case "price":
          cmp = parseFloat(a.price) - parseFloat(b.price);
          break;
        case "stock":
          cmp = a.stock - b.stock;
          break;
        case "updatedAt":
          cmp = toTime(a.updatedAt) - toTime(b.updatedAt);
          break;
        default:
          cmp = 0;
      }
      if (cmp !== 0) return sortDirection === "asc" ? cmp : -cmp;
      return 0;
    });
    return list;
  }, [products, sortDirection, sortField]);

  const handleCreateSubmit = React.useCallback(
    async (data: AdminProductCreateData) => {
      start();
      try {
        await createMutation.mutateAsync(data);
        toast.success("商品已创建");
        setSheetOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "创建失败");
      } finally {
        done();
      }
    },
    [createMutation, done, start]
  );

  const handleEditSubmit = React.useCallback(
    async (data: AdminProductCreateData) => {
      if (!editing) return;
      start();
      try {
        await updateMutation.mutateAsync({ businessId: editing.businessId, payload: data });
        toast.success("商品已更新");
        setSheetOpen(false);
        setEditing(null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "更新失败");
      } finally {
        done();
      }
    },
    [done, editing, start, updateMutation]
  );

  const handleOpenEdit = React.useCallback((p: Product) => {
    setSheetMode("edit");
    setEditing(p);
    setSheetOpen(true);
  }, []);

  const handleDeleteProduct = React.useCallback(
    async (p: Product): Promise<boolean> => {
      start();
      try {
        await deleteMutation.mutateAsync(p.businessId);
        toast.success("已删除");
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "删除失败");
        return false;
      } finally {
        done();
      }
    },
    [deleteMutation, done, start]
  );

  const visibleColCount = columns.filter((c) => isColumnVisible(c.id)).length;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">商品管理</h1>
          <p className="text-xs text-muted-foreground">维护商品信息、上下架与库存</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setSheetMode("create");
            setEditing(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建商品
        </Button>
      </div>

      <Card className="card-enterprise flex min-h-0 flex-1 flex-col py-0">
        <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <div className="relative min-w-0 max-w-xl flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="admin-product-search"
                  placeholder="搜索商品名称…"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="h-8 pl-8 pr-8"
                  aria-label="搜索商品"
                />
                {keywordInput ? (
                  <button
                    type="button"
                    onClick={() => setKeywordInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="清除搜索"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground">共 {sortedProducts.length} 条</span>
            </div>

            <div className="flex flex-wrap items-end gap-2 sm:justify-end">
              <div className="flex flex-col gap-1">
                <Label htmlFor="admin-product-status" className="text-xs text-muted-foreground">
                  状态
                </Label>
                <Select
                  value={filters.status ?? "all"}
                  onValueChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: v === "all" ? undefined : v,
                    }))
                  }
                >
                  <SelectTrigger id="admin-product-status" className="h-8 w-[140px]">
                    <SelectValue placeholder="全部" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="active">上架</SelectItem>
                    <SelectItem value="inactive">下架</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-dashed">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    列设置
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>显示列</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns
                    .filter((col) => col.hideable)
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={isColumnVisible(col.id)}
                        onCheckedChange={() => toggleColumnVisibility(col.id)}
                      >
                        {col.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  {isColumnVisibilityModified ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={resetColumnVisibility}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        恢复默认
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
                  <tr className="border-b">
                    {columns.map((col) => {
                      if (!isColumnVisible(col.id)) return null;
                      if (col.sortable && col.sortField) {
                        const field = col.sortField;
                        return (
                          <th
                            key={col.id}
                            className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400"
                          >
                            <button
                              type="button"
                              className="inline-flex items-center hover:text-gray-900 dark:hover:text-gray-200"
                              onClick={() => handleSort(field)}
                            >
                              {col.label}
                              <SortIcon field={field} />
                            </button>
                          </th>
                        );
                      }
                      return (
                        <th
                          key={col.id}
                          className={cn(
                            "px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400",
                            col.id === "actions" && "w-[60px]"
                          )}
                        >
                          {col.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr
                      key={product.businessId}
                      className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      {isColumnVisible("businessId") && (
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-700">
                            {product.businessId}
                          </span>
                        </td>
                      )}
                      {isColumnVisible("name") && (
                        <td className="px-4 py-3">
                          <div className="max-w-[220px]">
                            <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {product.name}
                            </p>
                          </div>
                        </td>
                      )}
                      {isColumnVisible("category") && (
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {product.category ?? "—"}
                        </td>
                      )}
                      {isColumnVisible("price") && (
                        <td className="px-4 py-3 text-gray-900">¥{product.price}</td>
                      )}
                      {isColumnVisible("stock") && (
                        <td className="px-4 py-3 text-gray-900">{product.stock}</td>
                      )}
                      {isColumnVisible("status") && (
                        <td className="px-4 py-3">
                          {product.status === "active" ? (
                            <Badge className="bg-green-600 text-white hover:bg-green-600">
                              上架
                            </Badge>
                          ) : (
                            <Badge variant="secondary">下架</Badge>
                          )}
                        </td>
                      )}
                      {isColumnVisible("updatedAt") && (
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(product.updatedAt)}
                        </td>
                      )}
                      {isColumnVisible("actions") && (
                        <td className="px-4 py-3">
                          <AdminProductActionsCell
                            product={product}
                            onEdit={handleOpenEdit}
                            onDeleteClick={(p) => setDeleteTarget(p)}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                  {sortedProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={visibleColCount}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-10 w-10 text-gray-300" />
                          <span>暂无商品</span>
                          <Button
                            type="button"
                            variant="link"
                            className="text-sm"
                            onClick={() => {
                              setSheetMode("create");
                              setEditing(null);
                              setSheetOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            创建第一个商品
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            前台预览：
            <Link href="/products" className="ml-1 text-primary underline-offset-2 hover:underline">
              商品列表
            </Link>
          </p>
        </CardContent>
      </Card>

      <AdminProductFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        mode={sheetMode}
        product={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={sheetMode === "create" ? handleCreateSubmit : handleEditSubmit}
      />

      <DeleteConfirm
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        entityName={deleteTarget?.name ?? ""}
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await handleDeleteProduct(deleteTarget);
          if (ok) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
