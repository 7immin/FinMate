"use client";

import { ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { TUITION_INVOICE } from "@/lib/mock/tuition";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-[15px] font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ResultStep({
  onConfirm,
  onRetry,
}: {
  onConfirm: () => void;
  onRetry: () => void;
}) {
  const invoice = TUITION_INVOICE;
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="확인해 주세요" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <Badge tone="success" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
          공식 고지서로 확인됨
        </Badge>

        <h1 className="text-[22px] font-bold text-foreground">{invoice.title}</h1>

        <Card className="divide-y divide-border">
          <InfoRow label="납부 금액" value={`${invoice.amount.toLocaleString()} KRW`} />
          <InfoRow label="납부 기한" value={`${invoice.dueDate} ${invoice.dDay}`} />
          <InfoRow label="수취 기관" value={invoice.recipient} />
          <InfoRow label="가상계좌" value={invoice.virtualAccount} />
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">위험 신호 점검</p>
          <Card className="divide-y divide-border">
            {invoice.riskChecks.map((check) => (
              <ChecklistRow key={check.id} status="done" label={check.label} />
            ))}
          </Card>
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button onClick={onConfirm}>맞습니다, 한도 열기 →</Button>
        <button
          type="button"
          onClick={onRetry}
          className="w-full text-center text-sm text-foreground-muted"
        >
          내용이 달라요
        </button>
      </div>
    </div>
  );
}
