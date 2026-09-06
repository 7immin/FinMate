"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Landmark, GraduationCap, MessageCircleQuestion, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PROOF_OPTIONS, ProofOption } from "@/lib/mock/remittance";

const ICONS: Record<ProofOption["id"], typeof FileText> = {
  employment: FileText,
  homeRemittance: Landmark,
  scholarship: GraduationCap,
};

export function UnlockStep({ onUnlocked }: { onUnlocked: (option: ProofOption) => void }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(PROOF_OPTIONS[0].id);
  const current = PROOF_OPTIONS.find((o) => o.id === selected)!;
  const askQuestion = t("remittance.unlock.askQuestion");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.unlock.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("remittance.unlock.headline")}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            {t("remittance.unlock.description")}
          </p>
        </div>

        <div className="space-y-3">
          {PROOF_OPTIONS.map((option) => {
            const Icon = ICONS[option.id];
            const active = selected === option.id;
            return (
              <button key={option.id} type="button" onClick={() => setSelected(option.id)} className="block w-full text-left">
                <Card raised={active} className={active ? "border-primary" : undefined}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px] text-primary" />
                      <span className="text-[15px] font-medium text-foreground">
                        {t(`remittance.proof.${option.id}.label`)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-success">
                      +{option.bonus.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[30px] text-sm text-foreground-muted">
                    {t(`remittance.proof.${option.id}.description`)}
                  </p>
                </Card>
              </button>
            );
          })}
        </div>

        <Link href={`/ai?q=${encodeURIComponent(askQuestion)}`}>
          <Card className="flex items-center gap-3">
            <MessageCircleQuestion className="h-[18px] w-[18px] text-primary" />
            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">{t("remittance.unlock.askTitle")}</p>
              <p className="text-sm text-foreground-muted">{t("remittance.unlock.askDesc")}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-subtle" />
          </Card>
        </Link>
      </div>

      <div className="px-5 pb-6">
        <Button onClick={() => onUnlocked(current)}>{t(`remittance.proof.${current.id}.cta`)}</Button>
      </div>
    </div>
  );
}
