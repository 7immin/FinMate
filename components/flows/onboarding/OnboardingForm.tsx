"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { translate, translateShared, LANGUAGE_NATIVE_NAME } from "@/lib/i18n";
import { Language, NationalityId, SchoolId } from "@/lib/types";
import { COUNTRY_CODES } from "@/lib/data/countries";
import { CountrySearchSheet } from "@/components/ui/CountrySearchSheet";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LANGUAGES: Language[] = ["ko", "en", "zh", "vi"];
const VISA_TYPES = ["D-2", "D-4", "other"] as const;
const SCHOOLS: SchoolId[] = ["hanyang", "snu", "yonsei", "korea", "skk"];

export function OnboardingForm() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("ko");
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const tShared = (group: "country" | "school", id: string) => translateShared(lang, group, id);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState<NationalityId | "">("");
  const [visaStatus, setVisaStatus] = useState<(typeof VISA_TYPES)[number] | "">("");
  const [school, setSchool] = useState<SchoolId | "">("");
  const [arrivalLabel, setArrivalLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorted by localized name so the list reads alphabetically in whichever
  // language the user picked, not by ISO code order.
  const sortedCountries = useMemo(() => {
    return [...COUNTRY_CODES].sort((a, b) =>
      tShared("country", a).localeCompare(tShared("country", b), lang)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function handleSubmit() {
    if (!name.trim() || !nationality || !visaStatus || !school || !arrivalLabel.trim()) {
      setError(t("onboarding.fillAllFields"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          nationality,
          nationalityCode: nationality,
          visaStatus,
          school,
          arrivalLabel,
          language: lang,
        }),
      });
      if (!res.ok) {
        setError((await res.json().catch(() => null))?.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      router.replace("/passport");
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  if (step === 1) {
    return (
      <AppShell className="flex flex-col justify-between px-5 pb-6 pt-16">
        <div>
          <Logo height={26} glow className="mb-8 self-start" />
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
                <Chip key={code} selected={lang === code} onClick={() => setLang(code)}>
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

        {/* 나라가 250개라 <select>로는 자기 나라를 찾을 수 없다. 눌러서
            검색하는 시트로 바꾼다(CountrySearchSheet 주석 참고). */}
        <Field label={t("onboarding.fieldNationality")}>
          <button
            type="button"
            onClick={() => setCountrySheetOpen(true)}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-surface px-4 text-left text-[15px] outline-none focus:border-primary"
          >
            <span className={nationality ? "text-foreground" : "text-foreground-muted"}>
              {nationality ? tShared("country", nationality) : t("onboarding.selectPlaceholder")}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-foreground-muted" />
          </button>
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
            <option value="" disabled>
              {t("onboarding.selectPlaceholder")}
            </option>
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
            placeholder={t("onboarding.arrivalPlaceholder")}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={submitting} className="mt-2">
        {submitting ? "…" : t("onboarding.next")}
      </Button>

      <CountrySearchSheet
        open={countrySheetOpen}
        onClose={() => setCountrySheetOpen(false)}
        codes={sortedCountries}
        value={nationality || undefined}
        onSelect={setNationality}
        title={t("onboarding.fieldNationality")}
      />
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
