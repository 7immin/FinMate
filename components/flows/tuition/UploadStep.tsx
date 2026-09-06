"use client";

import { Link2, ShieldCheck, ExternalLink } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { UploadBox } from "@/components/ui/UploadBox";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SCHOOL_TUITION_PAGE } from "@/lib/data/school-tuition-pages";

/**
 * 고지서 올리기.
 *
 * 여기 있던 "학교 포털 연결"과 "학교 이메일에서 찾기"는 아무것도 가져오지
 * 않았다. 둘 다 하드코딩된 고지서(한양대·4,850,000원)를 결과 화면에
 * 띄웠을 뿐이고, 그 가짜 값이 그대로 은행 한도 요청으로 올라갔다.
 *
 * 실제로 가져오려면 학교 포털 아이디와 비밀번호를 받아야 한다. 그건 하지
 * 않는다 — 이 앱은 사기 진단에서 "어떤 이유로든 계정 정보를 넘기지 마라"고
 * 가르친다. 우리가 받으면 "믿을 만해 보이는 앱에는 넣어도 된다"는 습관을
 * 가르치는 셈이고, 그 습관이 다음엔 진짜 피싱 앱에서 발동한다.
 *
 * 대신 고지서를 어디서 받는지 알려준다. 학생 본인은 포털에서 PDF를 받을 수
 * 있으므로, 우리가 대신 로그인할 이유가 없다. "어디서 받는지 모르겠다"는
 * 문제는 그대로 풀린다.
 */
export function UploadStep({ onFileUploaded }: { onFileUploaded: (file: File) => void }) {
  const { state } = useAppState();
  const { t, tShared } = useTranslation();
  const tuitionPage = SCHOOL_TUITION_PAGE[state.profile.school];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title={t("tuition.topBarTitle")} />
      <div className="flex-1 space-y-6 px-5 pb-6 pt-2">
        <div>
          <h1 className="whitespace-pre-line text-[24px] font-bold leading-snug text-foreground">
            {t("tuition.upload.headline")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
            {t("tuition.upload.description")}
          </p>
        </div>

        <UploadBox label={t("tuition.upload.boxLabel")} onFileSelected={onFileUploaded} />

        {/* 등록금 안내 주소를 아는 학교에만 띄운다. 모르는 학교에 "학교
            홈페이지에서 찾아보세요"라고 적는 것은 안내가 아니라 빈말이다. */}
        {tuitionPage && (
          <div>
            <p className="mb-2 text-sm text-foreground-muted">{t("tuition.upload.orTitle")}</p>
            <a
              href={tuitionPage}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <Link2 className="h-4 w-4 shrink-0 text-foreground-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-foreground">
                  {t("tuition.upload.openPortal", {
                    school: tShared("school", state.profile.school),
                  })}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-foreground-muted">
                  {t("tuition.upload.openPortalHint")}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-foreground-subtle" />
            </a>
          </div>
        )}
      </div>
      <p className="flex items-center justify-center gap-1.5 px-5 pb-6 text-center text-xs text-foreground-subtle">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {t("tuition.upload.footerNote")}
      </p>
    </div>
  );
}
