"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ContractUploadStep } from "@/components/flows/deposit/ContractUploadStep";
import { VerifyResultStep } from "@/components/flows/deposit/VerifyResultStep";
import { ProtectionStep } from "@/components/flows/deposit/ProtectionStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { LEASE_CONTRACT } from "@/lib/mock/deposit";

type Step = "upload" | "verify" | "protection" | "success";

export default function DepositPage() {
  const router = useRouter();
  const { recordPurposeTransaction } = useAppState();
  const [step, setStep] = useState<Step>("upload");

  function handleConfirm() {
    recordPurposeTransaction();
    setStep("success");
  }

  return (
    <AppShell className="flex flex-col">
      {step === "upload" && <ContractUploadStep onVerify={() => setStep("verify")} />}
      {step === "verify" && (
        <VerifyResultStep
          onReduceRisk={() => setStep("protection")}
          onAbandon={() => router.push("/home")}
        />
      )}
      {step === "protection" && <ProtectionStep onConfirm={handleConfirm} />}
      {step === "success" && (
        <FlowSuccess
          topBarTitle="월세·보증금"
          title="보증금 이체 한도가 열렸어요"
          description={`${LEASE_CONTRACT.address} 임대인 계좌로만 ${LEASE_CONTRACT.deposit.toLocaleString()}원 송금이 가능합니다. 전입신고 일정도 캘린더에 등록했어요.`}
          doneLabel="홈으로"
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
