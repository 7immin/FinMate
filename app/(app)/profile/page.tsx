"use client";

import Link from "next/link";
import { ChevronRight, IdCard, Smartphone, FileBadge2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DocumentFlags } from "@/lib/types";

const DOC_ROWS: { key: keyof DocumentFlags; labelKey: string; icon: typeof IdCard }[] = [
  { key: "hasPassport", labelKey: "profile.doc.passport", icon: IdCard },
  { key: "hasAlienRegistration", labelKey: "profile.doc.alienRegistration", icon: FileBadge2 },
  { key: "hasKoreanPhone", labelKey: "profile.doc.koreanPhone", icon: Smartphone },
];

export default function ProfilePage() {
  const { state } = useAppState();
  const { t, tShared } = useTranslation();
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
              {profile.visaStatus} · {tShared("country", profile.nationality)} ·{" "}
              {tShared("school", profile.school)}
            </p>
          </div>
        </div>

        <Link href="/passport">
          <Card raised className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground-muted">{t("profile.passportRow")}</p>
              <p className="mt-1 text-[15px] font-medium text-foreground">
                {passport.level} · {t(`passport.badge.${passport.level}`)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground-muted" />
          </Card>
        </Link>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("profile.documentsTitle")}</p>
          <Card className="divide-y divide-border">
            {DOC_ROWS.map(({ key, labelKey, icon: Icon }) => {
              const value = documents[key];
              return (
                <div key={key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <Icon className="h-[18px] w-[18px] text-foreground-muted" />
                  <span className="flex-1 text-[15px] text-foreground">{t(labelKey)}</span>
                  <Badge tone={value === "yes" ? "success" : value === "no" ? "neutral" : "warning"}>
                    {tShared("status", value === "yes" ? "yes" : value === "no" ? "no" : "unknown")}
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
