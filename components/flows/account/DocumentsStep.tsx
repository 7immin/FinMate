"use client";

import { useState } from "react";
import { IdCard, FileBadge2, Smartphone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DocumentFlags } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

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

export function DocumentsStep({ onSubmit }: { onSubmit: (flags: DocumentFlags) => void }) {
  const { t } = useTranslation();
  const [hasPassport, setHasPassport] = useState<Flag>("yes");
  const [hasAlienRegistration, setHasAlienRegistration] = useState<Flag>("no");
  const [hasKoreanPhone, setHasKoreanPhone] = useState<Flag>("yes");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("account.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">{t("account.documents.headline")}</h1>
          <p className="mt-2 text-[15px] text-foreground-muted">{t("account.documents.description")}</p>
        </div>

        <DocRow
          icon={IdCard}
          label={t("account.documents.passport")}
          value={hasPassport}
          onChange={setHasPassport}
        />
        <DocRow
          icon={FileBadge2}
          label={t("account.documents.alienRegistration")}
          value={hasAlienRegistration}
          onChange={setHasAlienRegistration}
        />
        <DocRow
          icon={Smartphone}
          label={t("account.documents.koreanPhone")}
          value={hasKoreanPhone}
          onChange={setHasKoreanPhone}
        />
      </div>
      <div className="px-5 pb-6">
        <Button onClick={() => onSubmit({ hasPassport, hasAlienRegistration, hasKoreanPhone })}>
          {t("account.documents.submit")}
        </Button>
      </div>
    </div>
  );
}
