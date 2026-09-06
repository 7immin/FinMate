"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChecklistRow } from "@/components/ui/Checklist";
import { RISK_CHECKS } from "@/lib/mock/remittance";

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
  const shortfall = Math.max(0, amount - openLimit);
  const sufficient = shortfall === 0;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="점검 결과" />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <Badge tone={sufficient ? "success" : "warning"}>
          {sufficient ? "지금 바로 보낼 수 있습니다" : "지금은 보낼 수 없습니다"}
        </Badge>

        <h1 className="text-[22px] font-bold leading-snug text-foreground">
          {sufficient
            ? "한도 안에서 송금이 가능합니다"
            : `한도가 ${shortfall.toLocaleString()}원 부족합니다`}
        </h1>

        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">보내려는 금액</span>
            <span className="font-semibold text-foreground">{amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">지금 열린 한도</span>
            <span className="font-semibold text-foreground">{openLimit.toLocaleString()}</span>
          </div>
          <ProgressBar value={(Math.min(openLimit, amount) / amount) * 100} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">사용 가능</span>
            <span className={sufficient ? "text-success" : "font-semibold text-warning"}>
              {sufficient ? `${amount.toLocaleString()}` : `부족 ${shortfall.toLocaleString()}`}
            </span>
          </div>
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">리스크 점검</p>
          <Card className="divide-y divide-border">
            {RISK_CHECKS.map((check) => (
              <ChecklistRow key={check.id} status={check.status} label={check.label} />
            ))}
          </Card>
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        {sufficient ? (
          <Button onClick={onProceed}>송금 진행하기 →</Button>
        ) : (
          <>
            <Button onClick={onUnlock}>증빙 올려서 한도 열기 →</Button>
            <Button variant="outline" onClick={onSendPartial}>
              {openLimit.toLocaleString()}원만 먼저 보내기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
