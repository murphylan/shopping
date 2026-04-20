"use client";

import * as React from "react";
import Link from "next/link";
import { useTopLoader } from "nextjs-toploader";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Store,
  Trash2,
  X,
} from "lucide-react";

import { AdminHomeBannerCard } from "@/components/shared/admin-home-banner-card";
import {
  AdminQuickEntrySheet,
  type AdminQuickEntryRow,
} from "@/components/shared/admin-quick-entry-sheet";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminHomeQuickEntries } from "@/hooks/use-admin-home-config";
import { getQuickEntryIcon } from "@/lib/quick-entry-icons";
import { cn } from "@/lib/utils";
import type { HomeQuickEntryCreateData } from "@/types/home-config-types";

const TABLE_ID = "admin-home-quick";

type SortField = "sortOrder" | "label" | "searchKeyword" | "updatedAt";

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

function QuickEntryActionsCell({
  row,
  onEdit,
  onDeleteClick,
}: {
  row: AdminQuickEntryRow;
  onEdit: (e: AdminQuickEntryRow) => void;
  onDeleteClick: (e: AdminQuickEntryRow) => void;
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
            onEdit(row);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          编辑
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            onDeleteClick(row);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminHomePage() {
  const { start, done } = useTopLoader();
  const { entries, isPending, createMutation, updateMutation, deleteMutation } =
    useAdminHomeQuickEntries();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField | null>("sortOrder");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<AdminQuickEntryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminQuickEntryRow | null>(null);

  const columns = React.useMemo<ColumnDef[]>(
    () => [
      {
        id: "sortOrder",
        label: "排序",
        hideable: true,
        sortable: true,
        sortField: "sortOrder",
      },
      {
        id: "label",
        label: "名称",
        hideable: false,
        sortable: true,
        sortField: "label",
      },
      {
        id: "searchKeyword",
        label: "搜索关键词",
        hideable: true,
        sortable: true,
        sortField: "searchKeyword",
      },
      { id: "enabled", label: "状态", hideable: true },
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

  const filteredEntries = React.useMemo(() => {
    let list = [...entries];
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.searchKeyword.toLowerCase().includes(q) ||
          e.iconKey.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, searchTerm]);

  const sortedEntries = React.useMemo(() => {
    const list = [...filteredEntries];
    if (!sortField) return list;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "sortOrder":
          cmp = a.sortOrder - b.sortOrder;
          break;
        case "label":
          cmp = a.label.localeCompare(b.label);
          break;
        case "searchKeyword":
          cmp = a.searchKeyword.localeCompare(b.searchKeyword);
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
  }, [filteredEntries, sortDirection, sortField]);

  const handleSort = React.useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection(field === "sortOrder" || field === "label" ? "asc" : "desc");
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

  const handleOpenCreate = React.useCallback(() => {
    setSheetMode("create");
    setEditing(null);
    setSheetOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((e: AdminQuickEntryRow) => {
    setSheetMode("edit");
    setEditing(e);
    setSheetOpen(true);
  }, []);

  const handleCreateSubmit = React.useCallback(
    async (data: HomeQuickEntryCreateData) => {
      start();
      try {
        await createMutation.mutateAsync(data);
        toast.success("已创建");
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
    async (data: HomeQuickEntryCreateData) => {
      if (!editing) return;
      start();
      try {
        await updateMutation.mutateAsync({ id: editing.id, payload: data });
        toast.success("已更新");
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

  const handleDelete = React.useCallback(
    async (e: AdminQuickEntryRow): Promise<boolean> => {
      start();
      try {
        await deleteMutation.mutateAsync(e.id);
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">首页配置</h1>
        <p className="text-xs text-muted-foreground">
          配置商城首页横幅与金刚区入口；保存后前台通过 React Query 刷新即可看到效果。
        </p>
      </div>

      <AdminHomeBannerCard />

      <Card className="card-enterprise flex min-h-0 flex-1 flex-col py-0">
        <CardContent className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <LayoutGrid className="h-5 w-5 shrink-0 text-gray-600" />
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">金刚区</h2>
                <p className="text-xs text-muted-foreground">图标、文案与跳转搜索关键词</p>
              </div>
            </div>
            <Button type="button" size="sm" className="shrink-0" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建入口
            </Button>
          </div>

          <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <div className="relative min-w-0 max-w-xl flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="筛选名称、关键词、图标…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 pr-8"
                  aria-label="筛选金刚区"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="清除筛选"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground">共 {sortedEntries.length} 条</span>
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

          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
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
                          {col.id === "actions" ? (
                            <span className="sr-only">{col.label}</span>
                          ) : (
                            col.label
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((row) => {
                    const Icon = getQuickEntryIcon(row.iconKey);
                    return (
                      <tr
                        key={row.id}
                        className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        {isColumnVisible("sortOrder") && (
                          <td className="px-4 py-3 font-mono text-sm text-gray-800">
                            {row.sortOrder}
                          </td>
                        )}
                        {isColumnVisible("label") && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${row.colorClass}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {row.label}
                              </span>
                            </div>
                          </td>
                        )}
                        {isColumnVisible("searchKeyword") && (
                          <td className="px-4 py-3 text-gray-700">{row.searchKeyword}</td>
                        )}
                        {isColumnVisible("enabled") && (
                          <td className="px-4 py-3">
                            {row.enabled ? (
                              <Badge className="bg-green-600 text-white hover:bg-green-600">
                                显示
                              </Badge>
                            ) : (
                              <Badge variant="secondary">隐藏</Badge>
                            )}
                          </td>
                        )}
                        {isColumnVisible("updatedAt") && (
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(row.updatedAt)}
                          </td>
                        )}
                        {isColumnVisible("actions") && (
                          <td className="px-4 py-3">
                            <QuickEntryActionsCell
                              row={row}
                              onEdit={handleOpenEdit}
                              onDeleteClick={(r) => setDeleteTarget(r)}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {sortedEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={visibleColCount}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <LayoutGrid className="h-10 w-10 text-gray-300" />
                          <span>暂无入口，请先新建或执行数据库种子</span>
                          <Button
                            type="button"
                            variant="link"
                            className="text-sm"
                            onClick={handleOpenCreate}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            新建入口
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
            <Link href="/" className="ml-1 text-primary underline-offset-2 hover:underline">
              打开商城首页
            </Link>
            <Store className="ml-2 inline h-3 w-3 text-gray-400" aria-hidden />
          </p>
        </CardContent>
      </Card>

      <AdminQuickEntrySheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        mode={sheetMode}
        entry={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={sheetMode === "create" ? handleCreateSubmit : handleEditSubmit}
      />

      <DeleteConfirm
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        entityName={deleteTarget?.label ?? ""}
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await handleDelete(deleteTarget);
          if (ok) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
