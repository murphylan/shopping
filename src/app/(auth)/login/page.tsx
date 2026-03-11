"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LogIn, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@example.com", password: "demo123" },
  });

  const onSubmit = async (values: LoginFormData) => {
    setIsPending(true);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.ok) {
        toast.success("登录成功");
        router.push(callbackUrl);
      } else {
        toast.error(res?.error ?? "登录失败");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Logo Area */}
      <div className="flex flex-col items-center gap-3 px-8 pt-16 pb-8">
        <img
          src="https://avatars.githubusercontent.com/u/112583176?s=48&v=4"
          alt="H5 小商城"
          className="h-16 w-16 rounded-2xl"
        />
        <h1 className="text-xl font-bold text-gray-900">H5 小商城</h1>
        <p className="text-sm text-gray-400">登录后享受完整购物体验</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">邮箱</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="请输入邮箱"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="mt-2 h-11 rounded-xl text-base">
              <LogIn className="mr-2 h-4 w-4" />
              {isPending ? "登录中..." : "登录"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-xs text-gray-400">
          演示账号: demo@example.com / demo123
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
