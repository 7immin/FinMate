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
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DocumentFlags } from "@/lib/types";

type Step = "documents" | "guidance" | "branch" | "prep" | "success";

export default function AccountOpeningPage() {
  const router = useRouter();
  const { setDocumentFlag } = useAppState();
  const { t } = useTranslation();
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
      {step === "prep" && documents && (
        <PrepCardStep documents={documents} onComplete={() => setStep("success")} />
      )}
      {step === "success" && (
        <FlowSuccess
          topBarTitle={t("account.topBarTitle")}
          title={t("account.success.title")}
          description={t("account.success.description", {
            branch: branchName ?? t("account.success.branchFallback"),
          })}
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
