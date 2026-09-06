"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  GraduationCap,
  Home as HomeIcon,
  Landmark,
  Languages,
  LogIn,
  MessageCircle,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcherSheet } from "@/components/ui/LanguageSwitcherSheet";
import { LANGUAGE_NATIVE_NAME } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * 비로그인 홈 — 목업 1a-00.
 *
 * 이 화면이 답하는 것은 "가입해도 되는 앱인가"다. 그래서 로그인 벽을
 * 앞에 세우지 않고, 묻는 것 하나만 먼저 열어 둔다 — 유학생이 이 앱을
 * 찾는 첫 이유가 한도가 아니라 "계좌 어떻게 만들어요" 같은 질문이기
 * 때문이다. 답을 한 번 받아 본 사람만 가입까지 간다.
 *
 * 네 칸은 눌러도 실행되지 않고 로그인으로 보낸다. 목록에서 지우지 않는
 * 이유는, 가입하면 무엇을 할 수 있는지가 이 화면의 두 번째 할 일이기
 * 때문이다. 대신 흐리게(opacity) 두어 "지금은 못 누른다"를 색이 아니라
 * 밝기로 말한다.
 *
 * 하단 탭은 그리지 않는다. 홈 말고 갈 곳이 없는 상태에서 탭 네 개를
 * 띄우면 전부 로그인 벽으로 튕겨 낼 뿐이다.
 */
export function GuestHome() {
  const router = useRouter();
  const { t, tNode, lang } = useTranslation();
  const [question, setQuestion] = useState("");
  const [langSheetOpen, setLangSheetOpen] = useState(false);

  const suggested = tNode<string[]>("guest.suggested") ?? [];

  const LOCKED_ACTIONS = [
    { label: t("home.actionTuition"), icon: GraduationCap },
    { label: t("home.actionRemittance"), icon: Send },
    { label: t("home.actionAccount"), icon: Landmark },
    { label: t("home.actionDeposit"), icon: HomeIcon },
  ];

  function ask(text: string) {
    const q = text.trim();
    router.push(q ? `/guest/ai?q=${encodeURIComponent(q)}` : "/guest/ai");
  }

  return (
    <AppShell>
      <div className="flex min-h-[100dvh] flex-col px-5 pb-8 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Logo height={20} />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/45 bg-primary/[0.12] px-3 py-1.5 text-[11.5px] font-medium text-primary"
            >
              <LogIn className="h-3 w-3" /> {t("guest.login")}
            </button>
            <button
              type="button"
              onClick={() => setLangSheetOpen(true)}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong px-3 py-1.5 text-[11px] text-foreground-muted"
            >
              <Languages className="h-3 w-3" /> {LANGUAGE_NATIVE_NAME[lang]}
            </button>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[13px] text-foreground-muted">{t("guest.noLoginNote")}</p>
          <h1 className="mt-1.5 text-balance text-[25px] font-bold leading-[1.35] tracking-[-0.4px] text-foreground">
            {t("home.headline")}
          </h1>
        </div>

        {/* 묻는 자리. 화면에서 유일하게 테두리가 켜져 있는 곳이라, 로그인
            없이 지금 할 수 있는 일이 무엇인지 설명 없이 읽힌다. */}
        <div className="mt-5 flex items-center gap-2 rounded-[10px] border border-primary/40 bg-primary/[0.08] py-1 pl-3 pr-1">
          <MessageCircle className="h-[17px] w-[17px] shrink-0 text-primary" />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask(question);
            }}
            placeholder={t("guest.askPlaceholder")}
            aria-label={t("guest.askPlaceholder")}
            className="h-10 w-full bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-foreground-muted"
          />
          <button
            type="button"
            onClick={() => ask(question)}
            aria-label={t("common.sendQuestion")}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-primary text-background"
          >
            <ArrowUp className="h-[15px] w-[15px]" />
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {suggested.map((q) => (
            <Chip key={q} onClick={() => ask(q)} className="px-3 py-1.5 text-xs font-normal">
              {q}
            </Chip>
          ))}
        </div>

        <div className="mt-7">
          <p className="text-[11px] font-medium tracking-[0.07em] text-foreground-subtle">
            {t("guest.browseTitle")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {LOCKED_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => router.push("/login")}
                title={t("guest.lockedHint")}
                className="flex flex-col gap-2.5 rounded-lg border border-border p-3.5 text-left opacity-75 transition hover:opacity-100"
              >
                <Icon className="h-[19px] w-[19px] text-foreground-muted" />
                <span className="text-[13px] text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/login")}
          className="mt-auto h-[50px] border-primary text-foreground"
        >
          {t("guest.loginCta")}
          <ArrowRight className="h-[15px] w-[15px] text-primary" />
        </Button>
      </div>

      <LanguageSwitcherSheet open={langSheetOpen} onClose={() => setLangSheetOpen(false)} />
    </AppShell>
  );
}
