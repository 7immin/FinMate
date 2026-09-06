"use client";

import { useEffect, useState } from "react";

import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChecklistRow } from "@/components/ui/Checklist";
import { useTranslation } from "@/lib/i18n/useTranslation";


export function CheckStep({
  amount,
  openLimit,
  onUnlock,
  onProceed,
}: {
  amount: number;
  openLimit: number;
  onUnlock: () => void;
  onProceed: () => void;
}) {
  const { t } = useTranslation();
  // 이번 달에 올린 요청 수. 못 읽으면 줄 자체를 그리지 않는다 —
  // 모르는 값을 0으로 채우면 "처음 보내는 것"이라고 단언하는 셈이다.
  const [thisMonthCount, setThisMonthCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/limit-requests")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.requests) return;
        const now = new Date();
        const count = data.requests.filter((req: { created_at: string }) => {
          const at = new Date(req.created_at);
          return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
        }).length;
        setThisMonthCount(count);
      })
      .catch(() => {
        // 조회 실패는 화면을 막지 않는다. 그 줄만 빠진다.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

        {/*
          예전에는 여기에 "수취인 이름이 여권 표기와 일치", "제재 대상 목록에
          없음", "이 달 생활비 송금이 3회째" 세 줄이 늘 같은 모양으로 떴다.
          셋 다 우리가 확인한 적 없는 사실이다 — 여권 이름을 가지고 있지도
          않고, 제재 목록을 조회하지도 않으며, 3회는 그냥 박아 둔 숫자였다.
          확인하지 않은 것을 확인했다고 말하면, 정작 진짜 위험이 있을 때도
          사용자가 이 화면을 믿지 않는다.

          그래서 우리가 실제로 아는 것만 남긴다: 이번 달 요청 횟수는 DB에서
          세고, 이름 대조는 우리가 못 하니 사용자에게 직접 확인하라고 말한다.
        */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("remittance.check.riskTitle")}</p>
          <Card className="divide-y divide-border">
            <ChecklistRow status="active" label={t("remittance.risk.nameSelfCheck")} />
            {thisMonthCount !== null && (
              <ChecklistRow
                status={thisMonthCount >= 3 ? "warning" : "done"}
                label={t("remittance.risk.frequency", { count: thisMonthCount })}
                hint={thisMonthCount >= 3 ? t("remittance.risk.frequencyHint") : undefined}
              />
            )}
          </Card>
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        {sufficient ? (
          <Button onClick={onProceed}>{t("remittance.check.proceed")}</Button>
        ) : (
          <Button onClick={onUnlock}>{t("remittance.check.unlock")}</Button>
        )}
      </div>
    </div>
  );
}
