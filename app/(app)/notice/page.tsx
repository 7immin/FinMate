"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, ExternalLink, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { EnrollmentEntry, EnrollmentNotice } from "@/lib/crawler/types";
import { cn } from "@/lib/utils/cn";

interface NoticeResponse {
  supported: boolean;
  notice?: EnrollmentNotice;
  cached?: boolean;
}

/**
 * 학교 등록 일정.
 *
 * 유학생이 등록금 앞에서 막히는 첫 이유는 한도가 아니라 "언제까지 내야
 * 하는지 공지를 읽을 수 없어서"다. 그 공지를 대신 읽어 기한과 제약만
 * 남긴다.
 *
 * 이 화면이 목업에는 없다. 하지만 학비 흐름 전체가 "기한이 언제인가"에서
 * 시작하고, 지금 그 값이 mock으로 박혀 있어 실제 마감과 무관하다.
 */
export default function NoticePage() {
  const { t, lang } = useTranslation();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [data, setData] = useState<NoticeResponse | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/notice");
      if (!res.ok) throw new Error("request failed");
      setData(await res.json());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notice = data?.notice;
  // notice?.entries ?? []를 그대로 useMemo 의존성에 넣으면 매 렌더 새 배열이
  // 만들어져 메모가 무의미해진다. 원본 참조를 그대로 의존성으로 둔다.
  const entries = useMemo(() => notice?.entries ?? [], [notice]);
  const keyEntries = useMemo(() => pickKeyEntries(entries), [entries]);
  const shown = showAll ? entries : keyEntries;

  return (
    <AppShell showNav>
      <TopBar title={t("notice.title")} />

      <div className="space-y-5 px-5 pb-10">
        <p className="text-[15px] leading-relaxed text-foreground-muted">{t("notice.subtitle")}</p>

        {status === "loading" && (
          <p className="flex items-center gap-2 text-[15px] text-foreground-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("notice.loading")}
          </p>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-danger">{t("notice.error")}</p>
            <Button variant="outline" onClick={load}>
              {t("notice.retry")}
            </Button>
          </div>
        )}

        {status === "ready" && data && !data.supported && (
          <Card className="text-[15px] leading-relaxed text-foreground-muted">
            {t("notice.unsupported")}
          </Card>
        )}

        {notice && (
          <>
            <p className="text-[17px] font-bold text-foreground">
              {notice.academicYear} {notice.semester}
            </p>

            {/* 실시간 조회가 막혔다는 사실을 감추지 않는다. 저장된 사본을
                최신인 것처럼 보여주면 지난 학기 기한을 알려줄 수 있다. */}
            {notice.fromSnapshot && (
              <p className="flex items-start gap-2 rounded-xl border border-warning/45 bg-warning-muted px-4 py-3 text-[13px] leading-relaxed text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {t("notice.snapshot")}
              </p>
            )}

            <Section title={t("notice.schedule")}>
              {shown.length > 0 ? (
                <ul className="space-y-3">
                  {shown.map((entry, i) => (
                    <ScheduleRow key={i} entry={entry} lang={lang} />
                  ))}
                </ul>
              ) : (
                <Card className="text-[14px] leading-relaxed text-foreground-muted">
                  {t("notice.noUpcoming")}
                </Card>
              )}
              {/* 처음에는 두 줄만. 나머지는 접어 둔다(pickKeyEntries 주석 참고). */}
              {entries.length > keyEntries.length && (
                <button
                  type="button"
                  onClick={() => setShowAll((on) => !on)}
                  className="mt-3 text-[13px] font-medium text-primary"
                >
                  {showAll
                    ? t("notice.showLess")
                    : `${t("notice.showAll")} · ${t("notice.moreCount", {
                        count: entries.length - keyEntries.length,
                      })}`}
                </button>
              )}
            </Section>

            {/* 이 서비스의 존재 이유. 분할송금을 금지하면서 이체 한도는
                기본값인 상황이 곧 유학생이 등록금 앞에서 막히는 지점이다.

                근거 문장이 없으면 띄우지 않는다. 위 일정에 "분할납부 1차"가
                버젓이 있는데 아래에 "분할 금지"가 뜨면 사용자는 둘 중 뭘
                믿어야 할지 알 수 없다. 원문을 함께 보여줘야 두 말이 서로
                다른 것을 가리킨다는 게 드러난다. */}
            {!notice.terms.splitTransferAllowed && notice.terms.splitTransferNote && (
              <div className="rounded-2xl border border-warning/45 bg-warning-muted p-5">
                <p className="flex items-center gap-2 text-[16px] font-bold text-warning">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  {t("notice.splitBanned")}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-foreground">
                  {t("notice.splitBannedWhy")}
                </p>
                <div className="mt-3 border-l-2 border-warning/50 pl-3">
                  <p className="text-[11px] font-medium text-foreground-subtle">
                    {t("notice.splitSource")}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground-muted">
                    {notice.terms.splitTransferNote[lang] || notice.terms.splitTransferNote.ko}
                  </p>
                </div>
                <Link href="/tuition" className="mt-4 block">
                  <Button variant="outline" tabIndex={-1}>
                    {t("notice.openLimit")}
                  </Button>
                </Link>
              </div>
            )}

            <Section title={t("notice.terms")}>
              <dl className="space-y-2.5 text-[14px]">
                {notice.terms.methods.length > 0 && (
                  <Row label={t("notice.methods")} value={notice.terms.methods.join(", ")} />
                )}
                {notice.terms.virtualAccountBank && (
                  <Row label={t("notice.bank")} value={notice.terms.virtualAccountBank} />
                )}
              </dl>
            </Section>

            {notice.terms.notes.length > 0 && (
              <Section title={t("notice.notes")}>
                <ul className="space-y-2.5">
                  {notice.terms.notes.map((note, i) => (
                    <li key={i} className="text-[14px] leading-relaxed text-foreground-muted">
                      {note[lang] || note.ko}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 출처를 반드시 남긴다. 이 값들은 우리가 만든 것이 아니라
                학교 공지에서 읽어 온 것이고, 사용자가 원문을 확인할 수
                있어야 우리 말을 믿을 근거가 생긴다. */}
            <Section title={t("notice.source")}>
              <ul className="space-y-2">
                {notice.sources.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 break-all text-[13px] text-primary underline underline-offset-4"
                    >
                      {url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-foreground-subtle">
                {t("notice.fetchedAt")} {new Date(notice.fetchedAt).toLocaleString()}
              </p>
            </Section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ScheduleRow({ entry, lang }: { entry: EnrollmentEntry; lang: string }) {
  const { t } = useTranslation();
  const days = daysUntil(entry.endDate);

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        {/* 항목명과 날짜를 좌우로 나란히 두면 좁은 폰에서 긴 항목명이 한
            글자씩 세로로 접혀 열이 통째로 무너진다. 위아래로 쌓는다. */}
        <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-foreground">
          {entry.label[lang as keyof typeof entry.label] || entry.label.ko}
        </p>
        <span className="shrink-0 rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-foreground-muted">
          {t(`notice.kind.${entry.kind}`)}
          {entry.installmentRound ? ` ${entry.installmentRound}` : ""}
        </span>
      </div>
      <p className="mt-2 flex items-center gap-2 text-[13px] text-foreground-muted">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
        {entry.startDate} – {entry.endDate}
        {entry.endTime ? ` ${entry.endTime}` : ""}
      </p>
      {/* 마감이 지난 항목에는 배지를 붙이지 않는다. 음수 D-day는 아무
          뜻도 없고, 지난 일정까지 강조하면 다가오는 것이 묻힌다. */}
      {days !== null && (
        <p
          className={cn(
            "mt-2 text-[12px] font-medium",
            days <= 7 ? "text-warning" : "text-primary"
          )}
        >
          {days === 0 ? t("notice.ddayToday") : t("notice.dday", { days })}
        </p>
      )}
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[13px] font-medium text-foreground-muted">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-foreground-muted">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

/**
 * 처음 보여줄 일정 두 건을 고른다 — 오늘 기준으로 가장 급한 순서로.
 *
 * 이 화면에 오는 사람이 구하는 답은 "다음에 언제까지 내야 하나" 하나다.
 * 그래서 마감이 지난 항목은 아예 빼고, 남은 것 중 가장 빨리 닥치는
 * 둘만 남긴다. 나머지는 "일정 전체 보기"에 접어 둔다 — 지우지는 않는다.
 * 분납 회차 마감을 놓치면 그것도 연체이기 때문이다.
 *
 * 남은 일정이 하나도 없으면 빈 배열을 돌려준다. 지난 날짜를 채워 넣는
 * 것보다 "남은 일정이 없다"고 말하는 편이 정확하다.
 */
function pickKeyEntries(entries: EnrollmentEntry[], max = 2): EnrollmentEntry[] {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return entries
    .filter((entry) => {
      const end = Date.parse(`${entry.endDate}T00:00:00Z`);
      return Number.isFinite(end) && end >= today;
    })
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .slice(0, max);
}

function daysUntil(endDate: string): number | null {
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(end)) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((end - today) / 86_400_000);
  return days >= 0 ? days : null;
}
