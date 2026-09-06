"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CHANNELS, RemittanceChannel } from "@/lib/mock/remittance";

export function ChannelStep({ onSelect }: { onSelect: (channel: RemittanceChannel) => void }) {
  const [selected, setSelected] = useState(CHANNELS[0].id);
  const current = CHANNELS.find((c) => c.id === selected)!;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="채널 비교" />
      <div className="flex-1 space-y-4 px-5 pb-6 pt-2">
        <h1 className="text-[22px] font-bold text-foreground">어떤 방법으로 보낼까요?</h1>

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
                    <span className="text-[15px] font-medium text-foreground">{channel.label}</span>
                    {channel.recommended && <Badge tone="primary">추천</Badge>}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-foreground-muted">
                    <span>수수료 {channel.fee.toLocaleString()}원</span>
                    <span>{channel.speed}</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-5 pb-6">
        <Button onClick={() => onSelect(current)}>이 방법으로 보내기 →</Button>
      </div>
    </div>
  );
}
