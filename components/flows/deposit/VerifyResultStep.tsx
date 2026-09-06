"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LEASE_CONTRACT, REGISTRY_CHECK_IDS } from "@/lib/mock/deposit";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-[15px] font-medium text-foreground">{value}</span>
    </div>
  );
}

export function VerifyResultStep({
  onReduceRisk,
  onAbandon,
}: {
  onReduceRisk: () => void;
  onAbandon: () => void;
}) {
  const { t } = useTranslation();
  const warningCount = REGISTRY_CHECK_IDS.filter((c) => c.status === "warning").length;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("deposit.verify.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <Badge tone="warning">{t("deposit.verify.warningBadge", { count: warningCount })}</Badge>

        <h1 className="whitespace-pre-line text-[22px] font-bold leading-snug text-foreground">
          {t("deposit.verify.headline")}
        </h1>

        <Card className="divide-y divide-border">
          <InfoRow label={t("deposit.verify.address")} value={LEASE_CONTRACT.address} />
          <InfoRow label={t("deposit.verify.deposit")} value={`${LEASE_CONTRACT.deposit.toLocaleString()} KRW`} />
          <InfoRow
            label={t("deposit.verify.rent")}
            value={`${LEASE_CONTRACT.rent.toLocaleString()} KRW · ${LEASE_CONTRACT.rentDay}`}
          />
          <InfoRow label={t("deposit.verify.period")} value={LEASE_CONTRACT.period} />
        </Card>

        <div className="space-y-1">
          {REGISTRY_CHECK_IDS.map((check) => (
            <Card key={check.id} className={check.status === "warning" ? "bg-warning-muted" : undefined}>
              <ChecklistRow status={check.status} label={t(`deposit.registry.${check.id}.label`)} />
              <p className="pl-8 text-sm leading-relaxed text-foreground-muted">
                {t(`deposit.registry.${check.id}.detail`)}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button onClick={onReduceRisk}>{t("deposit.verify.reduceRisk")}</Button>
        <button type="button" onClick={onAbandon} className="w-full text-center text-sm text-foreground-muted">
          {t("deposit.verify.abandon")}
        </button>
      </div>
    </div>
  );
}
