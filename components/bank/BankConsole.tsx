"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { DocRow } from "@/components/flows/passport/ReportView";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PassportLevel, PurposeCategory } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface BankRequest {
  id: string;
  purpose: string;
  amount: number;
  evidence: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  studentName: string;
  visaStatus: string;
  school: string;
  level: string;
  currentLimit: number;
  evidenceUrl: string | null;
}

interface BankReport {
  name: string;
  visa_status: string;
  nationality_code: string;
  school: string;
  level: PassportLevel;
  on_time_count: number;
  total_count: number;
  purpose_counts: Partial<Record<PurposeCategory, number>>;
  period_start: string | null;
  period_end: string | null;
}

const CODE_STORAGE_KEY = "finmate.bankAccessCode";

/**
 * 은행 담당자 창구.
 *
 * 이 화면이 답하는 것은 "학생 앱에서 올라온 한도 요청을 누가 어떻게
 * 승인하느냐"다. 학생 쪽은 증빙을 정리해 요청까지만 하고, 한도가 실제로
 * 열리는 것은 여기서 승인 버튼을 누르는 순간뿐이다.
 *
 * 학생 앱의 더보기에 두지 않는다. 학생에게는 평생 쓸 일이 없는 화면이고,
 * 자기 메뉴에 "은행 담당자용"이 섞여 있으면 이 앱이 누구를 위한 것인지
 * 흐려진다. 로그인 전 화면 맨 아래에서만 들어온다.
 */
export function BankConsole() {
  const { t } = useTranslation();
  const [accessCode, setAccessCode] = useState<string | null>(null);

  // 창구 직원이 화면을 열 때마다 코드를 다시 치게 하면 아무도 쓰지 않는다.
  // 브라우저에만 담아 둔다 — 지점 공용 PC 한 대에 한 번 넣어 두는 용도다.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CODE_STORAGE_KEY);
      if (saved) setAccessCode(saved);
    } catch {
      // 접근이 막혀 있으면 매번 입력받는다.
    }
  }, []);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[560px] flex-col bg-background px-5 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <Logo height={18} />
          <span className="text-[11px] text-foreground-muted">{t("bank.workspace")}</span>
        </div>
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap rounded-full border border-border-strong px-3 py-1.5 text-[11px] text-foreground-muted hover:text-foreground"
        >
          {t("bank.studentApp")}
        </Link>
      </div>

      {accessCode ? (
        <RequestQueue
          accessCode={accessCode}
          onSignOut={() => {
            setAccessCode(null);
            try {
              sessionStorage.removeItem(CODE_STORAGE_KEY);
            } catch {
              // 지우지 못해도 화면은 잠긴 상태로 돌아간다.
            }
          }}
        />
      ) : (
        <AccessGate
          onUnlock={(code) => {
            setAccessCode(code);
            try {
              sessionStorage.setItem(CODE_STORAGE_KEY, code);
            } catch {
              // 저장 실패해도 이번 세션 동안은 열린다.
            }
          }}
        />
      )}
    </div>
  );
}

/**
 * 접근 코드 문턱.
 *
 * 인증이 아니라 문턱이다. 제대로 하려면 담당자 계정과 권한 테이블이
 * 있어야 하는데, 그건 은행 제휴가 정해진 뒤에 붙일 일이다. 지금 없는 것을
 * 있는 척하지 않으려고 이름도 "접근 코드"로 둔다.
 */
function AccessGate({ onUnlock }: { onUnlock: (code: string) => void }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "notConfigured">("idle");

  async function submit() {
    if (!code.trim() || status === "checking") return;
    setStatus("checking");
    const res = await fetch("/api/bank/requests", {
      headers: { "x-bank-access-code": code.trim() },
    });
    if (res.ok) {
      onUnlock(code.trim());
      return;
    }
    setStatus(res.status === 503 ? "notConfigured" : "wrong");
  }

  return (
    <div className="mt-14">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Lock className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-[22px] font-bold text-foreground">{t("bank.gateTitle")}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-foreground-muted">
        {t("bank.gateDescription")}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={t("bank.gatePlaceholder")}
          aria-label={t("bank.gateTitle")}
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary placeholder:text-foreground-muted"
        />
        <Button
          onClick={submit}
          disabled={!code.trim() || status === "checking"}
          className="w-auto shrink-0 px-5"
        >
          {status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("bank.enter")}
        </Button>
      </div>

      {status === "wrong" && <p className="mt-3 text-sm text-danger">{t("bank.gateWrong")}</p>}
      {/* 설정이 안 된 것과 코드가 틀린 것을 구분해서 말한다. 둘을 뭉뚱그리면
          담당자가 코드만 계속 다시 쳐 보게 된다. */}
      {status === "notConfigured" && (
        <p className="mt-3 text-sm leading-relaxed text-warning">
          {t("bank.notConfigured")}
        </p>
      )}
    </div>
  );
}

