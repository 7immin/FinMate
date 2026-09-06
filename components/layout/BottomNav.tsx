"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, UserRound, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/ai", label: "AI", icon: Sparkles },
  { href: "/profile", label: "내 정보", icon: UserRound },
  { href: "/more", label: "더보기", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-10 flex shrink-0 items-stretch border-t border-border bg-background/95 backdrop-blur">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            <Icon
              className={cn("h-5 w-5", active ? "text-primary" : "text-foreground-subtle")}
              strokeWidth={active ? 2.4 : 2}
            />
            <span
              className={cn(
                "text-[11px]",
                active ? "font-medium text-primary" : "text-foreground-subtle"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
