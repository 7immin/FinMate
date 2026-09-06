"use client";

import { Check, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LANGUAGE_NATIVE_NAME } from "@/lib/i18n";
import { Language } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const LANGUAGES: Language[] = ["ko", "en", "zh", "vi"];

export function LanguageSwitcherSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, lang, setLanguage } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-t-3xl border-t border-border bg-surface p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-foreground">
            {t("more.languageSheetTitle")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-foreground-muted hover:bg-white/[0.06]"
            aria-label={t("common.back")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          {LANGUAGES.map((code) => {
            const active = lang === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLanguage(code);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px]",
                  active ? "bg-primary/15 text-white" : "text-foreground hover:bg-white/[0.04]"
                )}
              >
                {LANGUAGE_NATIVE_NAME[code]}
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
