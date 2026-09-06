"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CountrySearchSheet } from "@/components/ui/CountrySearchSheet";
import { COUNTRY_CODES } from "@/lib/data/countries";
import { currencyOf } from "@/lib/data/country-currency";
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
/**
 * 밖에 펴 두는 넷.
 *
 * 국내 체류 유학생이 가장 많이 보내는 나라다. 나머지는 검색으로 찾는다 —
 * 250개를 다 펼치면 자기 나라를 찾는 데 오히려 오래 걸린다.
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

  const selectedIsQuick = QUICK_CODES.includes(value);

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
          {!selectedIsQuick && value
            ? tShared("country", value)
            : t("remittance.input.otherCountry")}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <CountrySearchSheet
        open={open}
        onClose={() => setOpen(false)}
        codes={COUNTRY_CODES}
        value={value}
        onSelect={onChange}
        title={t("remittance.input.countryLabel")}
        renderMeta={(code) => (
          <span className="shrink-0 font-mono text-[12px] text-foreground-muted">
            {currencyOf(code)}
          </span>
        )}
      />
    </>
  );
}
