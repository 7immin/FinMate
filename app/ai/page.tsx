"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { AnswerCard } from "@/components/flows/ai/AnswerCard";
import { resolveAiAnswerKind } from "@/lib/mock/ai-responses";
import { useTranslation } from "@/lib/i18n/useTranslation";

function AiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const question = searchParams.get("q");
  const { t, tNode } = useTranslation();
  const suggested = tNode<string[]>("ai.suggested");
  const [draft, setDraft] = useState("");

  function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/ai?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t("ai.topBarTitle")} />
      <div className="flex-1 px-5 pb-6 pt-2">
        {question ? (
          <AnswerCard question={question} kind={resolveAiAnswerKind(question)} />
        ) : (
          <div className="flex h-full flex-col justify-between">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-[22px] font-bold text-foreground">
                {t("ai.landingHeadline")}
              </h1>
              <p className="mt-2 text-[15px] text-foreground-muted">{t("ai.landingDesc")}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {suggested.map((q) => (
                  <Chip key={q} onClick={() => ask(q)}>
                    {q}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask(draft);
                }}
                placeholder={t("home.askPlaceholder")}
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-foreground-muted"
              />
              <button type="button" onClick={() => ask(draft)} aria-label={t("common.sendQuestion")}>
                <ArrowRight className="h-4 w-4 shrink-0 text-foreground-muted" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function AiPage() {
  return (
    <Suspense fallback={null}>
      <AiPageContent />
    </Suspense>
  );
}
