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
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PROOF_OPTIONS, ProofOption } from "@/lib/mock/remittance";
import { checkProofDocument, ProofCheckResult } from "@/lib/ocr/client";
import { cn } from "@/lib/utils/cn";

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
  // 파일이 고른 종류의 서류로 보이는지 확인한 결과. 통과해야 요청이 열린다.
  const [check, setCheck] = useState<ProofCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  async function pickFile(picked: File) {
    setFile(picked);
    setCheck(null);
    setCheckFailed(false);
    setChecking(true);
    try {
      setCheck(await checkProofDocument(picked, selected));
    } catch {
      // 확인 자체가 실패한 것과 "다른 서류"인 것은 다르다. 모델을 못 불렀다고
      // 사용자를 막으면, 발표장 네트워크가 흔들리는 순간 아무도 요청을
      // 못 올린다. 이때는 통과시키고 담당자가 원본을 보게 한다.
      setCheckFailed(true);
    } finally {
      setChecking(false);
    }
  }
  const current = PROOF_OPTIONS.find((o) => o.id === selected)!;
  const askQuestion = t("remittance.unlock.askQuestion");
  // 확인이 끝났고 "다른 서류"라고 나온 경우에만 막는다.
  const mismatch = check !== null && !check.matches;

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
              <button key={option.id} type="button" onClick={() => {
                  setSelected(option.id);
                  // 종류가 바뀌면 앞서 확인한 결과는 더 이상 그 종류에
                  // 대한 판단이 아니다. 파일을 다시 확인하게 한다.
                  setFile(null);
                  setCheck(null);
                  setCheckFailed(false);
                }} className="block w-full text-left">
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
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) pickFile(picked);
          }}
        />
        {file ? (
          <div
            className={cn(
              "rounded-xl border px-4 py-3",
              mismatch ? "border-danger/50 bg-danger-muted" : "border-border bg-surface"
            )}
          >
            <div className="flex items-center gap-2">
              {checking ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : mismatch ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
              ) : (
                <Paperclip className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setCheck(null);
                  setCheckFailed(false);
                }}
                aria-label={t("remittance.unlock.removeFile")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-white/[0.06]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* 무엇이 문제인지 그 자리에서 말한다. "올릴 수 없습니다"만
                띄우면 사용자는 파일을 계속 바꿔 가며 찍어 볼 뿐이다. */}
            {checking && (
              <p className="mt-2 text-[13px] text-foreground-muted">
                {t("remittance.unlock.checking")}
              </p>
            )}
            {mismatch && check && (
              <p className="mt-2 text-[13px] leading-relaxed text-danger">
                {t("remittance.unlock.mismatch", { kind: check.documentKind })} {check.reason}
              </p>
            )}
            {checkFailed && (
              <p className="mt-2 text-[13px] leading-relaxed text-warning">
                {t("remittance.unlock.checkFailed")}
              </p>
            )}
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

        <Button
          onClick={() => file && onUnlocked(current, file.name)}
          disabled={!file || checking || mismatch}
        >
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
