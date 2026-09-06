"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { LEASE_CONTRACT, REGISTRY_CHECKS } from "@/lib/mock/deposit";

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
  const warningCount = REGISTRY_CHECKS.filter((c) => c.status === "warning").length;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="검증 결과" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <Badge tone="warning">주의 {warningCount}건</Badge>

        <h1 className="text-[22px] font-bold leading-snug text-foreground">
          보증금을 보내기 전에
          <br />
          확인이 필요합니다
        </h1>

        <Card className="divide-y divide-border">
          <InfoRow label="주소" value={LEASE_CONTRACT.address} />
          <InfoRow label="보증금" value={`${LEASE_CONTRACT.deposit.toLocaleString()} KRW`} />
          <InfoRow label="월세" value={`${LEASE_CONTRACT.rent.toLocaleString()} KRW · ${LEASE_CONTRACT.rentDay}`} />
          <InfoRow label="계약 기간" value={LEASE_CONTRACT.period} />
        </Card>

        <div className="space-y-1">
          {REGISTRY_CHECKS.map((check) => (
            <Card key={check.id} className={check.status === "warning" ? "bg-warning-muted" : undefined}>
              <ChecklistRow status={check.status} label={check.label} />
              <p className="pl-8 text-sm leading-relaxed text-foreground-muted">{check.detail}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button onClick={onReduceRisk}>위험 줄이는 방법 보기 →</Button>
        <button type="button" onClick={onAbandon} className="w-full text-center text-sm text-foreground-muted">
          이 집은 포기할게요
        </button>
      </div>
    </div>
  );
}
