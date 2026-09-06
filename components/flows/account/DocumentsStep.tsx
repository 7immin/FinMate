"use client";

import { useState } from "react";
import { IdCard, FileBadge2, Smartphone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DocumentFlags } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAppState } from "@/lib/state/AppStateContext";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

type Flag = "unknown" | "yes" | "no";

function DocRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof IdCard;
  label: string;
  value: Flag;
  onChange: (v: Flag) => void;
}) {
  const { tShared } = useTranslation();
  const options: { value: Flag; label: string }[] = [
    { value: "unknown", label: tShared("status", "unknownShort") },
    { value: "yes", label: tShared("status", "yes") },
    { value: "no", label: tShared("status", "no") },
  ];
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-[18px] w-[18px] text-foreground-muted" />
        <span className="text-[15px] font-medium text-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-10 rounded-lg text-sm font-medium border",
                !active && "border-border text-foreground-muted",
                active && opt.value === "no" && "border-warning bg-warning/15 text-warning",
                active && opt.value !== "no" && "border-primary bg-primary/15 text-white"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * 계좌 개설 준비 상태.
 *
 * 여권과 외국인등록증은 여기서 "있음"으로 바꿀 수 없다. 예전에는 버튼
 * 한 번으로 통과했는데, 내 정보에서는 사진을 요구하면서 이 화면에서는
 * 그냥 눌리면 확인의 뜻이 없어진다(서버도 이제 막는다 — /api/documents).
 *
 * 대신 이미 확인된 값을 그대로 보여주고, 아직이면 확인하러 가는 길을 준다.
 * 휴대폰 번호만 여기서 고른다 — 올릴 서류가 없는 항목이다.
 */
export function DocumentsStep({ onSubmit }: { onSubmit: (flags: DocumentFlags) => void }) {
  const { t } = useTranslation();
  const { state } = useAppState();
  const verified = state.documents;
  const [hasKoreanPhone, setHasKoreanPhone] = useState<Flag>(
    verified.hasKoreanPhone === "yes" ? "yes" : "unknown"
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("account.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("account.documents.headline")}</h1>
          <p className="mt-2 text-[15px] text-foreground-muted">{t("account.documents.description")}</p>
        </div>

        <VerifiedRow
          icon={IdCard}
          label={t("account.documents.passport")}
          value={verified.hasPassport}
          verifyItemId="passport-verify"
        />
        <VerifiedRow
          icon={FileBadge2}
          label={t("account.documents.alienRegistration")}
          value={verified.hasAlienRegistration}
          verifyItemId="arc-verify"
        />
        <DocRow
          icon={Smartphone}
          label={t("account.documents.koreanPhone")}
          value={hasKoreanPhone}
          onChange={setHasKoreanPhone}
        />
      </div>
      <div className="px-5 pb-6">
        <Button
          onClick={() =>
            onSubmit({
              // 확인된 값은 그대로 넘긴다. 이 화면이 바꿀 수 있는 것은
              // 휴대폰 번호뿐이다.
              hasPassport: verified.hasPassport,
              hasAlienRegistration: verified.hasAlienRegistration,
              hasKoreanPhone,
            })
          }
        >
          {t("account.documents.submit")}
        </Button>
      </div>
    </div>
  );
}

/**
 * 사진으로 확인하는 서류 한 줄.
 *
 * 확인됐으면 사실만 보여주고, 아직이면 확인하는 화면으로 잇는다.
 * 여기서 "있음"으로 바꾸는 길은 두지 않는다.
 */
function VerifiedRow({
  icon: Icon,
  label,
  value,
  verifyItemId,
}: {
  icon: typeof IdCard;
  label: string;
  value: Flag;
  verifyItemId: string;
}) {
  const { t, tShared } = useTranslation();

  if (value === "yes") {
    return (
      <Card className="flex items-center gap-2">
        <Icon className="h-[18px] w-[18px] text-foreground-muted" />
        <span className="flex-1 text-[15px] font-medium text-foreground">{label}</span>
        <span className="flex items-center gap-1 text-[13px] font-medium text-success">
          <Check className="h-3.5 w-3.5" />
          {tShared("status", "yes")}
        </span>
      </Card>
    );
  }

  return (
    <Link href={`/passport/verify/${verifyItemId}`}>
      <Card className="flex items-center gap-2">
        <Icon className="h-[18px] w-[18px] text-foreground-muted" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-foreground">{label}</span>
          <span className="mt-0.5 block text-[13px] text-primary">
            {t("account.documents.verifyCta")}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-foreground-subtle" />
      </Card>
    </Link>
  );
}
