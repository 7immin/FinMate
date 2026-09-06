"use client";

import { useMemo, useState } from "react";
import { Download, QrCode, Languages as LanguagesIcon, EyeOff, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { translate, translateShared } from "@/lib/i18n";
import { FinancialPassport, Language, UserProfile } from "@/lib/types";

function verificationCode(seed: string, nationalityCode: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `FM-${hash.toString(36).toUpperCase().padStart(4, "0").slice(0, 4)}-${nationalityCode}`;
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-[15px] font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function NavRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left"
    >
      <Icon className="h-[18px] w-[18px] text-primary" />
      <span className="flex-1 text-[15px] font-medium text-foreground">{label}</span>
      <ChevronRight className="h-4 w-4 text-foreground-subtle" />
    </button>
  );
}

export function ReportView({
  profile,
  passport,
  defaultLanguage,
  onClose,
}: {
  profile: UserProfile;
  passport: FinancialPassport;
  defaultLanguage: Language;
  onClose: () => void;
}) {
  const [reportLang, setReportLang] = useState<Language>(defaultLanguage);
  const [showQr, setShowQr] = useState(false);

  const t = (key: string, vars?: Record<string, string | number>) => translate(reportLang, key, vars);
  const tShared = (group: "country" | "school", id: string) => translateShared(reportLang, group, id);

  const onTimeCount = passport.paymentHistory.filter((r) => r.onTime).length;
  const total = passport.paymentHistory.length;
  const firstMonth = passport.paymentHistory[0]?.month;
  const lastMonth = passport.paymentHistory[passport.paymentHistory.length - 1]?.month;
  const periodValue = firstMonth && lastMonth ? `${firstMonth} - ${lastMonth}` : t("passport.report.noHistory");

  const code = useMemo(
    () => verificationCode(profile.name + passport.level, profile.nationalityCode),
    [profile.name, passport.level, profile.nationalityCode]
  );
  const issueDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  const purposeEntries = (Object.entries(passport.purposeCounts) as [string, number | undefined][])
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([category, count]) =>
      t("passport.report.categoryCount", { label: t(`passport.report.category.${category}`), count: count! })
    );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("passport.report.title")} closeIcon onBack={onClose} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium tracking-wide text-neutral-400">
              {t("passport.report.masthead")}
            </p>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
              F
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-900">{profile.name}</p>
            <p className="text-sm text-neutral-500">
              {profile.visaStatus} · {profile.nationalityCode} · {tShared("school", profile.school)}
            </p>
          </div>

          <div className="divide-y divide-neutral-200 border-t border-neutral-200 pt-1">
            <DocRow
              label={t("passport.report.levelLabel")}
              value={`${passport.level} · ${t(`passport.badge.${passport.level}`)}`}
            />
            <DocRow
              label={t("passport.report.onTimeLabel")}
              value={t("passport.report.onTimeValue", { onTime: onTimeCount, total })}
            />
            <DocRow
              label={t("passport.report.purposeLabel")}
              value={purposeEntries.length ? purposeEntries.join(" · ") : t("passport.report.noPurposeTx")}
            />
            <DocRow label={t("passport.report.periodLabel")} value={periodValue} />
          </div>

          <p className="border-t border-neutral-200 pt-3 text-xs leading-relaxed text-neutral-400">
            {t("passport.report.disclaimer", { date: issueDate, code })}
          </p>
        </div>

        {showQr && (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-card">
            <div className="grid h-40 w-40 grid-cols-5 grid-rows-5 gap-1 rounded-lg bg-white p-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={(i * 7 + code.length) % 3 === 0 ? "rounded-sm bg-black" : "rounded-sm bg-white"}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-500">{t("passport.report.qrCaption")}</p>
          </div>
        )}

        <Card className="divide-y divide-border">
          <NavRow icon={Download} label={t("passport.report.savePdf")} onClick={() => window.print()} />
          <NavRow
            icon={QrCode}
            label={t("passport.report.showQr")}
            onClick={() => setShowQr((v) => !v)}
          />
          <NavRow
            icon={LanguagesIcon}
            label={reportLang === "en" ? t("passport.report.getKoreanReport") : t("passport.report.getEnglishReport")}
            onClick={() => setReportLang((prev) => (prev === "en" ? defaultLanguage : "en"))}
          />
        </Card>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground-subtle">
          <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("passport.report.bottomDisclaimer")}
        </p>
      </div>
    </div>
  );
}
