"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsStep } from "@/components/flows/account/DocumentsStep";
import { GuidanceStep } from "@/components/flows/account/GuidanceStep";
import { BranchFinderStep } from "@/components/flows/account/BranchFinderStep";
import { PrepCardStep } from "@/components/flows/account/PrepCardStep";
import { useAppState } from "@/lib/state/AppStateContext";
import { DocumentFlags } from "@/lib/types";

type Step = "documents" | "guidance" | "branch" | "prep";

export default function AccountOpeningPage() {
  const router = useRouter();
  const { setDocumentFlag } = useAppState();
  const [step, setStep] = useState<Step>("documents");
  const [documents, setDocuments] = useState<DocumentFlags | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  function handleDocumentsSubmit(flags: DocumentFlags) {
    setDocuments(flags);
    (Object.keys(flags) as (keyof DocumentFlags)[]).forEach((key) =>
      setDocumentFlag(key, flags[key])
    );
    setStep("guidance");
  }

  return (
    <AppShell className="flex flex-col">
      {step === "documents" && <DocumentsStep onSubmit={handleDocumentsSubmit} />}
      {step === "guidance" && documents && (
        <GuidanceStep documents={documents} onNext={() => setStep("branch")} />
      )}
      {step === "branch" && (
        <BranchFinderStep
          onSelect={(name) => {
            setBranchName(name);
            setStep("prep");
          }}
        />
      )}
      {/*
        창구 준비 카드가 이 흐름의 끝이다.
        여기 있던 완료 화면은 "{{지점}}에서 위 화면을 보여주면 됩니다"라고
        했는데, 정작 그 "위 화면"은 방금 떠나온 준비 카드였다. 넘어가고
        나면 가리킬 것이 아무것도 없다.

        준비 카드를 창구에서 보여주는 것이 결과물이므로, 그 화면에 머무는
        것이 맞다. 계좌를 실제로 개설하고 온 다음에 할 일(계좌 확인)은
        준비 카드 안에서 이어 간다.
      */}
      {step === "prep" && documents && (
        <PrepCardStep
          documents={documents}
          branchName={branchName}
          onVerifyAccount={() => router.push("/passport/verify/korean-account")}
        />
      )}
    </AppShell>
  );
}
