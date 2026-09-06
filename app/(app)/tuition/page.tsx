"use client";

import { useRef, useState } from "react";
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
import { readTuitionInvoice, TuitionOcrResult } from "@/lib/ocr/client";

type Step = "upload" | "scanning" | "result" | "edit" | "success";

export default function TuitionPage() {
  const router = useRouter();
  const { recordPurposeTransaction } = useAppState();
  const { t, tShared } = useTranslation();
  const [step, setStep] = useState<Step>("upload");
  const [invoice, setInvoice] = useState<TuitionInvoice>(TUITION_INVOICE);
  const [ocrFailed, setOcrFailed] = useState(false);
  const ocrPromiseRef = useRef<Promise<TuitionOcrResult | null>>(Promise.resolve(null));

  function handleFileUploaded(file: File) {
    ocrPromiseRef.current = readTuitionInvoice(file).catch(() => {
      throw new Error("ocr_failed");
    });
    setStep("scanning");
  }

  function handleMockSourceSelected() {
    ocrPromiseRef.current = Promise.resolve(null);
    setStep("scanning");
  }

  async function handleScanComplete() {
    try {
      const result = await ocrPromiseRef.current;
      if (result) {
        setInvoice((prev) => ({
          ...prev,
          title: result.title || prev.title,
          amount: result.amount || prev.amount,
          dueDate: result.dueDate || prev.dueDate,
          virtualAccount: result.virtualAccount || prev.virtualAccount,
        }));
      }
      setOcrFailed(false);
    } catch {
      setOcrFailed(true);
    }
    setStep("result");
  }

  function handleConfirm() {
    recordPurposeTransaction("tuition");
    setStep("success");
  }

  return (
    <AppShell className="flex flex-col">
      {step === "upload" && (
        <UploadStep onFileUploaded={handleFileUploaded} onMockSourceSelected={handleMockSourceSelected} />
      )}
      {step === "scanning" && <ScanningStep onComplete={handleScanComplete} />}
      {step === "result" && (
        <ResultStep
          invoice={invoice}
          ocrFailed={ocrFailed}
          onConfirm={handleConfirm}
          onRetry={() => setStep("edit")}
        />
      )}
      {step === "edit" && (
        <EditInvoiceStep
          invoice={invoice}
          onCancel={() => setStep("result")}
          onSave={(updated) => {
            setInvoice(updated);
            setOcrFailed(false);
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
