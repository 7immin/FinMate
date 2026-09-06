"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { translateShared } from "@/lib/i18n";
import { REMITTANCE_COUNTRIES, findCountry } from "@/lib/remittance/countries";
import { cn } from "@/lib/utils/cn";

/**
 * 받는 나라 고르기.
 *
 * 알약 네 개에 "+3"을 붙여 두었던 자리다. "+3"은 나라가 아니고, 누르면
 * 다섯 번째 나라가 그냥 골라져 버렸다 — 자기 나라를 못 찾는 사람에게는
 * 목록이 없는 것과 같았다.
 *
 * 자주 가는 넷은 그대로 밖에 두되(대부분 그 안에서 끝난다), 나머지는
 * 검색으로 찾는다. 검색어는 그 사람의 언어로 된 나라 이름과 영어 이름
 * 양쪽에 걸리게 한다 — 한국어 화면을 쓰면서 "Vietnam"이라고 치는 사람이
 * 있고, 그 반대도 있다.
 */
const QUICK_CODES = ["VN", "CN", "MN", "NP"];

export function CountryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const { t, tShared } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = findCountry(value);
  const selectedIsQuick = QUICK_CODES.includes(value);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 이름은 팀원이 만든 translateShared("country")를 그대로 쓴다.
    // 같은 일을 하는 함수를 둘 두면 언젠가 두 화면의 나라 이름이 갈린다.
    const withNames = REMITTANCE_COUNTRIES.map((country) => ({
      ...country,
      label: tShared("country", country.code),
      english: translateShared("en", "country", country.code),
    }));
    if (!q) return withNames;
    return withNames.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.english.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query, tShared]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {QUICK_CODES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              value === code
                ? "border-primary bg-primary/15 text-white"
                : "border-border text-foreground-muted hover:border-border-strong"
            )}
          >
            {tShared("country", code)}
          </button>
        ))}
        {/* 검색으로 고른 나라는 이 자리에 남는다. 안 그러면 고른 뒤에
            어디에도 표시되지 않아 무엇을 골랐는지 알 수 없다. */}
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            !selectedIsQuick
              ? "border-primary bg-primary/15 text-white"
              : "border-border text-foreground-muted hover:border-border-strong"
          )}
        >
          {!selectedIsQuick && selected
            ? tShared("country", value)
            : t("remittance.input.otherCountry")}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[70vh] w-full max-w-[480px] flex-col rounded-t-3xl border-t border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <p className="text-[15px] font-semibold text-foreground">
                {t("remittance.input.countryLabel")}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
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
                    onChange(country.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left",
                    value === country.code ? "bg-primary/15" : "hover:bg-white/[0.04]"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
                    {country.label}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] text-foreground-muted">
                    {country.currency}
                  </span>
                  {value === country.code && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
