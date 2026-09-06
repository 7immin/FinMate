"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

// 항목마다 "완료"가 실제로 무슨 의미인지가 다르다:
// - 문서 검증: 실물 서류를 올리면 OCR로 확인 → /passport/verify/[id]로 보낸다
// - 수동 토글: 아직 실제 인증(SMS 등)을 붙이지 못해 탭하면 바로 완료 처리
// - 자동: 사용자가 할 일이 없다. 시간이나 실거래가 쌓이면 저절로 체크된다
const DOCUMENT_VERIFY_ITEMS = ["passport-verify", "korean-account", "overdue-clear"];
const MANUAL_TOGGLE_ITEMS = ["phone-verify"];
const TRANSACTION_ITEMS = ["first-purpose-tx", "purpose-tx-2"];

export default function PassportPage() {
  const router = useRouter();
  const { state, toggleChecklistItem, pendingRequests } = useAppState();
  const { t, tOpt, tShared, lang } = useTranslation();
  const { passport, profile } = state;
  const [viewingReport, setViewingReport] = useState(false);

  const levelOrder = LEVEL_ORDER.indexOf(passport.level) + 1;
  const isMature = passport.level === "S3" || passport.level === "S4";
  const nextLevelLabel = passport.level === "S4" ? null : LEVEL_ORDER[levelOrder];
  const firstPending = passport.nextLevelChecklist.find((item) => !item.done);
  const isAutoPending = firstPending?.id === "account-active";

  const accountActiveDays = passport.accountLinkedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(passport.accountLinkedAt).getTime()) / 86400000))
    : 0;

  function rowOnClick(itemId: string, done: boolean) {
    if (done) return undefined;
    if (DOCUMENT_VERIFY_ITEMS.includes(itemId)) return () => router.push(`/passport/verify/${itemId}`);
    if (MANUAL_TOGGLE_ITEMS.includes(itemId)) return () => toggleChecklistItem(itemId);
    return undefined;
  }

  function rowHint(itemId: string, done: boolean) {
    if (itemId === "account-active" && !done) {
      return t("passport.accountActiveShortHint", { days: Math.min(accountActiveDays, 30) });
    }
    return tOpt(`passport.checklist.${itemId}.hint`);
  }

  function handleCta() {
    if (isMature) {
      setViewingReport(true);
      return;
    }
    if (!firstPending) return;
    if (DOCUMENT_VERIFY_ITEMS.includes(firstPending.id)) {
      router.push(`/passport/verify/${firstPending.id}`);
    } else if (MANUAL_TOGGLE_ITEMS.includes(firstPending.id)) {
      toggleChecklistItem(firstPending.id);
    } else if (TRANSACTION_ITEMS.includes(firstPending.id)) {
      router.push("/home");
    }
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
                    hint={rowHint(item.id, item.done)}
                    onClick={rowOnClick(item.id, item.done)}
                  />
                </div>
              ))}
            </Card>
            {firstPending && TRANSACTION_ITEMS.includes(firstPending.id) && (
              <p className="mt-2 text-xs leading-relaxed text-foreground-subtle">
                {t("passport.transactionHint")}
              </p>
            )}
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

        {isAutoPending ? (
          <Card className="text-center text-sm text-foreground-muted">
            {t("passport.accountActiveHint", { days: Math.min(accountActiveDays, 30) })}
          </Card>
        ) : (
          <Button onClick={handleCta} className="gap-2">
            {isMature && <Download className="h-4 w-4" />}
            {ctaLabel}
          </Button>
        )}
      </div>
    </AppShell>
  );
}
