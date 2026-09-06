"use client";

import { useState } from "react";
import { Languages, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { DocumentFlags, Language } from "@/lib/types";
import { translateNode } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";

const PHRASE_LANG_CYCLE: Language[] = ["ko", "en", "zh", "vi"];

interface RequestPhrase {
  title: string;
  body: string;
}

export function PrepCardStep({
  documents,
  onComplete,
}: {
  documents: DocumentFlags;
  onComplete: () => void;
}) {
  const { t, lang } = useTranslation();
  const [langIdx, setLangIdx] = useState(() => Math.max(0, PHRASE_LANG_CYCLE.indexOf(lang)));
  const phraseLang = PHRASE_LANG_CYCLE[langIdx];
  const nextLang = PHRASE_LANG_CYCLE[(langIdx + 1) % PHRASE_LANG_CYCLE.length];
  const phrase = translateNode<RequestPhrase>(phraseLang, "account.prep.request." + phraseLang);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("account.prep.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <h1 className="text-[22px] font-bold text-foreground">{t("account.prep.headline")}</h1>

        <Card raised className="space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{phrase.title}</p>
          <p className="text-[15px] leading-relaxed text-foreground">{phrase.body}</p>
        </Card>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("account.prep.docsTitle")}</p>
          <Card className="divide-y divide-border">
            <ChecklistRow
              status={documents.hasPassport === "yes" ? "done" : "pending"}
              label={t("account.prep.docPassportOriginal")}
            />
            <ChecklistRow status="done" label={t("account.prep.docEnrollment")} />
            <ChecklistRow
              status={documents.hasKoreanPhone === "yes" ? "done" : "pending"}
              label={t("account.prep.docKoreanPhone")}
            />
            <ChecklistRow status="pending" label={t("account.prep.docDorm")} />
          </Card>
        </div>

        <Card className="flex gap-2.5 bg-warning-muted">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm leading-relaxed text-warning">{t("account.prep.limitWarning")}</p>
        </Card>
      </div>

      <div className="space-y-3 px-5 pb-6">
        <Button
          variant="outline"
          onClick={() => setLangIdx((i) => (i + 1) % PHRASE_LANG_CYCLE.length)}
          className="gap-2"
        >
          <Languages className="h-4 w-4" /> {t(`account.prep.langToggle.${nextLang}`)}
        </Button>
        <button
          type="button"
          onClick={onComplete}
          className="w-full text-center text-sm text-foreground-muted"
        >
          {t("account.prep.complete")}
        </button>
      </div>
    </div>
  );
}
