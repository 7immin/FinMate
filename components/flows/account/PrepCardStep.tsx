"use client";

import { useState } from "react";
import { Languages, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { DocumentFlags } from "@/lib/types";
import { REQUEST_PHRASE } from "@/lib/mock/account";

const LANG_CYCLE: { code: keyof typeof REQUEST_PHRASE; nextLabel: string }[] = [
  { code: "ko", nextLabel: "베트남어로 보기" },
  { code: "vi", nextLabel: "영어로 보기" },
  { code: "en", nextLabel: "한국어로 보기" },
];

export function PrepCardStep({
  documents,
  onComplete,
}: {
  documents: DocumentFlags;
  onComplete: () => void;
}) {
  const [langIdx, setLangIdx] = useState(0);
  const lang = LANG_CYCLE[langIdx];
  const phrase = REQUEST_PHRASE[lang.code];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="창구에서 보여주기" />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <h1 className="text-[22px] font-bold text-foreground">이 화면을 직원에게 보여주세요</h1>

        <Card raised className="space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{phrase.title}</p>
          <p className="text-[15px] leading-relaxed text-foreground">{phrase.body}</p>
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">가져갈 서류</p>
          <Card className="divide-y divide-border">
            <ChecklistRow
              status={documents.hasPassport === "yes" ? "done" : "pending"}
              label="여권 원본"
            />
            <ChecklistRow status="done" label="재학증명서 (3개월 이내)" />
            <ChecklistRow
              status={documents.hasKoreanPhone === "yes" ? "done" : "pending"}
              label="한국 휴대폰 번호"
            />
            <ChecklistRow status="pending" label="기숙사 거주 확인서 (권장)" />
          </Card>
        </div>

        <Card className="flex gap-2.5 bg-warning-muted">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm leading-relaxed text-warning">
            계좌 개설 후 첫 한 달은 하루 이체 한도가 30만 원입니다. 정상적인 절차입니다.
          </p>
        </Card>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button
          variant="outline"
          onClick={() => setLangIdx((i) => (i + 1) % LANG_CYCLE.length)}
          className="gap-2"
        >
          <Languages className="h-4 w-4" /> {lang.nextLabel}
        </Button>
        <button
          type="button"
          onClick={onComplete}
          className="w-full text-center text-sm text-foreground-muted"
        >
          개설 완료했어요
        </button>
      </div>
    </div>
  );
}
