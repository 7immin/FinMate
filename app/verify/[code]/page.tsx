import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translate, translateShared } from "@/lib/i18n";
import { DocRow } from "@/components/flows/passport/ReportView";
import { PassportLevel, PurposeCategory } from "@/lib/types";

interface ReportRow {
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

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_report_by_code", { p_code: params.code });
  const report = (data as ReportRow[] | null)?.[0];

  if (error || !report) notFound();

  const t = (key: string, vars?: Record<string, string | number>) => translate("ko", key, vars);
  const tShared = (group: "school", id: string) => translateShared("ko", group, id);

  const purposeEntries = (Object.entries(report.purpose_counts ?? {}) as [string, number | undefined][])
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([category, count]) =>
      t("passport.report.categoryCount", { label: t(`passport.report.category.${category}`), count: count! })
    );

  const period =
    report.period_start && report.period_end
      ? `${report.period_start} - ${report.period_end}`
      : t("passport.report.noHistory");

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm space-y-4">
        <p className="text-center text-sm font-medium text-foreground-muted">{t("verify.pageTitle")}</p>
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium tracking-wide text-neutral-400">
              {t("passport.report.masthead")}
            </p>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
              F
            </span>
          </div>
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
              value={purposeEntries.length ? purposeEntries.join(" · ") : t("passport.report.noPurposeTx")}
            />
            <DocRow label={t("passport.report.periodLabel")} value={period} />
          </div>
        </div>
        <p className="text-center text-xs leading-relaxed text-foreground-subtle">{t("verify.footer")}</p>
      </div>
    </div>
  );
}
