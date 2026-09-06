"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { translateShared } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

/**
 * 나라 고르기 시트.
 *
 * 나라가 250개면 <select>로는 못 찾는다. 펼쳐 놓고 손으로 굴려 내려가는
 * 것이 유일한 방법인데, 이 앱을 쓰는 사람은 자기 나라 이름이 한국어로
 * 뭔지도 모를 수 있다.
 *
 * 검색은 "시작하는 것"을 먼저 보여준다. "일"을 치면 일본이 맨 위로 와야지,
 * 이름 어딘가에 "일"이 든 나라(칠레, 브라질)가 섞여 나오면 안 된다.
 * 다만 포함하는 것도 뒤에 남긴다 — "기니"를 치는 사람에게 "파푸아뉴기니"는
 * 찾던 답일 수 있다.
 *
 * 사용자 언어와 영어 양쪽에 걸리게 한다. 한국어 화면을 쓰면서 "Japan"이라고
 * 치는 사람이 있고, 그 반대도 있다.
 */
export function CountrySearchSheet({
  open,
  onClose,
  codes,
  value,
  onSelect,
  title,
  renderMeta,
}: {
  open: boolean;
  onClose: () => void;
  codes: readonly string[];
  value?: string;
  onSelect: (code: string) => void;
  title: string;
  /** 오른쪽에 붙는 부가 정보(예: 통화 코드). 없으면 안 그린다. */
  renderMeta?: (code: string) => React.ReactNode;
}) {
  const { t, tShared } = useTranslation();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const named = codes.map((code) => ({
      code,
      label: tShared("country", code),
      english: translateShared("en", "country", code),
    }));

    const q = query.trim().toLowerCase();
    if (!q) return named;

    const starts = named.filter(
      (c) => c.label.toLowerCase().startsWith(q) || c.english.toLowerCase().startsWith(q)
    );
    const contains = named.filter(
      (c) =>
        !starts.includes(c) &&
        (c.label.toLowerCase().includes(q) ||
          c.english.toLowerCase().includes(q) ||
          c.code.toLowerCase() === q)
    );
    return [...starts, ...contains];
  }, [codes, query, tShared]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex max-h-[75vh] w-full max-w-[480px] flex-col rounded-t-3xl border-t border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <p className="text-[15px] font-semibold text-foreground">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.back")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-foreground-muted hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search className="h-4 w-4 shrink-0 text-foreground-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("remittance.input.countrySearch")}
              className="h-11 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-foreground-muted"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
          {results.length === 0 && (
            <p className="px-2 py-6 text-center text-[14px] text-foreground-muted">
              {t("remittance.input.countryNoResult")}
            </p>
          )}
          {results.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onSelect(country.code);
                onClose();
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left",
                value === country.code ? "bg-primary/15" : "hover:bg-white/[0.04]"
              )}
            >
              <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
                {country.label}
              </span>
              {renderMeta?.(country.code)}
              {value === country.code && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