const STATUS_STYLE: Record<BankRequest["status"], string> = {
  pending: "bg-warning-muted text-warning",
  approved: "bg-success-muted text-success",
  rejected: "bg-danger-muted text-danger",
};

function RequestQueue({ accessCode, onSignOut }: { accessCode: string; onSignOut: () => void }) {
  const { t, tShared } = useTranslation();
  const [requests, setRequests] = useState<BankRequest[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [deciding, setDeciding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/bank/requests", {
        headers: { "x-bank-access-code": accessCode },
      });
      if (!res.ok) throw new Error("request failed");
      const json = await res.json();
      setRequests(json.requests ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [accessCode]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setDeciding(id);
    try {
      const res = await fetch("/api/bank/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bank-access-code": accessCode },
        body: JSON.stringify({ id, decision }),
      });
      if (!res.ok) throw new Error("decide failed");
      await load();
    } catch {
      setStatus("error");
    } finally {
      setDeciding(null);
    }
  }

  const pending = requests.filter((req) => req.status === "pending");
  const decided = requests.filter((req) => req.status !== "pending");

  return (
    <>
      <div className="mt-7 flex items-baseline justify-between gap-4">
        <h1 className="text-[22px] font-bold text-foreground">{t("bank.queueTitle")}</h1>
        <button
          type="button"
          onClick={load}
          className="flex shrink-0 items-center gap-1.5 text-[12px] text-foreground-muted hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", status === "loading" && "animate-spin")} />
          {t("bank.refresh")}
        </button>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-foreground-muted">
        {t("bank.queueDescription")}
      </p>

      {status === "error" && <p className="mt-4 text-sm text-danger">{t("bank.error")}</p>}

      {status !== "loading" && pending.length === 0 && (
        <Card className="mt-5 text-[14px] leading-relaxed text-foreground-muted">
          {t("bank.queueEmpty")}
        </Card>
      )}

      <div className="mt-5 space-y-3">
        {pending.map((req) => (
          <Card key={req.id} raised className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{req.studentName}</p>
                <p className="mt-0.5 text-[12px] text-foreground-muted">
                  {req.visaStatus} · {tShared("school", req.school)} · {req.level}
                </p>
              </div>
              <span className="shrink-0 text-[17px] font-bold text-foreground">
                +{req.amount.toLocaleString()}
                <span className="ml-1 text-[11px] font-normal text-foreground-muted">KRW</span>
              </span>
            </div>

            <dl className="space-y-1.5 border-t border-border pt-3 text-[13px]">
              <QueueRow label={t("bank.purpose")} value={t(`passport.report.category.${req.purpose}`)} />
              {/* 무엇으로 목적을 증명했는지가 담당자가 판단하는 근거다.
                  이것 없이 금액만 보여주면 승인이 그냥 도장 찍기가 된다. */}
              {req.evidence && <QueueRow label={t("bank.evidence")} value={req.evidence} />}
              <QueueRow
                label={t("bank.currentLimit")}
                value={`${req.currentLimit.toLocaleString()} KRW`}
              />
              <QueueRow label={t("bank.requestedAt")} value={formatWhen(req.created_at)} />
            </dl>

            {/*
              서류를 실제로 열어 본다. 이게 없으면 담당자는 "근로계약서"라는
              글자와 파일명만 보고 승인 여부를 정하게 되고, 그러면 증빙을
              요구한 의미가 없다.

              올라온 파일이 없는 요청도 있다(업로드 실패, 또는 이 기능이
              붙기 전에 올라온 건). 그때는 그 사실을 밝힌다 — 버튼만 사라지면
              담당자는 자기가 못 찾는 것인지 원래 없는 것인지 알 수 없다.
            */}
            {req.evidenceUrl ? (
              <a
                href={req.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-primary/50 px-4 py-2.5 text-[14px] font-medium text-primary hover:bg-primary/10"
              >
                <FileText className="h-4 w-4 shrink-0" />
                {t("bank.openEvidence")}
                <ExternalLink className="ml-auto h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="rounded-xl border border-dashed border-border-strong px-4 py-2.5 text-[13px] leading-relaxed text-foreground-muted">
                {t("bank.noEvidenceFile")}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => decide(req.id, "approved")}
                disabled={deciding === req.id}
                className="flex-1"
              >
                {deciding === req.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {t("bank.approve")}
              </Button>
              <Button
                variant="outline"
                onClick={() => decide(req.id, "rejected")}
                disabled={deciding === req.id}
                className="flex-1 border-danger/50 text-danger hover:bg-danger/10"
              >
                <X className="h-4 w-4" />
                {t("bank.reject")}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 처리한 건도 남긴다. 방금 누른 것이 목록에서 사라지기만 하면
          담당자는 자기가 승인했는지 거절했는지 확인할 길이 없다. */}
      {decided.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-[13px] font-medium text-foreground-muted">{t("bank.decided")}</p>
          <div className="space-y-2">
            {decided.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                  {req.studentName} · +{req.amount.toLocaleString()} KRW
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium",
                    STATUS_STYLE[req.status]
                  )}
                >
                  {t(`bank.status.${req.status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CodeLookup accessCode={accessCode} />

      <button
        type="button"
        onClick={onSignOut}
        className="mt-8 text-center text-[11px] text-foreground-subtle underline underline-offset-4 hover:text-foreground-muted"
      >
        {t("bank.lock")}
      </button>
    </>
  );
}

/**
 * 검증코드 조회.
 *
 * 요청 목록과 별개로 필요하다. 학생이 계좌 개설처럼 요청과 무관한 일로
 * 창구에 와서 금융여권을 내미는 경우가 있고, 그때 담당자가 확인할 곳이
 * 여기다.
 */
function CodeLookup({ accessCode }: { accessCode: string }) {
  const { t, tShared } = useTranslation();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "notFound" | "error">("idle");
  const [report, setReport] = useState<BankReport | null>(null);

  async function lookup() {
    const target = code.trim().toUpperCase();
    if (!target || status === "loading") return;
    setStatus("loading");
    setReport(null);
    try {
      const res = await fetch("/api/bank/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bank-access-code": accessCode },
        body: JSON.stringify({ code: target }),
      });
      if (!res.ok) throw new Error("request failed");
      const json = await res.json();
      if (!json.found) {
        setStatus("notFound");
        return;
      }
      setReport(json.report);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const purposeEntries = report
    ? (Object.entries(report.purpose_counts ?? {}) as [string, number | undefined][])
        .filter(([, count]) => (count ?? 0) > 0)
        .map(([category, count]) =>
          t("passport.report.categoryCount", {
            label: t(`passport.report.category.${category}`),
            count: count!,
          })
        )
    : [];

  return (
    <div className="mt-10 border-t border-border pt-6">
      <p className="text-[13px] font-medium text-foreground-muted">{t("bank.lookupTitle")}</p>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") lookup();
          }}
          placeholder={t("bank.placeholder")}
          aria-label={t("bank.codeLabel")}
          spellCheck={false}
          className="h-11 w-full rounded-xl border border-border bg-surface px-4 font-mono text-[14px] uppercase text-foreground outline-none focus:border-primary placeholder:font-sans placeholder:normal-case placeholder:text-foreground-muted"
        />
        <Button
          variant="outline"
          onClick={lookup}
          disabled={!code.trim() || status === "loading"}
          className="w-auto shrink-0 px-4"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {status === "notFound" && <p className="mt-3 text-sm text-warning">{t("bank.notFound")}</p>}
      {status === "error" && <p className="mt-3 text-sm text-danger">{t("bank.error")}</p>}

      {report && (
        <div className="mt-4 space-y-4 rounded-2xl bg-white p-6 shadow-card">
          <p className="text-xs font-medium tracking-wide text-neutral-400">
            {t("passport.report.masthead")}
          </p>
          <div>
            <p className="text-lg font-semibold text-neutral-900">{report.name}</p>
            <p className="text-sm text-neutral-500">
              {report.visa_status} · {report.nationality_code} · {tShared("school", report.school)}
            </p>
          </div>
          <div className="divide-y divide-neutral-200 border-t border-neutral-200 pt-1">
            <DocRow
              label={t("passport.report.levelLabel")}
              value={`${report.level} · ${t(`passport.badge.${report.level}`)}`}
            />
            <DocRow
              label={t("passport.report.onTimeLabel")}
              value={t("passport.report.onTimeValue", {
                onTime: report.on_time_count,
                total: report.total_count,
              })}
            />
            <DocRow
              label={t("passport.report.purposeLabel")}
              value={
                purposeEntries.length
                  ? purposeEntries.join(" · ")
                  : t("passport.report.noPurposeTx")
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function QueueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-foreground-muted">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}
