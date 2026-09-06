"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { ChecklistRow } from "@/components/ui/Checklist";
import { SCANNING_STEPS } from "@/lib/mock/tuition";

export function ScanningStep({ onComplete }: { onComplete: () => void }) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (doneCount >= SCANNING_STEPS.length) {
      const finish = setTimeout(onComplete, 500);
      return () => clearTimeout(finish);
    }
    const tick = setTimeout(() => setDoneCount((c) => c + 1), 750);
    return () => clearTimeout(tick);
  }, [doneCount, onComplete]);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="학비 한도 개방" closeIcon />
      <div className="flex-1 space-y-8 px-5 pb-6 pt-10">
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40">
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30" />
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-foreground">고지서를 읽고 있어요</p>
            <p className="mt-1 text-sm text-foreground-muted">보통 20초 안에 끝납니다</p>
          </div>
        </div>

        <div className="space-y-1">
          {SCANNING_STEPS.map((step, idx) => (
            <ChecklistRow
              key={step.id}
              status={idx < doneCount ? "done" : idx === doneCount ? "active" : "pending"}
              label={step.label}
            />
          ))}
        </div>
      </div>
      <p className="flex items-center justify-center gap-1.5 px-5 pb-6 text-center text-xs text-foreground-subtle">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> FinMate는 은행 비밀번호를 절대 묻지
        않습니다. 묻는 쪽이 있다면 사기입니다.
      </p>
    </div>
  );
}
