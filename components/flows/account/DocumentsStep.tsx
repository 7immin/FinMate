"use client";

import { useState } from "react";
import { IdCard, FileBadge2, Smartphone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DocumentFlags } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type Flag = "unknown" | "yes" | "no";

const OPTIONS: { value: Flag; label: string }[] = [
  { value: "unknown", label: "잘 모름" },
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
];

function DocRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof IdCard;
  label: string;
  value: Flag;
  onChange: (v: Flag) => void;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-[18px] w-[18px] text-foreground-muted" />
        <span className="text-[15px] font-medium text-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-10 rounded-lg text-sm font-medium border",
                !active && "border-border text-foreground-muted",
                active && opt.value === "no" && "border-warning bg-warning/15 text-warning",
                active && opt.value !== "no" && "border-primary bg-primary/15 text-white"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function DocumentsStep({ onSubmit }: { onSubmit: (flags: DocumentFlags) => void }) {
  const [hasPassport, setHasPassport] = useState<Flag>("yes");
  const [hasAlienRegistration, setHasAlienRegistration] = useState<Flag>("no");
  const [hasKoreanPhone, setHasKoreanPhone] = useState<Flag>("yes");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="계좌 개설" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">가진 것만 눌러주세요</h1>
          <p className="mt-2 text-[15px] text-foreground-muted">
            누른 대로 다음에 할 일이 바뀝니다.
          </p>
        </div>

        <DocRow icon={IdCard} label="여권" value={hasPassport} onChange={setHasPassport} />
        <DocRow
          icon={FileBadge2}
          label="외국인등록증"
          value={hasAlienRegistration}
          onChange={setHasAlienRegistration}
        />
        <DocRow
          icon={Smartphone}
          label="한국 휴대폰 번호"
          value={hasKoreanPhone}
          onChange={setHasKoreanPhone}
        />
      </div>
      <div className="px-5 pb-6">
        <Button onClick={() => onSubmit({ hasPassport, hasAlienRegistration, hasKoreanPhone })}>
          내 상황에 맞는 순서 보기
        </Button>
      </div>
    </div>
  );
}
