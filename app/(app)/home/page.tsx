"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  GraduationCap,
  Send,
  Landmark,
  Home as HomeIcon,
  ArrowRight,
  Languages,
  LogOut,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcherSheet } from "@/components/ui/LanguageSwitcherSheet";
import { LANGUAGE_NATIVE_NAME } from "@/lib/i18n";

export default function HomePage() {
  const router = useRouter();
  const { state, signOut } = useAppState();
  const { t, lang } = useTranslation();
  const { profile, passport } = state;
  const [question, setQuestion] = useState("");
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // 로그아웃하면 로그인 화면이 아니라 비로그인 홈으로 나온다. 이제
    // 그쪽이 앱의 문이고, 나가자마자 다시 로그인을 요구받으면 "나갈 수
    // 없는 앱"으로 읽힌다 — 로그아웃한 사람도 질문은 계속 할 수 있다.
    router.replace("/");
    router.refresh();
  }

  const QUICK_ACTIONS = [
    { href: "/tuition", label: t("home.actionTuition"), icon: GraduationCap },
    { href: "/remittance", label: t("home.actionRemittance"), icon: Send },
    { href: "/account", label: t("home.actionAccount"), icon: Landmark },
    { href: "/deposit", label: t("home.actionDeposit"), icon: HomeIcon },
  ];

  function askAgent() {
    const q = question.trim();
    router.push(q ? `/ai?q=${encodeURIComponent(q)}` : "/ai");
  }

  return (
    <AppShell showNav>
      <div className="space-y-6 px-5 pb-10 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Logo height={20} />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong px-3 py-1.5 text-[11px] text-foreground-muted disabled:opacity-50"
            >
              <LogOut className="h-3 w-3" /> {t("more.signOut")}
            </button>
            <button
              type="button"
              onClick={() => setLangSheetOpen(true)}
              className="flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-foreground-muted"
            >
              <Languages className="h-3.5 w-3.5" /> {LANGUAGE_NATIVE_NAME[lang]}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[15px] text-foreground-muted">
            {t("home.greeting", { name: profile.name })}
          </p>
          <h1 className="mt-1 text-[26px] font-bold text-foreground">{t("home.headline")}</h1>
        </div>

        <Card raised className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground-muted">{t("home.currentLimit")}</p>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
              {passport.level}
            </span>
          </div>
          <p className="text-[28px] font-bold text-foreground">
            {passport.currentLimit.toLocaleString()}{" "}
            <span className="text-sm font-normal text-foreground-muted">KRW</span>
          </p>
          <ProgressBar value={(passport.currentLimit / 2000000) * 100} />
          <p className="text-xs text-foreground-subtle">{t("home.limitNote")}</p>
        </Card>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground-muted">{t("home.quickActions")}</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Card className="flex h-24 flex-col justify-between hover:border-border-strong">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[15px] font-medium text-foreground">{label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={askAgent}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
        >
          <input
            value={question}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askAgent();
            }}
            placeholder={t("home.askPlaceholder")}
            className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-foreground-muted"
          />
          <ArrowRight className="h-4 w-4 shrink-0 text-foreground-muted" />
        </button>
      </div>

      <LanguageSwitcherSheet open={langSheetOpen} onClose={() => setLangSheetOpen(false)} />
    </AppShell>
  );
}
