"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TuitionInvoice, computeDDay } from "@/lib/mock/tuition";
import { SCHOOL_TUITION_PAGE } from "@/lib/data/school-tuition-pages";
import type {
  AccountCheckVerdict,
  TuitionAccountCheck,
} from "@/app/api/tuition/verify-account/route";
import { Check, HelpCircle } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-[15px] font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ResultStep({
  invoice,
  ocrFailed,
  onConfirm,
  onRetry,
}: {
  invoice: TuitionInvoice;
  ocrFailed?: boolean;
  onConfirm: () => void;
  onRetry: () => void;
}) {
  const { t, tShared } = useTranslation();
  const tuitionPage = SCHOOL_TUITION_PAGE[invoice.recipient];
  // 고지서의 가상계좌를 학교 공지와 대조한다. 실패하면 null로 남고,
  // 화면은 "직접 대조하세요"만 말한다.
  const [check, setCheck] = useState<TuitionAccountCheck | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tuition/verify-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        virtualAccountBank: invoice.virtualAccountBank,
        accountHolder: invoice.accountHolder,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.check) setCheck(data.check);
      })
      .catch(() => {
        // 대조에 실패해도 화면은 계속 간다.
      });
    return () => {
      cancelled = true;
    };
  }, [invoice.virtualAccountBank, invoice.accountHolder]);
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("tuition.result.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        {ocrFailed ? (
          <Card className="flex gap-2.5 bg-warning-muted">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm leading-relaxed text-warning">{t("tuition.result.ocrFailedWarning")}</p>
          </Card>
        ) : (
          <Badge tone="success" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            {t("tuition.result.verifiedBadge")}
          </Badge>
        )}

        <h1 className="text-[22px] font-bold text-foreground">{invoice.title}</h1>

        <Card className="divide-y divide-border">
          <InfoRow label={t("tuition.result.amountLabel")} value={`${invoice.amount.toLocaleString()} KRW`} />
          <InfoRow
            label={t("tuition.result.dueLabel")}
            value={`${invoice.dueDate} ${computeDDay(invoice.dueDate)}`}
          />
          {/* 고지서에서 읽어 낸 기관을 보여준다. 못 읽었을 때만 프로필의
              학교로 떨어진다 — 돈이 어디로 가는지를 우리가 지어내면 안 된다. */}
          <InfoRow
            label={t("tuition.result.recipientLabel")}
            value={invoice.institutionName ?? tShared("school", invoice.recipient)}
          />
          <InfoRow label={t("tuition.result.accountLabel")} value={invoice.virtualAccount} />
        </Card>

        {/*
          여기에 "학교 공시 계좌와 일치 / 개인 명의 아님 / 신고된 사기 계좌
          목록에 없음" 세 줄이 늘 체크된 채로 떠 있었다. 셋 다 우리가 확인한
          적이 없다 — 학교 공시 계좌 목록도, 예금주 정보도, 사기 계좌 DB도
          없다. 사용자가 수백만 원 송금을 결정하는 화면에서 하지 않은 검증을
          했다고 말하면, 정작 진짜 위조 고지서가 왔을 때도 이 화면을 믿는다.

          우리가 아는 것은 고지서에서 읽어 낸 계좌번호뿐이다. 그러니 그것을
          학교 공시 계좌와 대조하는 일은 사용자에게 넘기고, 대조할 곳(학교
          등록금 안내 페이지)까지 같이 준다.
        */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">
            {t("tuition.result.checkYourselfTitle")}
          </p>
          <Card className="space-y-3">
            {/* 우리가 실제로 대조한 결과. 학교 공지에서 읽은 은행과
                고지서에서 읽은 은행을 맞춰 본다. 확인 못 한 것은 통과로
                뭉개지 않고 사용자에게 직접 대조하라고 말한다. */}
            {check ? (
              <div className="space-y-2.5">
                <CheckLine
                  verdict={check.bank}
                  okLabel={t("tuition.result.bankOk", { bank: check.publishedBank ?? "" })}
                  badLabel={t("tuition.result.bankMismatch", {
                    bank: check.publishedBank ?? "",
                  })}
                  unknownLabel={t("tuition.result.bankUnknown")}
                />
                <CheckLine
                  verdict={check.holder}
                  okLabel={t("tuition.result.holderOk", { holder: check.invoiceHolder ?? "" })}
                  badLabel={t("tuition.result.holderMismatch", {
                    holder: check.invoiceHolder ?? "",
                  })}
                  unknownLabel={t("tuition.result.holderUnknown")}
                />
              </div>
            ) : (
              <p className="text-[14px] leading-relaxed text-foreground-muted">
                {t("tuition.result.checking")}
              </p>
            )}
            <p className="border-t border-border pt-3 text-[14px] leading-relaxed text-foreground">
              {t("tuition.result.checkAccount")}
            </p>
            {tuitionPage && (
              <a
                href={tuitionPage}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[14px] font-medium text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                {t("tuition.result.openSchoolPage")}
              </a>
            )}
            <p className="border-t border-border pt-3 text-[13px] leading-relaxed text-warning">
              {t("tuition.result.personalAccountWarning")}
            </p>
          </Card>
        </div>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button onClick={onConfirm}>{t("tuition.result.confirm")}</Button>
        <button
          type="button"
          onClick={onRetry}
          className="w-full text-center text-sm text-foreground-muted"
        >
          {t("tuition.result.retry")}
        </button>
      </div>
    </div>
  );
}

/** 대조 결과 한 줄. 확인됨·불일치·확인 못 함을 색과 아이콘으로 나눈다. */
function CheckLine({
  verdict,
  okLabel,
  badLabel,
  unknownLabel,
}: {
  verdict: AccountCheckVerdict;
  okLabel: string;
  badLabel: string;
  unknownLabel: string;
}) {
  if (verdict === "ok") {
    return (
      <p className="flex items-start gap-2 text-[14px] leading-relaxed text-success">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        {okLabel}
      </p>
    );
  }
  if (verdict === "mismatch") {
    return (
      <p className="flex items-start gap-2 text-[14px] font-medium leading-relaxed text-danger">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        {badLabel}
      </p>
    );
  }
  return (
    <p className="flex items-start gap-2 text-[14px] leading-relaxed text-foreground-muted">
      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {unknownLabel}
    </p>
  );
}
