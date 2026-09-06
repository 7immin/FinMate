"use client";

import { CheckCircle2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";

export function FlowSuccess({
  topBarTitle,
  title,
  description,
  doneLabel = "홈으로",
  onDone,
}: {
  topBarTitle: string;
  title: string;
  description: string;
  doneLabel?: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={topBarTitle} closeIcon onBack={onDone} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-muted text-success">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h1 className="text-[22px] font-bold text-foreground">{title}</h1>
        <p className="text-[15px] leading-relaxed text-foreground-muted">{description}</p>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onDone}>{doneLabel}</Button>
      </div>
    </div>
  );
}
