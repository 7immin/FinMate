"use client";

import { MapPin } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { StepCard } from "@/components/ui/StepCard";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PROTECTION_STEP_LOCATION } from "@/lib/mock/deposit";

interface ProtectionStepContent {
  title: string;
  hint: string;
  description: string;
}

export function ProtectionStep({ onConfirm }: { onConfirm: () => void }) {
  const { t, tNode } = useTranslation();
  const steps = tNode<ProtectionStepContent[]>("deposit.protection.steps");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("deposit.protection.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("deposit.protection.headline")}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            {t("deposit.protection.description")}
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <StepCard
              key={step.title}
              index={idx + 1}
              title={step.title}
              hint={step.hint}
              description={step.description}
              tone={idx === 2 ? "primary" : "neutral"}
            >
              {idx === 0 && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs text-foreground-muted">
                  <MapPin className="h-3.5 w-3.5" /> {PROTECTION_STEP_LOCATION}
                </span>
              )}
            </StepCard>
          ))}
        </div>

        <Card className="space-y-1">
          <p className="text-sm font-medium text-foreground-muted">{t("deposit.protection.phraseTitle")}</p>
          <p className="text-[15px] text-foreground">{t("deposit.protection.phrase")}</p>
        </Card>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onConfirm}>{t("deposit.protection.submit")}</Button>
      </div>
    </div>
  );
}
