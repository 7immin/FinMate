import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils/cn";

export function AppShell({
  children,
  showNav = false,
  className,
}: {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-background">
      <main className={cn("flex-1 overflow-y-auto pb-8", className)}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
