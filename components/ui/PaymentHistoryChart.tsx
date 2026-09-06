"use client";

import { PaymentRecord } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

const HEIGHT_SEED = [62, 78, 46, 70, 58, 88, 66, 94];

export function PaymentHistoryChart({ records }: { records: PaymentRecord[] }) {
  const { t } = useTranslation();
  const onTimeCount = records.filter((r) => r.onTime).length;
  const overdueCount = records.length - onTimeCount;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t("passport.paymentHistory")}</span>
        <span className="text-xs text-foreground-muted">
          {t("passport.paymentSummary", { onTime: onTimeCount, overdue: overdueCount })}
        </span>
      </div>
      <div className="flex h-24 items-end gap-2" role="img" aria-label={t("passport.chartAriaLabel")}>
        {records.map((record, idx) => {
          const height = HEIGHT_SEED[idx % HEIGHT_SEED.length];
          return (
            <div
              key={`${record.month}-${idx}`}
              title={`${record.month} · ${record.onTime ? t("passport.onTimePayment") : t("passport.overduePayment")}`}
              className="relative flex-1 rounded-t-md bg-primary"
              style={{ height: `${height}%` }}
            >
              {!record.onTime && (
                <div
                  className="absolute inset-0 rounded-t-md bg-[repeating-linear-gradient(135deg,rgba(245,166,35,0.55)_0px,rgba(245,166,35,0.55)_3px,transparent_3px,transparent_7px)] ring-1 ring-inset ring-warning/70"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-foreground-subtle">
        <span>{records[0]?.month}</span>
        <span>{records[records.length - 1]?.month}</span>
      </div>
    </div>
  );
}
