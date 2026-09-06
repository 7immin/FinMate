"use client";

import Link from "next/link";
import { ChevronRight, IdCard, Smartphone, FileBadge2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DocumentFlags } from "@/lib/types";

/**
 * 보유 서류.
 *
 * 확인 방법이 서류마다 다르다.
 *
 * - 여권·외국인등록증: 사진을 올려 읽어야 확인된다. 신분을 증명하는
 *   서류라 본인이 "있다"고 누르는 것만으로는 아무것도 보증하지 못한다.
 * - 한국 휴대폰: 문자 인증을 붙이기 전까지는 본인이 고르는 값이다.
 *   서류가 없어 올릴 것도 없고, 없는 검증을 있는 척할 이유도 없다.
 *
 * 이 화면이 읽기만 되던 탓에, AI가 "외국인등록증이 없다"고 알려줘도
 * 사용자가 그 자리에서 바꿀 수 없었다.
 */
const DOC_ROWS: {
  key: keyof DocumentFlags;
  labelKey: string;
  icon: typeof IdCard;
  /** 사진을 올려 확인하는 서류. 그 검증 화면의 id. */
  verifyItemId?: string;
}[] = [
  {
    key: "hasPassport",
    labelKey: "profile.doc.passport",
    icon: IdCard,
    verifyItemId: "passport-verify",
  },
  {
    key: "hasAlienRegistration",
    labelKey: "profile.doc.alienRegistration",
    icon: FileBadge2,
    verifyItemId: "arc-verify",
  },
  { key: "hasKoreanPhone", labelKey: "profile.doc.koreanPhone", icon: Smartphone },
];

export default function ProfilePage() {
  const { state, setDocumentFlag } = useAppState();
  const { t, tShared } = useTranslation();
  const { profile, passport, documents } = state;

  return (
    <AppShell showNav>
      <div className="space-y-8 px-5 pb-10 pt-8">
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

        <Link href="/passport" className="block">
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
            {DOC_ROWS.map(({ key, labelKey, icon: Icon, verifyItemId }) => {
              const value = documents[key];
              const badge = (
                <Badge tone={value === "yes" ? "success" : value === "no" ? "neutral" : "warning"}>
                  {tShared("status", value === "yes" ? "yes" : value === "no" ? "no" : "unknown")}
                </Badge>
              );

              // 이미 확인된 서류는 손댈 수 없다. 확인을 되돌리는 버튼을 두면
              // 그 순간 이 값은 다시 자기 신고가 된다.
              if (value === "yes") {
                return (
                  <div key={key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Icon className="h-[18px] w-[18px] text-foreground-muted" />
                    <span className="flex-1 text-[15px] text-foreground">{t(labelKey)}</span>
                    {badge}
                  </div>
                );
              }

              if (verifyItemId) {
                return (
                  <Link
                    key={key}
                    href={`/passport/verify/${verifyItemId}`}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <Icon className="h-[18px] w-[18px] text-foreground-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] text-foreground">{t(labelKey)}</span>
                      <span className="mt-0.5 block text-[13px] text-primary">
                        {t("profile.verifyCta")}
                      </span>
                    </span>
                    {badge}
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground-subtle" />
                  </Link>
                );
              }

              // 휴대폰 번호. 서류가 없어 올릴 것이 없으므로 본인이 고른다.
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDocumentFlag(key, "yes")}
                  className="flex w-full items-center gap-3 py-2.5 text-left first:pt-0 last:pb-0"
                >
                  <Icon className="h-[18px] w-[18px] text-foreground-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-foreground">{t(labelKey)}</span>
                    <span className="mt-0.5 block text-[13px] text-primary">
                      {t("profile.markHaveCta")}
                    </span>
                  </span>
                  {badge}
                </button>
              );
            })}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
