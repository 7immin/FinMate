"use client";

import { MapPin } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { StepCard } from "@/components/ui/StepCard";
import { Button } from "@/components/ui/Button";
import { PROTECTION_STEPS, CENTER_PHRASE } from "@/lib/mock/deposit";

export function ProtectionStep({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="보증금 지키기" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">계약 당일 이 3가지</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            순서대로 하면 보증금 순위가 근저당보다 앞설 수 있습니다.
          </p>
        </div>

        <div className="space-y-3">
          {PROTECTION_STEPS.map((step, idx) => (
            <StepCard
              key={step.title}
              index={idx + 1}
              title={step.title}
              hint={step.hint}
              description={step.description}
              tone={step.hint === "필수" ? "primary" : "neutral"}
            >
              {step.location && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs text-foreground-muted">
                  <MapPin className="h-3.5 w-3.5" /> {step.location}
                </span>
              )}
            </StepCard>
          ))}
        </div>

        <Card className="space-y-1">
          <p className="text-sm font-medium text-foreground-muted">주민센터에서 쓸 문장</p>
          <p className="text-[15px] text-foreground">{CENTER_PHRASE}</p>
        </Card>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onConfirm}>보증금 한도 열기</Button>
      </div>
    </div>
  );
}
