"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { GuestLanguageProvider } from "@/lib/i18n/GuestLanguageContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/Button";

/**
 * 서명 URL로 바로 링크하면, 5분이 지난 뒤 눌렀을 때 Supabase Storage가
 * 돌려주는 raw JSON 에러("InvalidJWT" 등)가 빈 탭에 그대로 떴다. 담당자는
 * 왜 안 열리는지 알 길이 없었다.
 *
 * 이 페이지가 그 사이에 한 번 끼어든다. 실제로 열리는지 먼저 확인해 보고,
 * 되면 그 자리에서 문서로 넘어가고, 안 되면(주로 5분이 지나서) 이유와
 * 다음 행동을 말해 준다.
 */
function EvidenceGuard() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const url = params.get("url");
  const [status, setStatus] = useState<"checking" | "expired">("checking");

  useEffect(() => {
    if (!url) {
      setStatus("expired");
      return;
    }
    let cancelled = false;
    fetch(url, { method: "GET" })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          window.location.replace(url);
        } else {
          setStatus("expired");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("expired");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      {status === "checking" ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[15px] text-foreground-muted">{t("bank.evidenceChecking")}</p>
        </>
      ) : (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-muted text-warning">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="text-[20px] font-bold text-foreground">{t("bank.evidenceExpiredTitle")}</h1>
          <p className="max-w-xs text-[14px] leading-relaxed text-foreground-muted">
            {t("bank.evidenceExpiredDesc")}
          </p>
          <Button className="mt-2 w-auto gap-2 px-6" onClick={() => router.push("/bank")}>
            <ArrowLeft className="h-4 w-4" />
            {t("bank.evidenceBackToQueue")}
          </Button>
        </>
      )}
    </div>
  );
}

export default function BankEvidencePage() {
  return (
    <GuestLanguageProvider>
      <EvidenceGuard />
    </GuestLanguageProvider>
  );
}
