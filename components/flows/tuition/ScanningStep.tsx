"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { ChecklistRow } from "@/components/ui/Checklist";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SCANNING_STEP_IDS } from "@/lib/mock/tuition";
import { SchoolId } from "@/lib/types";

export function ScanningStep({ school, onComplete }: { school: SchoolId; onComplete: () => void }) {
  const { t, tShared } = useTranslation();
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (doneCount >= SCANNING_STEP_IDS.length) {
      const finish = setTimeout(onComplete, 500);
      return () => clearTimeout(finish);
    }
    const tick = setTimeout(() => setDoneCount((c) => c + 1), 750);
    return () => clearTimeout(tick);
  }, [doneCount, onComplete]);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("tuition.topBarTitle")} closeIcon />
      <div className="flex-1 space-y-8 px-5 pb-6 pt-10">
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40">
            <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/30" />
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-foreground">{t("tuition.scanning.title")}</p>
            <p className="mt-1 text-sm text-foreground-muted">{t("tuition.scanning.description")}</p>
          </div>
        </div>

        <div className="space-y-1">
          {SCANNING_STEP_IDS.map((id, idx) => (
            <ChecklistRow
              key={id}
              status={idx < doneCount ? "done" : idx === doneCount ? "active" : "pending"}
              label={t(`tuition.scanning.steps.${id}`, { school: tShared("school", school) })}
            />
          ))}
        </div>
      </div>
      <p className="flex items-center justify-center gap-1.5 px-5 pb-6 text-center text-xs text-foreground-subtle">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {t("tuition.upload.footerNote")}
      </p>
    </div>
  );
}
