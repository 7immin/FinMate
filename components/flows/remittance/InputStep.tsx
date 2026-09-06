"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { COUNTRIES, EXCHANGE_RATE_TO_VND, REASON_IDS, ReasonId } from "@/lib/mock/remittance";
import { NationalityId } from "@/lib/types";

interface InputStepProps {
  country: NationalityId;
  setCountry: (v: NationalityId) => void;
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
  const { t, tShared } = useTranslation();
  const receivedAmount = Math.round(amount * EXCHANGE_RATE_TO_VND);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("remittance.input.headline")}</h1>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">{t("remittance.input.countryLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.slice(0, 4).map((c) => (
              <Chip key={c} selected={country === c} onClick={() => setCountry(c)}>
                {tShared("country", c)}
              </Chip>
            ))}
            <Chip
              selected={COUNTRIES.slice(4).includes(country)}
              onClick={() => setCountry(COUNTRIES[4])}
            >
              +{COUNTRIES.length - 4}
            </Chip>
          </div>
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
          <div className="mt-1.5 flex items-center justify-between text-xs text-foreground-subtle">
            <span>{t("remittance.input.receivedAmount", { amount: receivedAmount.toLocaleString() })}</span>
            <span>{t("remittance.input.rate", { rate: EXCHANGE_RATE_TO_VND })}</span>
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
