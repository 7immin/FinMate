"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TuitionInvoice, TUITION_RISK_CHECK_IDS, computeDDay } from "@/lib/mock/tuition";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-[15px] font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ResultStep({
  invoice,
  ocrFailed,
  onConfirm,
  onRetry,
}: {
  invoice: TuitionInvoice;
  ocrFailed?: boolean;
  onConfirm: () => void;
  onRetry: () => void;
}) {
  const { t, tShared } = useTranslation();
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("tuition.result.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        {ocrFailed ? (
          <Card className="flex gap-2.5 bg-warning-muted">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm leading-relaxed text-warning">{t("tuition.result.ocrFailedWarning")}</p>
          </Card>
        ) : (
          <Badge tone="success" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            {t("tuition.result.verifiedBadge")}
          </Badge>
        )}

        <h1 className="text-[22px] font-bold text-foreground">{invoice.title}</h1>

        <Card className="divide-y divide-border">
          <InfoRow label={t("tuition.result.amountLabel")} value={`${invoice.amount.toLocaleString()} KRW`} />
          <InfoRow
            label={t("tuition.result.dueLabel")}
            value={`${invoice.dueDate} ${computeDDay(invoice.dueDate)}`}
          />
          {/* 고지서에서 읽어 낸 기관을 보여준다. 못 읽었을 때만 프로필의
              학교로 떨어진다 — 돈이 어디로 가는지를 우리가 지어내면 안 된다. */}
          <InfoRow
            label={t("tuition.result.recipientLabel")}
            value={invoice.institutionName ?? tShared("school", invoice.recipient)}
          />
          <InfoRow label={t("tuition.result.accountLabel")} value={invoice.virtualAccount} />
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("tuition.result.riskTitle")}</p>
          <Card className="divide-y divide-border">
            {TUITION_RISK_CHECK_IDS.map((id) => (
              <ChecklistRow key={id} status="done" label={t(`tuition.result.risk.${id}`)} />
            ))}
          </Card>
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button onClick={onConfirm}>{t("tuition.result.confirm")}</Button>
        <button
          type="button"
          onClick={onRetry}
          className="w-full text-center text-sm text-foreground-muted"
        >
          {t("tuition.result.retry")}
        </button>
      </div>
    </div>
  );
}
