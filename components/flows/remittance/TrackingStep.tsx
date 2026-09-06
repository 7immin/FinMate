"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { RemittanceChannel } from "@/lib/mock/remittance";

export function TrackingStep({
  recipient,
  amount,
  channel,
  onDone,
}: {
  recipient: string;
  amount: number;
  channel: RemittanceChannel;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.tracking.topBarTitle")} closeIcon onBack={onDone} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("remittance.tracking.headline")}</h1>
          <p className="mt-2 text-[15px] text-foreground-muted">
            {t("remittance.tracking.description", {
              recipient,
              amount: amount.toLocaleString(),
              speed: t(`remittance.channel.${channel.id}.speed`),
            })}
          </p>
        </div>

        <Card className="divide-y divide-border">
          <ChecklistRow status="done" label={t("remittance.tracking.received")} hint={t("remittance.tracking.justNow")} />
          <ChecklistRow status="active" label={t("remittance.tracking.processing")} />
          <ChecklistRow status="pending" label={t("remittance.tracking.arrived")} />
        </Card>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onDone}>{t("common.goHome")}</Button>
      </div>
    </div>
  );
}
