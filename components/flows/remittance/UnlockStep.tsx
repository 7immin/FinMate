"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Landmark, GraduationCap, MessageCircleQuestion, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PROOF_OPTIONS, ProofOption } from "@/lib/mock/remittance";

const ICONS: Record<string, typeof FileText> = {
  employment: FileText,
  "home-remittance": Landmark,
  scholarship: GraduationCap,
};

const CTA_VERB: Record<string, string> = {
  employment: "근로계약서 올리기",
  "home-remittance": "송금 내역 올리기",
  scholarship: "장학금 증명 올리기",
};

export function UnlockStep({ onUnlocked }: { onUnlocked: (option: ProofOption) => void }) {
  const [selected, setSelected] = useState(PROOF_OPTIONS[0].id);
  const current = PROOF_OPTIONS.find((o) => o.id === selected)!;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="한도 열기" />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">셋 중 하나만 있으면 됩니다</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            돈이 어디서 왔고 어디로 가는지 확인되면 그만큼 한도가 열립니다.
          </p>
        </div>

        <div className="space-y-3">
          {PROOF_OPTIONS.map((option) => {
            const Icon = ICONS[option.id];
            const active = selected === option.id;
            return (
              <button key={option.id} type="button" onClick={() => setSelected(option.id)} className="block w-full text-left">
                <Card
                  raised={active}
                  className={active ? "border-primary" : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px] text-primary" />
                      <span className="text-[15px] font-medium text-foreground">
                        {option.label}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-success">
                      +{option.bonus.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[30px] text-sm text-foreground-muted">
                    {option.description}
                  </p>
                </Card>
              </button>
            );
          })}
        </div>

        <Link href="/ai?q=해외송금 한도를 열려면 뭘 내야 하나요?">
          <Card className="flex items-center gap-3">
            <MessageCircleQuestion className="h-[18px] w-[18px] text-primary" />
            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">뭘 내야 할지 모르겠어요</p>
              <p className="text-sm text-foreground-muted">AI에게 내 상황을 설명하고 물어보기</p>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-subtle" />
          </Card>
        </Link>
      </div>

      <div className="px-5 pb-6">
        <Button onClick={() => onUnlocked(current)}>{CTA_VERB[current.id]}</Button>
      </div>
    </div>
  );
}
