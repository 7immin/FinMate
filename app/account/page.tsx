"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsStep } from "@/components/flows/account/DocumentsStep";
import { GuidanceStep } from "@/components/flows/account/GuidanceStep";
import { BranchFinderStep } from "@/components/flows/account/BranchFinderStep";
import { PrepCardStep } from "@/components/flows/account/PrepCardStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { DocumentFlags } from "@/lib/types";
import { Branch } from "@/lib/mock/account";

type Step = "documents" | "guidance" | "branch" | "prep" | "success";

export default function AccountOpeningPage() {
  const router = useRouter();
  const { setDocumentFlag } = useAppState();
  const [step, setStep] = useState<Step>("documents");
  const [documents, setDocuments] = useState<DocumentFlags | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);

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
          onSelect={(b) => {
            setBranch(b);
            setStep("prep");
          }}
        />
      )}
      {step === "prep" && documents && (
        <PrepCardStep documents={documents} onComplete={() => setStep("success")} />
      )}
      {step === "success" && (
        <FlowSuccess
          topBarTitle="계좌 개설"
          title="방문 준비가 끝났어요"
          description={`${branch?.name ?? "지점"}에서 위 화면을 보여주면 바로 창구 상담을 받을 수 있어요.`}
          doneLabel="홈으로"
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
