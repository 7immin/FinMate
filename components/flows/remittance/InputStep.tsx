"use client";

import { useEffect, useState } from "react";

import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { REASON_IDS, ReasonId } from "@/lib/mock/remittance";
import { CountryPicker } from "@/components/flows/remittance/CountryPicker";
import { formatRate, formatReceived, type FxRates } from "@/lib/remittance/countries";

interface InputStepProps {
  country: string;
  setCountry: (v: string) => void;
  recipient: string;
  setRecipient: (v: string) => void;
  reason: ReasonId;
  setReason: (v: ReasonId) => void;
  amount: number;
  setAmount: (v: number) => void;
  onSubmit: () => void;
}

export function InputStep({
  country,
  setCountry,
  recipient,
  setRecipient,
  reason,
  setReason,
  amount,
  setAmount,
  onSubmit,
}: InputStepProps) {
  const { t, lang } = useTranslation();

  // 환율은 서버가 캐시해 둔 것을 받아 온다. 못 받으면 받는 금액 줄을
  // 그리지 않는다 — 지어낸 숫자로 채우면 그 금액으로 계획을 세운다.
  const [fx, setFx] = useState<FxRates | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/fx")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.rates) setFx({ rates: data.rates, updatedAt: data.updatedAt });
      })
      .catch(() => {
        // 실패하면 fx는 null로 남는다.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const received = formatReceived(amount, country, fx, lang);
  const rate = formatRate(country, fx);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("remittance.input.headline")}</h1>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("remittance.input.countryLabel")}</p>
          <CountryPicker value={country} onChange={setCountry} />
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("remittance.input.recipientLabel")}</p>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-xs text-foreground-subtle">{t("remittance.input.recipientHint")}</p>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("remittance.input.reasonLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {REASON_IDS.map((r) => (
              <Chip key={r} selected={reason === r} onClick={() => setReason(r)}>
                {t(`remittance.reason.${r}`)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("remittance.input.amountLabel")}</p>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-[22px] font-bold text-foreground outline-none"
            />
            <span className="shrink-0 text-sm text-foreground-muted">KRW</span>
          </div>
          {/* 받는 금액은 고른 나라의 통화로 보여준다. 어느 나라를 고르든
              VND로 환산해 주면, 미국에 보내려는 사람에게 아무 뜻 없는
              숫자를 보여주는 셈이다. */}
          <div className="mt-1.5 space-y-1">
            {received && rate ? (
              <>
                <div className="flex items-center justify-between text-xs text-foreground-subtle">
                  <span>{t("remittance.input.receivedAmount", { amount: received })}</span>
                  <span className="font-mono">{rate}</span>
                </div>
                {/* 실시간 환율이지만 은행 고시 환율과는 다르다. 확정 금액처럼
                    보여주면 사용자가 그 금액으로 계획을 세운다. */}
                <p className="text-[11px] leading-relaxed text-foreground-subtle">
                  {t("remittance.input.rateNotice", { date: formatUpdated(fx) })}
                </p>
              </>
            ) : (
              <p className="text-[11px] leading-relaxed text-foreground-subtle">
                {t("remittance.input.noRate")}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onSubmit} disabled={!recipient || amount <= 0}>
          {t("remittance.input.submit")}
        </Button>
      </div>
    </div>
  );
}

/** 환율 갱신 시각. 사용자 시간대로 날짜만 보여준다. */
function formatUpdated(fx: FxRates | null): string {
  if (!fx) return "";
  const at = new Date(fx.updatedAt);
  return Number.isNaN(at.getTime()) ? "" : at.toLocaleDateString();
}
