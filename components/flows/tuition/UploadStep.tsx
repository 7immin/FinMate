"use client";

import { Link2, Mail, ShieldCheck, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { UploadBox } from "@/components/ui/UploadBox";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function UploadStep({
  onFileUploaded,
  onMockSourceSelected,
}: {
  onFileUploaded: (file: File) => void;
  onMockSourceSelected: () => void;
}) {
  const { state } = useAppState();
  const { t, tShared } = useTranslation();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("tuition.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="whitespace-pre-line text-[24px] font-bold leading-snug text-foreground">
            {t("tuition.upload.headline")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
            {t("tuition.upload.description")}
          </p>
        </div>

        <UploadBox label={t("tuition.upload.boxLabel")} onFileSelected={onFileUploaded} />

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("tuition.upload.orTitle")}</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onMockSourceSelected}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <Link2 className="h-4 w-4 text-foreground-muted" />
              <span className="flex-1 text-[15px] text-foreground">
                {t("tuition.upload.portal", { school: tShared("school", state.profile.school) })}
              </span>
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
            </button>
            <button
              type="button"
              onClick={onMockSourceSelected}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <Mail className="h-4 w-4 text-foreground-muted" />
              <span className="flex-1 text-[15px] text-foreground">{t("tuition.upload.email")}</span>
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
            </button>
          </div>
        </div>
      </div>
      <p className="flex items-center justify-center gap-1.5 px-5 pb-6 text-center text-xs text-foreground-subtle">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {t("tuition.upload.footerNote")}
      </p>
    </div>
  );
}
