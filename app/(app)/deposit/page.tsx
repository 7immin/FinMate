"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ContractUploadStep } from "@/components/flows/deposit/ContractUploadStep";
import { VerifyResultStep } from "@/components/flows/deposit/VerifyResultStep";
import { ProtectionStep } from "@/components/flows/deposit/ProtectionStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LEASE_CONTRACT, LeaseContract } from "@/lib/mock/deposit";
import { readLeaseContract } from "@/lib/ocr/client";

type Step = "upload" | "verifying" | "verify" | "protection" | "success";

export default function DepositPage() {
  const router = useRouter();
  const { requestLimit } = useAppState();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("upload");
  const [contract, setContract] = useState<LeaseContract>(LEASE_CONTRACT);
  const [ocrFailed, setOcrFailed] = useState(false);
  const fileRef = useRef<File | null>(null);

  async function handleVerify() {
    const file = fileRef.current;
    if (!file) return;
    setStep("verifying");
    try {
      const result = await readLeaseContract(file);
      setContract((prev) => ({
        ...prev,
        fileName: file.name,
        address: result.address || prev.address,
        deposit: result.deposit || prev.deposit,
        rent: result.rent ?? prev.rent,
        rentDay: result.rentDay || prev.rentDay,
        period: result.period || prev.period,
      }));
      setOcrFailed(false);
    } catch {
      setOcrFailed(true);
    }
    setStep("verify");
  }

  function handleConfirm() {
    // 계약서로 임대인 계좌가 확인됐으니 보증금만큼 한도를 요청한다.
    // 학비와 같은 이유로, 여는 것은 은행이다.
    requestLimit(contract.deposit, "deposit", "lease-contract");
    setStep("success");
  }

  return (
    <AppShell className="flex flex-col">
      {(step === "upload" || step === "verifying") && (
        <ContractUploadStep
          processing={step === "verifying"}
          onFileSelected={(file) => {
            fileRef.current = file;
          }}
          onVerify={handleVerify}
        />
      )}
      {step === "verify" && (
        <VerifyResultStep
          contract={contract}
          ocrFailed={ocrFailed}
          onReduceRisk={() => setStep("protection")}
          onAbandon={() => router.push("/home")}
        />
      )}
      {step === "protection" && <ProtectionStep onConfirm={handleConfirm} />}
      {step === "success" && (
        <FlowSuccess
          topBarTitle={t("deposit.topBarTitle")}
          title={t("deposit.success.title")}
          description={t("deposit.success.description", {
            address: contract.address,
            amount: contract.deposit.toLocaleString(),
          })}
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
