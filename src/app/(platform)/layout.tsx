import { BottomNav } from "@/components/shared/bottom-nav";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
