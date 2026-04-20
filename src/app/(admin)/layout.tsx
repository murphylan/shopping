import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminChrome } from "@/components/shared/admin-chrome";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/products");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

  return <AdminChrome>{children}</AdminChrome>;
}
