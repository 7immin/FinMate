"use client";

import { useState } from "react";
import { Languages, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChecklistRow } from "@/components/ui/Checklist";
import { DocumentFlags, Language } from "@/lib/types";
import { MVNO_HUB_URL } from "@/lib/data/phone";
import { translateNode } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";

const PHRASE_LANG_CYCLE: Language[] = ["ko", "en", "zh", "vi"];

interface RequestPhrase {
  title: string;
  body: string;
}

export function PrepCardStep({
  documents,
  branchName,
  onDone,
}: {
  documents: DocumentFlags;
  /** 앞에서 고른 지점. 안 골랐으면 null. */
  branchName: string | null;
  onDone: () => void;
}) {
  const { t, lang } = useTranslation();
  const [langIdx, setLangIdx] = useState(() => Math.max(0, PHRASE_LANG_CYCLE.indexOf(lang)));
  // 우리가 알 수 없는 서류. 학생이 챙기면서 스스로 표시한다.
  const [packed, setPacked] = useState({ enrollment: false, dorm: false });

  function togglePacked(key: "enrollment" | "dorm") {
    setPacked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const phraseLang = PHRASE_LANG_CYCLE[langIdx];
  const nextLang = PHRASE_LANG_CYCLE[(langIdx + 1) % PHRASE_LANG_CYCLE.length];
  const phrase = translateNode<RequestPhrase>(phraseLang, "account.prep.request." + phraseLang);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("account.prep.topBarTitle")} />
      <div className="flex-1 space-y-5 px-5 pb-6 pt-2">
        <h1 className="text-[22px] font-bold text-foreground">{t("account.prep.headline")}</h1>
        {/* 어느 지점에 가는지 여기 남긴다. 예전에는 다음 화면에서야
            지점 이름이 나왔는데, 그 화면은 창구에서 보여줄 것이 아니었다. */}
        {branchName && (
          <p className="-mt-2 text-[15px] text-foreground-muted">
            {t("account.prep.atBranch", { branch: branchName })}
          </p>
        )}

        <Card raised className="space-y-2">
          <p className="text-sm font-medium text-foreground-muted">{phrase.title}</p>
          <p className="text-[15px] leading-relaxed text-foreground">{phrase.body}</p>
        </Card>

        {/*
          창구에 가져갈 것들. 재학증명서가 조건 없이 체크된 채로 있었다 —
          내신 적도 없는 서류를 챙긴 것처럼 보여주면, 학생은 그것 없이
          창구까지 갔다가 되돌아온다.

          우리가 아는 것(여권·휴대폰: 내 정보에서 본인이 답한 값)과 모르는
          것(재학증명서·기숙사 확인서)을 나눈다. 모르는 것은 단정하지 않고
          학생이 챙기면서 직접 표시하는 칸으로 둔다 — 이 목록의 쓸모는
          "다 됐다"고 말해 주는 것이 아니라 빠뜨리지 않게 하는 것이다.
        */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground-muted">{t("account.prep.docsTitle")}</p>
          <Card className="divide-y divide-border">
            <ChecklistRow
              status={documents.hasPassport === "yes" ? "done" : "pending"}
              label={t("account.prep.docPassportOriginal")}
            />
            <ChecklistRow
              status={packed.enrollment ? "done" : "pending"}
              label={t("account.prep.docEnrollment")}
              hint={packed.enrollment ? undefined : t("account.prep.tapWhenPacked")}
              onClick={() => togglePacked("enrollment")}
            />
            {/* 휴대폰 번호는 챙겨 가는 물건이 아니라 미리 있어야 하는
                것이다. 없으면 여기서 체크할 게 아니라 만들러 가야 하므로,
                만드는 곳으로 잇는다. */}
            {documents.hasKoreanPhone === "yes" ? (
              <ChecklistRow status="done" label={t("account.prep.docKoreanPhone")} />
            ) : (
              <a href={MVNO_HUB_URL} target="_blank" rel="noreferrer" className="block">
                <ChecklistRow
                  status="pending"
                  label={t("account.prep.docKoreanPhone")}
                  hint={t("account.prep.getPhoneCta")}
                />
              </a>
            )}
            <ChecklistRow
              status={packed.dorm ? "done" : "pending"}
              label={t("account.prep.docDorm")}
              hint={packed.dorm ? undefined : t("account.prep.tapWhenPacked")}
              onClick={() => togglePacked("dorm")}
            />
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
        {/*
          여기 있던 "계좌 확인하기"는 우리 앱이 할 수 있는 일이 아니었다.
          계좌 상태는 은행 앱에서 보는 것이고, 금융여권은 등급을 보는
          화면이라 계좌를 확인하는 곳이 아니다. 이 흐름은 창구에 갈 준비를
          마치는 것으로 끝난다.
        */}
        <button
          type="button"
          onClick={onDone}
          className="w-full text-center text-sm text-foreground-muted"
        >
          {t("common.goHome")}
        </button>
      </div>
    </div>
  );
}
