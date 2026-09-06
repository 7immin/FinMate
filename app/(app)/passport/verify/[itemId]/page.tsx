"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UploadBox } from "@/components/ui/UploadBox";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { verifyChecklistDocument } from "@/lib/ocr/client";

interface FieldConfig {
  key: string;
  labelKey: string;
  format?: (value: unknown) => string;
}

interface ItemConfig {
  i18nKey: string;
  fields: FieldConfig[];
}

const ITEM_CONFIG: Record<string, ItemConfig> = {
  "passport-verify": {
    i18nKey: "passportVerify",
    fields: [
      { key: "name", labelKey: "name" },
      { key: "passportNumber", labelKey: "passportNumber" },
      { key: "nationality", labelKey: "nationality" },
      { key: "expiryDate", labelKey: "expiryDate" },
    ],
  },
};

type Status = "idle" | "submitting" | "success" | "failure";

export default function PassportVerifyPage() {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const { setPassportState, setDocumentsState } = useAppState();
  const { t } = useTranslation();

  const itemId = params.itemId;
  const config = ITEM_CONFIG[itemId];

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  if (!config) {
    router.replace("/passport");
    return null;
  }

  const base = `passport.verify.${config.i18nKey}`;

  async function handleSubmit() {
    if (!file || status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await verifyChecklistDocument(itemId, file);
      setResult(res.result);
      if (res.ok && res.passport) {
        setPassportState(res.passport);
        if (res.documents) setDocumentsState(res.documents);
        setStatus("success");
      } else {
        setStatus("failure");
      }
    } catch {
      setResult(null);
      setStatus("failure");
    }
  }

  function handleRetry() {
    setFile(null);
    setResult(null);
    setStatus("idle");
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t(`${base}.title`)} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <p className="text-[15px] leading-relaxed text-foreground-muted">{t(`${base}.description`)}</p>

        {status === "success" ? (
          <Card className="space-y-3 bg-success-muted">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-[15px] font-medium">{t("passport.verify.success")}</p>
            </div>
            {result && (
              <div className="space-y-1.5 border-t border-success/20 pt-3">
                {config.fields.map(({ key, labelKey, format }) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{t(`${base}.field.${labelKey}`)}</span>
                    <span className="font-medium text-foreground">
                      {format ? format(result[key]) : String(result[key] ?? "")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : status === "failure" ? (
          <Card className="flex items-start gap-2.5 bg-warning-muted">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm leading-relaxed text-warning">{t("passport.verify.failure")}</p>
          </Card>
        ) : null}

        {status !== "success" && (
          <UploadBox
            label={t(`${base}.uploadLabel`)}
            fileName={file?.name}
            onFileSelected={(f) => {
              setFile(f);
              setStatus("idle");
              setResult(null);
            }}
          />
        )}

        <p className="text-xs text-foreground-subtle">{t("passport.verify.privacyNote")}</p>
      </div>

      <div className="px-5 pb-6">
        {status === "success" ? (
          <Button onClick={() => router.push("/passport")}>{t("passport.verify.done")}</Button>
        ) : status === "failure" ? (
          <Button onClick={handleRetry}>{t("passport.verify.retry")}</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!file || status === "submitting"} className="gap-2">
            {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "submitting" ? t("passport.verify.submitting") : t("passport.verify.submit")}
          </Button>
        )}
      </div>
    </AppShell>
  );
}
