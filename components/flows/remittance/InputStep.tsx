"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, REASONS, EXCHANGE_RATE_TO_VND } from "@/lib/mock/remittance";

interface InputStepProps {
  country: string;
  setCountry: (v: string) => void;
  recipient: string;
  setRecipient: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
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
  const receivedAmount = Math.round(amount * EXCHANGE_RATE_TO_VND);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="해외 송금" />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">보내기 전에 먼저 점검합니다</h1>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">받는 국가</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.slice(0, 4).map((c) => (
              <Chip key={c} selected={country === c} onClick={() => setCountry(c)}>
                {c}
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
          <p className="mb-2 text-sm text-foreground-muted">받는 사람</p>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-xs text-foreground-subtle">여권과 똑같이 적어주세요</p>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">보내는 이유</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <Chip key={r} selected={reason === r} onClick={() => setReason(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-foreground-muted">보내는 금액</p>
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
            <span>받는 금액 약 {receivedAmount.toLocaleString()} VND</span>
            <span>1 KRW = {EXCHANGE_RATE_TO_VND} VND</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={onSubmit} disabled={!recipient || amount <= 0}>
          점검하기
        </Button>
      </div>
    </div>
  );
}
