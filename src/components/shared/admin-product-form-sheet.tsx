"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { adminProductCreateSchema, type AdminProductCreateData } from "@/types/admin-product-types";
import type { Product } from "@/types/product-types";

const defaultValues: AdminProductCreateData = {
  name: "",
  description: "",
  price: "0",
  stock: 0,
  imageUrl: "",
  category: "",
  status: "active",
};

type FormMode = "create" | "edit";

interface AdminProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FormMode;
  product: Product | null;
  isSubmitting: boolean;
  onSubmit: (data: AdminProductCreateData) => void | Promise<void>;
}

export function AdminProductFormSheet({
  open,
  onOpenChange,
  mode,
  product,
  isSubmitting,
  onSubmit,
}: AdminProductFormSheetProps) {
  const form = useForm<AdminProductCreateData>({
    resolver: zodResolver(adminProductCreateSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: String(product.price),
        stock: product.stock,
        imageUrl: product.imageUrl ?? "",
        category: product.category ?? "",
        status: product.status === "inactive" ? "inactive" : "active",
      });
    } else if (mode === "create") {
      form.reset(defaultValues);
    }
  }, [open, mode, product, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-gray-900">
            {mode === "create" ? "新建商品" : "编辑商品"}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">商品名称</FormLabel>
                  <FormControl>
                    <Input className="h-9" placeholder="名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">描述</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] resize-none"
                      placeholder="可选"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm text-gray-700">价格（元）</FormLabel>
                    <FormControl>
                      <Input className="h-9" inputMode="decimal" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem className="w-28">
                    <FormLabel className="text-sm text-gray-700">库存</FormLabel>
                    <FormControl>
                      <Input
                        className="h-9"
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">分类</FormLabel>
                  <FormControl>
                    <Input
                      className="h-9"
                      placeholder="可选"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">图片 URL</FormLabel>
                  <FormControl>
                    <Input
                      className="h-9"
                      placeholder="https://…"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">状态</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">上架</SelectItem>
                      <SelectItem value="inactive">下架</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="mt-auto gap-2 border-t bg-background p-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中…
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
