"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Bell, FileText, LifeBuoy, RotateCcw, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { LanguageSwitcherSheet } from "@/components/ui/LanguageSwitcherSheet";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function MorePage() {
  const router = useRouter();
  const { resetDemo } = useAppState();
  const { t } = useTranslation();
  const [langSheetOpen, setLangSheetOpen] = useState(false);

  const MENU = [
    { label: t("more.menu.language"), icon: Globe, onClick: () => setLangSheetOpen(true) },
    { label: t("more.menu.notifications"), icon: Bell },
    { label: t("more.menu.terms"), icon: FileText },
    { label: t("more.menu.support"), icon: LifeBuoy },
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

        <button
          type="button"
          onClick={() => {
            resetDemo();
            router.replace("/onboarding");
          }}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-danger"
        >
          <RotateCcw className="h-[18px] w-[18px]" />
          <span className="text-[15px] font-medium">{t("more.resetDemo")}</span>
        </button>
      </div>

      <LanguageSwitcherSheet open={langSheetOpen} onClose={() => setLangSheetOpen(false)} />
    </AppShell>
  );
}
