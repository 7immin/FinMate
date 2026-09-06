"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StepCard } from "@/components/ui/StepCard";
import { Chip } from "@/components/ui/Chip";
import { DocumentFlags } from "@/lib/types";
import { buildGuidance } from "@/lib/mock/account";

export function GuidanceStep({
  documents,
  onNext,
}: {
  documents: DocumentFlags;
  onNext: () => void;
}) {
  const { aiMessage, steps, followUps } = buildGuidance(documents);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="지금 할 일" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <Card raised className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <p className="text-[15px] leading-relaxed text-foreground">{aiMessage}</p>
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">순서</p>
          <div className="space-y-3">
            {steps.map((s, idx) => (
              <StepCard key={s.title} index={idx + 1} title={s.title} description={s.hint} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">이어서 물어보기</p>
          <div className="flex flex-wrap gap-2">
            {followUps.map((q) => (
              <Link key={q} href={`/ai?q=${encodeURIComponent(q)}`}>
                <Chip>{q}</Chip>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onNext}>갈 수 있는 지점 보기</Button>
      </div>
    </div>
  );
}
