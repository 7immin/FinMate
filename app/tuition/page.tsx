"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { UploadStep } from "@/components/flows/tuition/UploadStep";
import { ScanningStep } from "@/components/flows/tuition/ScanningStep";
import { ResultStep } from "@/components/flows/tuition/ResultStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { TUITION_INVOICE } from "@/lib/mock/tuition";

type Step = "upload" | "scanning" | "result" | "success";

export default function TuitionPage() {
  const router = useRouter();
  const { recordPurposeTransaction } = useAppState();
  const [step, setStep] = useState<Step>("upload");

  function handleConfirm() {
    recordPurposeTransaction();
    setStep("success");
  }

  return (
    <AppShell className="flex flex-col">
      {step === "upload" && <UploadStep onUploaded={() => setStep("scanning")} />}
      {step === "scanning" && <ScanningStep onComplete={() => setStep("result")} />}
      {step === "result" && (
        <ResultStep onConfirm={handleConfirm} onRetry={() => setStep("upload")} />
      )}
      {step === "success" && (
        <FlowSuccess
          topBarTitle="학비 한도 개방"
          title="등록금 이체 한도가 열렸어요"
          description={`${TUITION_INVOICE.recipient}에 ${TUITION_INVOICE.amount.toLocaleString()}원을 납부할 수 있는 한도가 확보됐습니다. 금융여권에도 반영됐어요.`}
          doneLabel="홈으로"
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
