"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, UserRound, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

const items = [
  { href: "/home", key: "nav.home", icon: Home },
  { href: "/ai", key: "nav.ai", icon: Sparkles },
  { href: "/profile", key: "nav.profile", icon: UserRound },
  { href: "/more", key: "nav.more", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  return (
    <nav className="sticky bottom-0 z-10 flex shrink-0 items-stretch border-t border-border bg-background/95 backdrop-blur">
      {items.map(({ href, key, icon: Icon }) => {
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
              {t(key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
