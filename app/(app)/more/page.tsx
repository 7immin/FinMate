"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Bell, FileText, LifeBuoy, ChevronRight, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { LanguageSwitcherSheet } from "@/components/ui/LanguageSwitcherSheet";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function MorePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [langSheetOpen, setLangSheetOpen] = useState(false);

  const MENU = [
    // 학교 등록 일정은 학비 흐름의 출발점이지만 매번 보는 화면은 아니다.
    { label: t("notice.menuLabel"), icon: CalendarClock, onClick: () => router.push("/notice") },
    { label: t("more.menu.language"), icon: Globe, onClick: () => setLangSheetOpen(true) },
    { label: t("more.menu.notifications"), icon: Bell, onClick: () => router.push("/more/notifications") },
    { label: t("more.menu.terms"), icon: FileText, onClick: () => router.push("/more/terms") },
    { label: t("more.menu.support"), icon: LifeBuoy, onClick: () => router.push("/more/support") },
  ];

  return (
    <AppShell showNav>
      <div className="space-y-6 px-5 pb-10 pt-8">
        <h1 className="text-[22px] font-bold text-foreground">{t("more.title")}</h1>

        <Card className="divide-y divide-border">
          {MENU.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
            >
              <Icon className="h-[18px] w-[18px] text-foreground-muted" />
              <span className="flex-1 text-[15px] text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
            </button>
          ))}
        </Card>
      </div>

      <LanguageSwitcherSheet open={langSheetOpen} onClose={() => setLangSheetOpen(false)} />
    </AppShell>
  );
}
