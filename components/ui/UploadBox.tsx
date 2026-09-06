"use client";

import { ChangeEvent, useRef } from "react";
import { FileText, Camera, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function UploadBox({
  label,
  fileName,
  onFileSelected,
  className,
}: {
  label: string;
  fileName?: string | null;
  onFileSelected: (name: string) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file.name);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_10px,transparent_10px,transparent_20px)]"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-foreground-muted">
          <FileText className="h-5 w-5" />
        </span>
        <span className="text-[15px] font-medium text-foreground">{fileName ?? label}</span>
        {fileName && <span className="text-xs text-foreground-subtle">업로드 완료</span>}
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*,application/pdf" />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onFileSelected("camera-capture.jpg")}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-medium text-foreground"
        >
          <Camera className="h-4 w-4" /> 촬영
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] text-sm font-medium text-foreground"
        >
          <FolderOpen className="h-4 w-4" /> 파일 선택
        </button>
      </div>
    </div>
  );
}
