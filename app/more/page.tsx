"use client";

import { useRouter } from "next/navigation";
import { Globe, Bell, FileText, LifeBuoy, RotateCcw, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { useAppState } from "@/lib/state/AppStateContext";

const MENU = [
  { label: "언어 설정", icon: Globe },
  { label: "알림 설정", icon: Bell },
  { label: "이용약관 및 개인정보처리방침", icon: FileText },
  { label: "고객센터 문의", icon: LifeBuoy },
];

export default function MorePage() {
  const router = useRouter();
  const { resetDemo } = useAppState();

  return (
    <AppShell showNav>
      <div className="space-y-6 px-5 pb-10 pt-8">
        <h1 className="text-[22px] font-bold text-foreground">더보기</h1>

        <Card className="divide-y divide-border">
          {MENU.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
            >
              <Icon className="h-[18px] w-[18px] text-foreground-muted" />
              <span className="flex-1 text-[15px] text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 text-foreground-subtle" />
            </button>
          ))}
        </Card>

        <button
          type="button"
          onClick={() => {
            resetDemo();
            router.replace("/onboarding");
          }}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left text-danger"
        >
          <RotateCcw className="h-[18px] w-[18px]" />
          <span className="text-[15px] font-medium">데모 초기화 (온보딩부터 다시 보기)</span>
        </button>
      </div>
    </AppShell>
  );
}
