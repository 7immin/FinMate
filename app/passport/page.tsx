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
import { useAppState } from "@/lib/state/AppStateContext";
import { LEVEL_ORDER } from "@/lib/mock/passport-levels";

const CTA_LABEL: Record<string, string> = {
  S1: "여권 확인부터 하기",
  S2: "계좌 인증하러 가기",
  S3: "은행 제출용 리포트",
  S4: "은행 제출용 리포트",
};

export default function PassportPage() {
  const { state, toggleChecklistItem } = useAppState();
  const { passport, profile } = state;
  const [reportGenerated, setReportGenerated] = useState(false);

  const levelOrder = LEVEL_ORDER.indexOf(passport.level) + 1;
  const isMature = passport.level === "S3" || passport.level === "S4";
  const nextLevelLabel = passport.level === "S4" ? null : LEVEL_ORDER[levelOrder];

  function handleCta() {
    if (isMature) {
      setReportGenerated(true);
      return;
    }
    const firstPending = passport.nextLevelChecklist.find((item) => !item.done);
    if (firstPending) toggleChecklistItem(firstPending.id);
  }

  return (
    <AppShell showNav>
      <TopBar title="금융여권" />
      <div className="space-y-6 px-5 pb-10 pt-2">
        <Card raised className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-foreground-subtle">
                FINANCIAL PASSPORT
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">{profile.name}</p>
              <p className="mt-0.5 text-sm text-foreground-muted">
                {profile.visaStatus} · {profile.nationalityCode} ·{" "}
                {passport.level === "S1" ? profile.arrivalLabel : profile.school}
              </p>
            </div>
            <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-bold text-primary">
              {passport.level}
            </span>
          </div>

          <SegmentedProgress segments={4} active={levelOrder} />

          <div>
            <p className="text-sm text-foreground-muted">기본 이체 한도</p>
            <p className="text-2xl font-bold text-foreground">
              {passport.currentLimit.toLocaleString()}{" "}
              <span className="text-sm font-normal text-foreground-muted">KRW</span>
            </p>
          </div>
        </Card>

        {nextLevelLabel && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground-muted">
              {nextLevelLabel}까지 남은 것
            </p>
            <Card className="divide-y divide-border">
              {passport.nextLevelChecklist.map((item) => (
                <div key={item.id} className="first:pt-0 last:pb-0">
                  <ChecklistRow
                    status={item.done ? "done" : "pending"}
                    label={item.label}
                    hint={item.hint}
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
          등급은 신용 점수가 아닙니다. 실제로 확인된 사실과 정시 납부 기록만 쌓입니다. 은행에는
          등급만 공개되고 상세 점수는 공개되지 않습니다.
        </Card>

        <Button onClick={handleCta} className="gap-2">
          {isMature && <Download className="h-4 w-4" />}
          {reportGenerated ? "리포트가 준비됐어요 · 다시 받기" : CTA_LABEL[passport.level]}
        </Button>
      </div>
    </AppShell>
  );
}
