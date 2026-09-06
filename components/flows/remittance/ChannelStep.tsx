"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CHANNELS, RemittanceChannel } from "@/lib/mock/remittance";

export function ChannelStep({ onSelect }: { onSelect: (channel: RemittanceChannel) => void }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(CHANNELS[0].id);
  const current = CHANNELS.find((c) => c.id === selected)!;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("remittance.channel.topBarTitle")} />
      <div className="flex-1 space-y-4 px-5 pb-6 pt-2">
        <h1 className="text-[22px] font-bold text-foreground">{t("remittance.channel.headline")}</h1>

        <div className="space-y-3">
          {CHANNELS.map((channel) => {
            const active = selected === channel.id;
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setSelected(channel.id)}
                className="block w-full text-left"
              >
                <Card raised={active} className={active ? "border-primary" : undefined}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-medium text-foreground">
                      {t(`remittance.channel.${channel.id}.label`)}
                    </span>
                    {channel.recommended && <Badge tone="primary">{t("remittance.channel.recommended")}</Badge>}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-foreground-muted">
                    <span>{t("remittance.channel.fee", { fee: channel.fee.toLocaleString() })}</span>
                    <span>{t(`remittance.channel.${channel.id}.speed`)}</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={() => onSelect(current)}>{t("remittance.channel.submit")}</Button>
      </div>
    </div>
  );
}
