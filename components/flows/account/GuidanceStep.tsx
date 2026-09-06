"use client";

import Link from "next/link";
import { Sparkles, Smartphone, ExternalLink } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StepCard } from "@/components/ui/StepCard";
import { Chip } from "@/components/ui/Chip";
import { DocumentFlags } from "@/lib/types";
import { resolveGuidanceVariant } from "@/lib/mock/account";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { MVNO_HUB_URL } from "@/lib/data/phone";

interface GuidanceContent {
  aiMessage: string;
  steps: { title: string; hint: string }[];
  followUps: string[];
}

export function GuidanceStep({
  documents,
  onNext,
}: {
  documents: DocumentFlags;
  onNext: () => void;
}) {
  const { t, tNode } = useTranslation();
  const variant = resolveGuidanceVariant(documents);
  const { aiMessage, steps, followUps } = tNode<GuidanceContent>(`account.guidance.${variant}`);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("account.guidance.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <Card raised className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <p className="text-[15px] leading-relaxed text-foreground">{aiMessage}</p>
        </Card>

        {/*
          휴대폰 번호가 없으면 창구에서 막힌다. 준비 카드까지 가서야
          알게 되면 이미 지점을 고른 뒤라, 여기서 먼저 말한다.

          안내는 특정 통신사가 아니라 과기정통부가 운영하는 요금제 비교
          사이트로 보낸다 — 어느 통신사를 쓸지는 우리가 고를 일이 아니고,
          유학생에게 필요한 선불·소액 요금제는 거기서 비교하는 편이 낫다.
        */}
        {documents.hasKoreanPhone !== "yes" && (
          <a
            href={MVNO_HUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 rounded-xl border border-warning/45 bg-warning-muted px-4 py-3.5"
          >
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium leading-relaxed text-warning">
                {t("account.guidance.needPhone")}
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-foreground-muted">
                {t("account.guidance.needPhoneHint")}
              </span>
            </span>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-foreground-subtle" />
          </a>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("account.guidance.orderTitle")}</p>
          <div className="space-y-3">
            {steps.map((s, idx) => (
              <StepCard key={s.title} index={idx + 1} title={s.title} description={s.hint} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("account.guidance.followUpTitle")}</p>
          <div className="flex flex-wrap gap-2">
            {followUps.map((q) => (
              <Link key={q} href={`/ai?q=${encodeURIComponent(q)}`}>
                <Chip>{q}</Chip>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onNext}>{t("account.guidance.next")}</Button>
      </div>
    </div>
  );
}
