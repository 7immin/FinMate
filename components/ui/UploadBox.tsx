"use client";

import { ChangeEvent, useRef } from "react";
import { FileText, Camera, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function UploadBox({
  label,
  fileName,
  onFileSelected,
  className,
}: {
  label: string;
  fileName?: string | null;
  onFileSelected: (file: File) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = "";
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_10px,transparent_10px,transparent_20px)]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-foreground-muted">
          <FileText className="h-5 w-5" />
        </span>
        <span className="text-[15px] font-medium text-foreground">{fileName ?? label}</span>
        {fileName && <span className="text-xs text-foreground-subtle">{t("common.uploadComplete")}</span>}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*,application/pdf"
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
        capture="environment"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-medium text-foreground"
        >
          <Camera className="h-4 w-4" /> {t("common.takePhoto")}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-medium text-foreground"
        >
          <FolderOpen className="h-4 w-4" /> {t("common.chooseFile")}
        </button>
      </div>
    </div>
  );
}
