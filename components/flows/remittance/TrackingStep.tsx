"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { RemittanceChannel } from "@/lib/mock/remittance";

export function TrackingStep({
  recipient,
  amount,
  channel,
  onDone,
}: {
  recipient: string;
  amount: number;
  channel: RemittanceChannel;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="도착 추적" closeIcon onBack={onDone} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">전송을 시작했어요</h1>
          <p className="mt-2 text-[15px] text-foreground-muted">
            {recipient}님에게 {amount.toLocaleString()}원 · {channel.speed}
          </p>
        </div>

        <Card className="divide-y divide-border">
          <ChecklistRow status="done" label="접수 완료" hint="방금" />
          <ChecklistRow status="active" label="해외은행 처리 중" />
          <ChecklistRow status="pending" label="입금 완료" />
        </Card>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onDone}>홈으로</Button>
      </div>
    </div>
  );
}
