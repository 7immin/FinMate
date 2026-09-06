"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { UploadStep } from "@/components/flows/tuition/UploadStep";
import { ScanningStep } from "@/components/flows/tuition/ScanningStep";
import { ResultStep } from "@/components/flows/tuition/ResultStep";
import { EditInvoiceStep } from "@/components/flows/tuition/EditInvoiceStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TUITION_INVOICE, TuitionInvoice } from "@/lib/mock/tuition";

type Step = "upload" | "scanning" | "result" | "edit" | "success";

export default function TuitionPage() {
  const router = useRouter();
  const { recordPurposeTransaction } = useAppState();
  const { t, tShared } = useTranslation();
  const [step, setStep] = useState<Step>("upload");
  const [invoice, setInvoice] = useState<TuitionInvoice>(TUITION_INVOICE);

  function handleConfirm() {
    recordPurposeTransaction("tuition");
    setStep("success");
  }

  return (
    <AppShell className="flex flex-col">
      {step === "upload" && <UploadStep onUploaded={() => setStep("scanning")} />}
      {step === "scanning" && <ScanningStep onComplete={() => setStep("result")} />}
      {step === "result" && (
        <ResultStep invoice={invoice} onConfirm={handleConfirm} onRetry={() => setStep("edit")} />
      )}
      {step === "edit" && (
        <EditInvoiceStep
          invoice={invoice}
          onCancel={() => setStep("result")}
          onSave={(updated) => {
            setInvoice(updated);
            setStep("result");
          }}
        />
      )}
      {step === "success" && (
        <FlowSuccess
          topBarTitle={t("tuition.topBarTitle")}
          title={t("tuition.success.title")}
          description={t("tuition.success.description", {
            recipient: tShared("school", invoice.recipient),
            amount: invoice.amount.toLocaleString(),
          })}
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
