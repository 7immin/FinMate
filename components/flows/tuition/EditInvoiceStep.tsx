"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TuitionInvoice } from "@/lib/mock/tuition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm text-foreground-muted">{label}</p>
      {children}
    </div>
  );
}

export function EditInvoiceStep({
  invoice,
  onSave,
  onCancel,
}: {
  invoice: TuitionInvoice;
  onSave: (updated: TuitionInvoice) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(invoice.amount);
  const [dueDate, setDueDate] = useState(invoice.dueDate);
  const [virtualAccount, setVirtualAccount] = useState(invoice.virtualAccount);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("tuition.edit.title")} onBack={onCancel} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("tuition.edit.headline")}</h1>
          <p className="mt-2 text-[15px] text-foreground-muted">{t("tuition.edit.description")}</p>
        </div>

        <Field label={t("tuition.result.amountLabel")}>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-[17px] font-semibold text-foreground outline-none"
            />
            <span className="shrink-0 text-sm text-foreground-muted">KRW</span>
          </div>
        </Field>

        <Field label={t("tuition.result.dueLabel")}>
          <input
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>

        <Field label={t("tuition.result.accountLabel")}>
          <input
            value={virtualAccount}
            onChange={(e) => setVirtualAccount(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={() => onSave({ ...invoice, amount, dueDate, virtualAccount })}>
          {t("tuition.edit.save")}
        </Button>
      </div>
    </div>
  );
}
