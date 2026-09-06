"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Loader2, Phone, ShieldCheck, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ThreatRisk, ThreatScanResult } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * 사기 진단.
 *
 * 유학생을 노린 통장 대여·현금 수거책 모집은 카톡과 구인 사이트로 온다.
 * 그것을 읽고 위험한지 판단하려면 한국어와 한국 금융 관행을 둘 다 알아야
 * 하는데, 이 앱을 쓰는 사람은 둘 다 처음이다. 그래서 붙여넣기 하나만
 * 요구하고 나머지는 이쪽이 판단한다.
 *
 * 화면에서 가장 큰 활자는 판정 한 줄이다. 사용자가 알고 싶은 것은 단
 * 하나 — "이거 해도 되나"이기 때문이다. 근거와 조문은 그 아래 둔다.
 */
export default function ShieldPage() {
  const { t, tNode, lang } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [image, setImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<ThreatScanResult | null>(null);

  const [example] = tNode<string[]>("shield.examples") ?? [];
  const ready = text.trim().length > 0 || image !== null;

  async function pickImage(file: File) {
    const data = await fileToBase64(file);
    setImage({ data, mimeType: file.type || "image/jpeg", name: file.name });
  }

  async function scan() {
    if (!ready || status === "loading") return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/shield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: lang,
          image: image ? { data: image.data, mimeType: image.mimeType } : undefined,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const json = await res.json();
      setResult(json.result);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AppShell showNav>
      <TopBar title={t("shield.title")} />

      <div className="space-y-6 px-5 pb-10">
        <p className="text-[15px] leading-relaxed text-foreground-muted">{t("shield.subtitle")}</p>

        <div className="space-y-3">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("shield.placeholder")}
            aria-label={t("shield.inputLabel")}
            className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none focus:border-primary placeholder:text-foreground-muted"
          />

          {/* 카톡 대화는 옮겨 적기보다 캡처가 빠르다. 붙여넣기만 요구하면
              대화 스크린샷을 가진 사람이 진단을 포기한다. */}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])}
          />
          {image ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
              <ImagePlus className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 truncate text-[13px] text-foreground-muted">{image.name}</span>
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label={t("shield.remove")}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-white/[0.06]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-2.5 text-[13px] text-foreground-muted hover:border-primary/60"
            >
              <ImagePlus className="h-4 w-4 shrink-0" />
              {t("shield.attach")}
            </button>
          )}

          {/*
            예시는 한 건만 둔다. 짧은 한 줄("통장 빌려주면 30만원")은 누가
            봐도 사기라서, 이 기능이 무엇을 걸러내는지 보여주지 못한다.
            실제로 오는 제안은 회사 이름과 업무 설명이 붙어 그럴듯하고,
            그런 것을 가려내는 게 이 화면의 일이다.

            알약이 아니라 접힌 카드로 그린다 — 문단 길이의 글을 알약에
            넣으면 화면 절반을 알약 하나가 차지한다.
          */}
          {example && !text && !result && (
            <button
              type="button"
              onClick={() => setText(example)}
              className="w-full rounded-xl border border-dashed border-border-strong p-4 text-left transition hover:border-primary/60"
            >
              <span className="text-[12px] font-medium text-foreground-muted">
                {t("shield.tryExample")}
              </span>
              <span className="mt-2 line-clamp-3 block text-[13px] leading-relaxed text-foreground-subtle">
                {example}
              </span>
            </button>
          )}

          <Button onClick={scan} disabled={!ready || status === "loading"}>
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "loading" ? t("shield.scanning") : t("shield.scan")}
          </Button>

          {status === "error" && <p className="text-sm text-danger">{t("shield.error")}</p>}
          <p className="text-xs leading-relaxed text-foreground-subtle">{t("shield.privacy")}</p>
        </div>

        {result && <ScanResult result={result} />}
      </div>
    </AppShell>
  );
}

/** 판정별 색. 안전만 초록이고 나머지는 위험도에 따라 노랑→빨강이다. */
const RISK_STYLE: Record<ThreatRisk, { card: string; text: string }> = {
  critical: { card: "border-danger/50 bg-danger-muted", text: "text-danger" },
  high: { card: "border-danger/40 bg-danger-muted", text: "text-danger" },
  caution: { card: "border-warning/45 bg-warning-muted", text: "text-warning" },
  safe: { card: "border-success/40 bg-success-muted", text: "text-success" },
};

function ScanResult({ result }: { result: ThreatScanResult }) {
  const { t } = useTranslation();
  const style = RISK_STYLE[result.risk];
  const safe = result.risk === "safe";
  const types = result.types.filter((type) => type !== "none");

  return (
    <div className="space-y-4">
      <div className={cn("rounded-2xl border p-5", style.card)}>
        <div className="flex items-start gap-3">
          {safe ? (
            <ShieldCheck className={cn("mt-0.5 h-6 w-6 shrink-0", style.text)} />
          ) : (
            <AlertTriangle className={cn("mt-0.5 h-6 w-6 shrink-0", style.text)} />
          )}
          <div className="min-w-0">
            <p className={cn("text-[22px] font-bold leading-tight", style.text)}>
              {t(`shield.risk.${result.risk}`)}
            </p>
            {types.length > 0 && (
              <p className="mt-1.5 text-[13px] text-foreground-muted">
                {types.map((type) => t(`shield.type.${type}`)).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
          {result.explanation}
        </p>
      </div>

      {/* 원문에서 뽑아낸 구절. 사용자가 자기가 받은 메시지에서 이 부분을
          다시 찾아볼 수 있어야 하므로 원문 언어 그대로 둔다. */}
      {result.highlights.length > 0 && (
        <Section title={t("shield.highlights")}>
          <ul className="space-y-2">
            {result.highlights.map((line, i) => (
              <li
                key={i}
                className="rounded-lg border-l-2 border-danger/60 bg-white/[0.03] px-3 py-2 text-[14px] leading-relaxed text-foreground"
              >
                {line}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {result.consequences.length > 0 && (
        <Section title={t("shield.consequences")}>
          <ul className="space-y-2">
            {result.consequences.map((line, i) => (
              <li key={i} className="text-[14px] leading-relaxed text-foreground-muted">
                {line}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {result.actions.length > 0 && (
        <Section title={t("shield.actions")}>
          <ol className="space-y-2">
            {result.actions.map((line, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-foreground">
                <span className="shrink-0 font-medium text-primary">{i + 1}</span>
                {line}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {!safe && (
        <p className="flex items-center justify-center gap-2 text-[13px] font-medium text-foreground-muted">
          <Phone className="h-3.5 w-3.5" />
          {t("shield.report")}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <p className="mb-3 text-[13px] font-medium text-foreground-muted">{title}</p>
      {children}
    </Card>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result as string;
      resolve(value.slice(value.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
