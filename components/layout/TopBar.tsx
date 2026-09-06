"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function TopBar({
  title,
  closeIcon,
  onBack,
  right,
}: {
  title: string;
  closeIcon?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 bg-background/90 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-white/[0.06]"
        aria-label={t("common.back")}
      >
        {closeIcon ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
      </button>
      <h1 className="flex-1 truncate text-[15px] font-semibold text-foreground">{title}</h1>
      {right}
    </div>
  );
}
