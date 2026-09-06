"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Landmark,
  GraduationCap,
  MessageCircleQuestion,
  ChevronRight,
  Paperclip,
  X,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PROOF_OPTIONS, ProofOption } from "@/lib/mock/remittance";

const ICONS: Record<ProofOption["id"], typeof FileText> = {
  employment: FileText,
  homeRemittance: Landmark,
  scholarship: GraduationCap,
};

export function UnlockStep({
  onUnlocked,
}: {
  onUnlocked: (option: ProofOption, fileName: string) => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(PROOF_OPTIONS[0].id);
  // 서류를 실제로 붙여야 요청이 올라간다. 예전에는 증빙 종류만 고르면
  // 그대로 요청이 됐는데, 그러면 은행 담당자는 "근로계약서"라는 글자만
  // 보고 승인 여부를 판단하게 된다 — 아무것도 증명되지 않은 셈이다.
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const current = PROOF_OPTIONS.find((o) => o.id === selected)!;
  const askQuestion = t("remittance.unlock.askQuestion");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.unlock.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("remittance.unlock.headline")}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground-muted">
            {t("remittance.unlock.description")}
          </p>
        </div>

        <div className="space-y-3">
          {PROOF_OPTIONS.map((option) => {
            const Icon = ICONS[option.id];
            const active = selected === option.id;
            return (
              <button key={option.id} type="button" onClick={() => setSelected(option.id)} className="block w-full text-left">
                <Card raised={active} className={active ? "border-primary" : undefined}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px] text-primary" />
                      <span className="text-[15px] font-medium text-foreground">
                        {t(`remittance.proof.${option.id}.label`)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-success">
                      +{option.bonus.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[30px] text-sm text-foreground-muted">
                    {t(`remittance.proof.${option.id}.description`)}
                  </p>
                </Card>
              </button>
            );
          })}
        </div>

        <Link href={`/ai?q=${encodeURIComponent(askQuestion)}`}>
          <Card className="flex items-center gap-3">
            <MessageCircleQuestion className="h-[18px] w-[18px] text-primary" />
            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">{t("remittance.unlock.askTitle")}</p>
              <p className="text-sm text-foreground-muted">{t("remittance.unlock.askDesc")}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground-subtle" />
          </Card>
        </Link>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <input
          ref={fileInput}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
            <Paperclip className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">{file.name}</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              aria-label={t("remittance.unlock.removeFile")}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-white/[0.06]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-3 text-[14px] text-foreground-muted hover:border-primary/60"
          >
            <Paperclip className="h-4 w-4 shrink-0" />
            {t("remittance.unlock.attach")}
          </button>
        )}

        <Button onClick={() => file && onUnlocked(current, file.name)} disabled={!file}>
          {t(`remittance.proof.${current.id}.cta`)}
        </Button>
        {!file && (
          <p className="text-center text-xs leading-relaxed text-foreground-subtle">
            {t("remittance.unlock.attachRequired")}
          </p>
        )}
      </div>
    </div>
  );
}
