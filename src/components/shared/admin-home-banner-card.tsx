"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAdminHomeBanner } from "@/hooks/use-admin-home-config";
import {
  BANNER_GRADIENT_PRESETS,
  homeBannerUpdateSchema,
  type HomeBannerUpdateData,
} from "@/types/home-config-types";

function GradientPreview({
  control,
  isPending,
}: {
  control: ReturnType<typeof useForm<HomeBannerUpdateData>>["control"];
  isPending: boolean;
}) {
  const gradientClass = useWatch({ control, name: "gradientClass" });
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" className="h-9" disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        保存横幅
      </Button>
      <div
        className={`h-10 min-w-[140px] rounded-lg bg-linear-to-r px-4 py-2 text-sm font-medium text-white ${gradientClass}`}
      >
        预览
      </div>
    </div>
  );
}

const defaultValues: HomeBannerUpdateData = {
  title: "",
  subtitle: "",
  gradientClass: BANNER_GRADIENT_PRESETS[0].value,
};

export function AdminHomeBannerCard() {
  const { banner, isBannerPending, updateBannerMutation } = useAdminHomeBanner();

  const form = useForm<HomeBannerUpdateData>({
    resolver: zodResolver(homeBannerUpdateSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!banner) return;
    const presetValues = BANNER_GRADIENT_PRESETS.map((p) => p.value) as string[];
    const gradientClass = presetValues.includes(banner.gradientClass)
      ? banner.gradientClass
      : BANNER_GRADIENT_PRESETS[0].value;
    form.reset({
      title: banner.title,
      subtitle: banner.subtitle,
      gradientClass,
    });
  }, [banner, form]);

  return (
    <Card className="card-enterprise">
      <CardHeader className="gap-1">
        <CardTitle className="text-base font-semibold text-gray-900">首页横幅</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          对应商城首页顶部渐变横幅文案与配色
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isBannerPending ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载中…
          </div>
        ) : (
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await updateBannerMutation.mutateAsync(values);
                  toast.success("横幅已保存");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "保存失败");
                }
              })}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>主标题</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="例如：新品首发" className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>副标题</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="例如：限时优惠 低至5折" className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradientClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>渐变样式</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 w-full sm:max-w-md">
                          <SelectValue placeholder="选择配色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANNER_GRADIENT_PRESETS.map(
                          (p: (typeof BANNER_GRADIENT_PRESETS)[number]) => (
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
              <GradientPreview control={form.control} isPending={updateBannerMutation.isPending} />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
