"use client";

import { Link2, Mail, ShieldCheck, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { UploadBox } from "@/components/ui/UploadBox";

export function UploadStep({ onUploaded }: { onUploaded: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="학비 한도 개방" />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[24px] font-bold leading-snug text-foreground">
            학교 고지서를
            <br />
            그대로 올려주세요
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
            기한·금액·입금 계좌를 Finmate가 직접 읽어 확인합니다. 사진 한 장이면 됩니다.
          </p>
        </div>

        <UploadBox label="고지서 PDF 또는 사진" onFileSelected={() => onUploaded()} />

        <div>
          <p className="mb-2 text-sm text-foreground-muted">또는 학교에서 바로 가져오기</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onUploaded}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <Link2 className="h-4 w-4 text-foreground-muted" />
              <span className="flex-1 text-[15px] text-foreground">한양대학교 포털 연결</span>
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
            </button>
            <button
              type="button"
              onClick={onUploaded}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <Mail className="h-4 w-4 text-foreground-muted" />
              <span className="flex-1 text-[15px] text-foreground">학교 이메일에서 찾기</span>
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
            </button>
          </div>
        </div>
      </div>
      <p className="flex items-center justify-center gap-1.5 px-5 pb-6 text-center text-xs text-foreground-subtle">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Finmate는 은행 비밀번호를 절대 묻지
        않습니다. 묻는 쪽이 있다면 사기입니다.
      </p>
    </div>
  );
}
