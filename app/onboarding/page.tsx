"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LANGUAGE_NATIVE_NAME } from "@/lib/i18n";
import { Language, NationalityId, SchoolId } from "@/lib/types";

const LANGUAGES: Language[] = ["ko", "en", "zh", "vi"];
const NATIONALITIES: NationalityId[] = [
  "vietnam",
  "china",
  "mongolia",
  "nepal",
  "uzbekistan",
  "myanmar",
];
const VISA_TYPES = ["D-2", "D-4", "other"] as const;
const SCHOOLS: SchoolId[] = ["hanyang", "snu", "yonsei", "korea", "skk"];
const NATIONALITY_CODE: Record<NationalityId, string> = {
  vietnam: "VNM",
  china: "CHN",
  mongolia: "MNG",
  nepal: "NPL",
  myanmar: "MMR",
  uzbekistan: "UZB",
  cambodia: "KHM",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAppState();
  const { t, tShared, lang, setLanguage } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("응우옌 티 흐엉");
  const [nationality, setNationality] = useState<NationalityId>("vietnam");
  const [visaStatus, setVisaStatus] = useState<(typeof VISA_TYPES)[number]>("D-2");
  const [school, setSchool] = useState<SchoolId>("hanyang");
  const [arrivalLabel, setArrivalLabel] = useState("2026년 3월");

  function handleSubmit() {
    completeOnboarding({
      name,
      nationality,
      nationalityCode: NATIONALITY_CODE[nationality],
      visaStatus,
      school,
      arrivalLabel,
    });
    router.replace("/passport");
  }

  if (step === 1) {
    return (
      <AppShell className="flex flex-col justify-between px-5 pb-6 pt-16">
        <div>
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
            F
          </div>
          <h1 className="whitespace-pre-line text-[26px] font-bold leading-tight text-foreground">
            {t("onboarding.headline")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
            {t("onboarding.description")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-foreground-muted">{t("onboarding.languageLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((code) => (
                <Chip key={code} selected={lang === code} onClick={() => setLanguage(code)}>
                  {LANGUAGE_NATIVE_NAME[code]}
                </Chip>
              ))}
            </div>
          </div>
          <Button onClick={() => setStep(2)}>{t("onboarding.start")}</Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-foreground-subtle">
            <ShieldCheck className="h-3.5 w-3.5" /> {t("onboarding.footerNote")}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell className="flex flex-col px-5 pb-6 pt-6">
      <div className="mb-6">
        <span className="mb-2 block text-xs font-medium text-foreground-subtle">2/3</span>
        <ProgressBar value={66} />
      </div>

      <h1 className="text-[22px] font-bold text-foreground">{t("onboarding.step2Title")}</h1>
      <p className="mt-2 text-sm text-foreground-muted">{t("onboarding.step2Desc")}</p>

      <div className="mt-6 flex-1 space-y-5">
        <Field label={t("onboarding.fieldName")}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>

        <Field label={t("onboarding.fieldNationality")}>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value as NationalityId)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          >
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>
                {tShared("country", n)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("onboarding.fieldVisa")}>
          <div className="flex gap-3">
            {VISA_TYPES.map((visa) => (
              <button
                key={visa}
                type="button"
                onClick={() => setVisaStatus(visa)}
                className={`h-12 flex-1 rounded-xl border text-[15px] font-medium ${
                  visaStatus === visa
                    ? "border-primary bg-primary/15 text-white"
                    : "border-border text-foreground-muted"
                }`}
              >
                {visa === "other" ? t("onboarding.visaOther") : visa}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("onboarding.fieldSchool")}>
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value as SchoolId)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          >
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>
                {tShared("school", s)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("onboarding.fieldArrival")}>
          <input
            value={arrivalLabel}
            onChange={(e) => setArrivalLabel(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>
      </div>

      <Button onClick={handleSubmit} className="mt-6">
        {t("onboarding.next")}
      </Button>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm text-foreground-muted">{label}</p>
      {children}
    </div>
  );
}
