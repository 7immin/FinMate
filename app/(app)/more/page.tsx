"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Bell, FileText, LifeBuoy, LogOut, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { LanguageSwitcherSheet } from "@/components/ui/LanguageSwitcherSheet";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function MorePage() {
  const router = useRouter();
  const { signOut } = useAppState();
  const { t } = useTranslation();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const MENU = [
    { label: t("more.menu.language"), icon: Globe, onClick: () => setLangSheetOpen(true) },
    { label: t("more.menu.notifications"), icon: Bell },
    { label: t("more.menu.terms"), icon: FileText },
    { label: t("more.menu.support"), icon: LifeBuoy },
  ];

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // 로그아웃하면 로그인 화면이 아니라 비로그인 홈으로 나온다. 이제
    // 그쪽이 앱의 문이고, 나가자마자 다시 로그인을 요구받으면 "나갈 수
    // 없는 앱"으로 읽힌다 — 로그아웃한 사람도 질문은 계속 할 수 있다.
    router.replace("/");
    router.refresh();
  }

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
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-danger disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span className="text-[15px] font-medium">{t("more.signOut")}</span>
        </button>
      </div>

      <LanguageSwitcherSheet open={langSheetOpen} onClose={() => setLangSheetOpen(false)} />
    </AppShell>
  );
}
