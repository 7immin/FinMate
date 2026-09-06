"use client";

import Link from "next/link";
import { ChevronRight, IdCard, Smartphone, FileBadge2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/state/AppStateContext";

const DOC_LABELS: { key: "hasPassport" | "hasAlienRegistration" | "hasKoreanPhone"; label: string; icon: typeof IdCard }[] = [
  { key: "hasPassport", label: "여권", icon: IdCard },
  { key: "hasAlienRegistration", label: "외국인등록증", icon: FileBadge2 },
  { key: "hasKoreanPhone", label: "한국 휴대폰 번호", icon: Smartphone },
];

export default function ProfilePage() {
  const { state } = useAppState();
  const { profile, passport, documents } = state;

  return (
    <AppShell showNav>
      <div className="space-y-6 px-5 pb-10 pt-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
            {profile.name.slice(0, 1)}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm text-foreground-muted">
              {profile.visaStatus} · {profile.nationality} · {profile.school}
            </p>
          </div>
        </div>

        <Link href="/passport">
          <Card raised className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">금융여권</p>
              <p className="mt-1 text-[15px] font-medium text-foreground">
                {passport.level} · {passport.badgeLabel}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground-muted" />
          </Card>
        </Link>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">보유 서류</p>
          <Card className="divide-y divide-border">
            {DOC_LABELS.map(({ key, label, icon: Icon }) => {
              const value = documents[key];
              return (
                <div key={key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <Icon className="h-[18px] w-[18px] text-foreground-muted" />
                  <span className="flex-1 text-[15px] text-foreground">{label}</span>
                  <Badge tone={value === "yes" ? "success" : value === "no" ? "neutral" : "warning"}>
                    {value === "yes" ? "있음" : value === "no" ? "없음" : "확인 필요"}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
