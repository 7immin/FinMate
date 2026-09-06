"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SegmentedProgress } from "@/components/ui/ProgressBar";
import { ChecklistRow } from "@/components/ui/Checklist";
import { PaymentHistoryChart } from "@/components/ui/PaymentHistoryChart";
import { ReportView } from "@/components/flows/passport/ReportView";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LEVEL_ORDER } from "@/lib/mock/passport-levels";

export default function PassportPage() {
  const { state, toggleChecklistItem, pendingRequests } = useAppState();
  const { t, tOpt, tShared, lang } = useTranslation();
  const { passport, profile } = state;
  const [viewingReport, setViewingReport] = useState(false);

  const levelOrder = LEVEL_ORDER.indexOf(passport.level) + 1;
  const isMature = passport.level === "S3" || passport.level === "S4";
  const nextLevelLabel = passport.level === "S4" ? null : LEVEL_ORDER[levelOrder];
  const firstPending = passport.nextLevelChecklist.find((item) => !item.done);

  function handleCta() {
    if (isMature) {
      setViewingReport(true);
      return;
    }
    if (firstPending) toggleChecklistItem(firstPending.id);
  }

  const ctaLabel = isMature
    ? t(`passport.cta.${passport.level}`)
    : firstPending
      ? t(`passport.checklist.${firstPending.id}.cta`)
      : t(`passport.checklist.${passport.nextLevelChecklist[0]?.id}.cta`);

  if (viewingReport) {
    return (
      <AppShell className="flex flex-col">
        <ReportView
          profile={profile}
          passport={passport}
          defaultLanguage={lang}
          onClose={() => setViewingReport(false)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell showNav>
      <TopBar title={t("passport.title")} />
      <div className="space-y-6 px-5 pb-10 pt-2">
        <Card raised className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-foreground-subtle">
                {t("passport.label")}
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">{profile.name}</p>
              <p className="mt-0.5 text-sm text-foreground-muted">
                {profile.visaStatus} · {profile.nationalityCode} ·{" "}
                {passport.level === "S1" ? profile.arrivalLabel : tShared("school", profile.school)}
              </p>
            </div>
            <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-bold text-primary">
              {passport.level}
            </span>
          </div>

          <SegmentedProgress segments={4} active={levelOrder} />

          <div>
            <p className="text-sm text-foreground-muted">{t("passport.baseLimit")}</p>
            <p className="text-2xl font-bold text-foreground">
              {passport.currentLimit.toLocaleString()}{" "}
              <span className="text-sm font-normal text-foreground-muted">KRW</span>
            </p>
          </div>
        </Card>

        {/*
          올려 둔 한도 요청. 한도가 즉시 열리지 않으므로, 요청이 어디까지
          갔는지 볼 자리가 없으면 사용자는 "눌렀는데 아무 일도 안 일어났다"고
          느낀다. 승인 여부는 은행이 정하고 결과는 위 한도 숫자에 반영된다.
        */}
        {pendingRequests.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground-muted">
              {t("passport.pendingRequests")}
            </p>
            <Card className="space-y-2.5">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">
                    {t(`passport.report.category.${req.purpose}`)} · +
                    {req.amount.toLocaleString()} KRW
                  </span>
                  <span className="shrink-0 rounded-md bg-warning-muted px-2 py-0.5 text-[11px] font-medium text-warning">
                    {t("passport.requestPending")}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-[12px] leading-relaxed text-foreground-subtle">
                {t("passport.requestHint")}
              </p>
            </Card>
          </div>
        )}

        {nextLevelLabel && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground-muted">
              {t("passport.nextLevelChecklist", { level: nextLevelLabel })}
            </p>
            <Card className="divide-y divide-border">
              {passport.nextLevelChecklist.map((item) => (
                <div key={item.id} className="first:pt-0 last:pb-0">
                  <ChecklistRow
                    status={item.done ? "done" : "pending"}
                    label={t(`passport.checklist.${item.id}.label`)}
                    hint={tOpt(`passport.checklist.${item.id}.hint`)}
                    onClick={() => toggleChecklistItem(item.id)}
                  />
                </div>
              ))}
            </Card>
          </div>
        )}

        {isMature && (
          <Card>
            <PaymentHistoryChart records={passport.paymentHistory} />
          </Card>
        )}

        <Card className="bg-surface-sunken text-sm leading-relaxed text-foreground-muted">
          {t("passport.disclaimer")}
        </Card>

        <Button onClick={handleCta} className="gap-2">
          {isMature && <Download className="h-4 w-4" />}
          {ctaLabel}
        </Button>
      </div>
    </AppShell>
  );
}
