"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChecklistRow } from "@/components/ui/Checklist";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { RISK_CHECK_IDS } from "@/lib/mock/remittance";

export function CheckStep({
  amount,
  openLimit,
  onUnlock,
  onSendPartial,
  onProceed,
}: {
  amount: number;
  openLimit: number;
  onUnlock: () => void;
  onSendPartial: () => void;
  onProceed: () => void;
}) {
  const { t } = useTranslation();
  const shortfall = Math.max(0, amount - openLimit);
  const sufficient = shortfall === 0;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.check.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <Badge tone={sufficient ? "success" : "warning"}>
          {sufficient ? t("remittance.check.sufficientBadge") : t("remittance.check.insufficientBadge")}
        </Badge>

        <h1 className="text-[22px] font-bold leading-snug text-foreground">
          {sufficient
            ? t("remittance.check.sufficientHeadline")
            : t("remittance.check.insufficientHeadline", { shortfall: shortfall.toLocaleString() })}
        </h1>

        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">{t("remittance.check.wantToSend")}</span>
            <span className="font-semibold text-foreground">{amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">{t("remittance.check.openLimit")}</span>
            <span className="font-semibold text-foreground">{openLimit.toLocaleString()}</span>
          </div>
          <ProgressBar value={(Math.min(openLimit, amount) / amount) * 100} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">{t("remittance.check.available")}</span>
            <span className={sufficient ? "text-success" : "font-semibold text-warning"}>
              {sufficient
                ? `${amount.toLocaleString()}`
                : t("remittance.check.shortfallLabel", { amount: shortfall.toLocaleString() })}
            </span>
          </div>
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("remittance.check.riskTitle")}</p>
          <Card className="divide-y divide-border">
            {RISK_CHECK_IDS.map((check) => (
              <ChecklistRow key={check.id} status={check.status} label={t(`remittance.risk.${check.id}`)} />
            ))}
          </Card>
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        {sufficient ? (
          <Button onClick={onProceed}>{t("remittance.check.proceed")}</Button>
        ) : (
          <>
            <Button onClick={onUnlock}>{t("remittance.check.unlock")}</Button>
            <Button variant="outline" onClick={onSendPartial}>
              {t("remittance.check.sendPartial", { amount: openLimit.toLocaleString() })}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
