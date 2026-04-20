"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QUICK_ENTRY_ICON_KEYS, type QuickEntryIconKey } from "@/lib/quick-entry-icons";
import {
  QUICK_ENTRY_COLOR_PRESETS,
  homeQuickEntryCreateSchema,
  type HomeQuickEntryCreateData,
} from "@/types/home-config-types";

const ICON_LABELS: Record<string, string> = {
  shirt: "服饰",
  smartphone: "数码",
  utensils: "美食",
  gift: "礼物",
  sparkles: "美妆",
  sofa: "家居",
  book: "图书",
  more: "更多",
  package: "包裹",
  laptop: "电脑",
};

const defaultValues: HomeQuickEntryCreateData = {
  label: "",
  iconKey: "package",
  searchKeyword: "",
  colorClass: QUICK_ENTRY_COLOR_PRESETS[0].value,
  sortOrder: 0,
  enabled: true,
};

export type AdminQuickEntryRow = {
  id: string;
  label: string;
  iconKey: string;
  searchKeyword: string;
  colorClass: string;
  sortOrder: number;
  enabled: boolean;
  updatedAt: Date | string;
};

interface AdminQuickEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  entry: AdminQuickEntryRow | null;
  isSubmitting: boolean;
  onSubmit: (data: HomeQuickEntryCreateData) => void | Promise<void>;
}

export function AdminQuickEntrySheet({
  open,
  onOpenChange,
  mode,
  entry,
  isSubmitting,
  onSubmit,
}: AdminQuickEntrySheetProps) {
  const form = useForm<HomeQuickEntryCreateData>({
    resolver: zodResolver(homeQuickEntryCreateSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && entry) {
      const safeIcon = QUICK_ENTRY_ICON_KEYS.includes(entry.iconKey as QuickEntryIconKey)
        ? (entry.iconKey as HomeQuickEntryCreateData["iconKey"])
        : "package";
      const colorPresets = QUICK_ENTRY_COLOR_PRESETS.map((c) => c.value) as string[];
      const safeColor = colorPresets.includes(entry.colorClass)
        ? entry.colorClass
        : QUICK_ENTRY_COLOR_PRESETS[0].value;
      form.reset({
        label: entry.label,
        iconKey: safeIcon,
        searchKeyword: entry.searchKeyword,
        colorClass: safeColor,
        sortOrder: entry.sortOrder,
        enabled: entry.enabled,
      });
    } else if (mode === "create") {
      form.reset({
        ...defaultValues,
        sortOrder: 0,
      });
    }
  }, [open, mode, entry, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-gray-900">
            {mode === "create" ? "新建金刚区入口" : "编辑金刚区入口"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
            })}
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="例如：数码" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>图标</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="选择图标" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QUICK_ENTRY_ICON_KEYS.map((key) => (
                        <SelectItem key={key} value={key}>
                          {ICON_LABELS[key] ?? key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="searchKeyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>搜索关键词</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="跳转搜索页时使用的关键词" className="h-9" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>配色</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="选择配色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {QUICK_ENTRY_COLOR_PRESETS.map(
                        (p: (typeof QUICK_ENTRY_COLOR_PRESETS)[number]) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>排序</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={9999}
                      className="h-9"
                      value={field.value}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const n = raw === "" ? 0 : Number(raw);
                        field.onChange(Number.isNaN(n) ? 0 : n);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-gray-700">在首页显示</FormLabel>
                </FormItem>
              )}
            />

            <SheetFooter className="mt-2 gap-2 sm:justify-start">
              <Button type="submit" className="h-9" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === "create" ? "创建" : "保存"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
