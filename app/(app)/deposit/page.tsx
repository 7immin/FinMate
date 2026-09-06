"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ContractUploadStep } from "@/components/flows/deposit/ContractUploadStep";
import { VerifyResultStep } from "@/components/flows/deposit/VerifyResultStep";
import { ProtectionStep } from "@/components/flows/deposit/ProtectionStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LEASE_CONTRACT } from "@/lib/mock/deposit";

type Step = "upload" | "verify" | "protection" | "success";

export default function DepositPage() {
  const router = useRouter();
  const { recordPurposeTransaction } = useAppState();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("upload");

  function handleConfirm() {
    recordPurposeTransaction("deposit");
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
          topBarTitle={t("deposit.topBarTitle")}
          title={t("deposit.success.title")}
          description={t("deposit.success.description", {
            address: LEASE_CONTRACT.address,
            amount: LEASE_CONTRACT.deposit.toLocaleString(),
          })}
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
