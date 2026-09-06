"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { REASON_IDS, ReasonId } from "@/lib/mock/remittance";
import { CountryPicker } from "@/components/flows/remittance/CountryPicker";
import {
  RATE_AS_OF,
  findCountry,
  formatRate,
  formatReceived,
} from "@/lib/remittance/countries";

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
  const selected = findCountry(country);

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
          {selected && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between text-xs text-foreground-subtle">
                <span>
                  {t("remittance.input.receivedAmount", {
                    amount: formatReceived(amount, selected, lang),
                  })}
                </span>
                <span className="font-mono">{formatRate(selected)}</span>
              </div>
              {/* 고정 환율이라는 사실을 감추지 않는다. 확정 금액처럼
                  보여주면 사용자가 그 금액으로 계획을 세운다. */}
              <p className="text-[11px] leading-relaxed text-foreground-subtle">
                {t("remittance.input.rateNotice", { date: RATE_AS_OF })}
              </p>
            </div>
          )}
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
