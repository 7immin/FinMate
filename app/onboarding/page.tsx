"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppState } from "@/lib/state/AppStateContext";
import { Language } from "@/lib/types";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
];

const NATIONALITIES = ["베트남", "중국", "몽골", "네팔", "우즈베키스탄", "미얀마"];
const VISA_TYPES = ["D-2", "D-4", "기타"];
const SCHOOLS = ["한양대학교", "서울대학교", "연세대학교", "고려대학교", "성균관대학교"];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAppState();
  const [step, setStep] = useState<1 | 2>(1);
  const [language, setLanguage] = useState<Language>("ko");
  const [name, setName] = useState("응우옌 티 흐엉");
  const [nationality, setNationality] = useState("베트남");
  const [visaStatus, setVisaStatus] = useState("D-2");
  const [school, setSchool] = useState("한양대학교");
  const [arrivalLabel, setArrivalLabel] = useState("2026년 3월");

  function handleSubmit() {
    completeOnboarding({
      language,
      name,
      nationality,
      nationalityCode: nationality === "베트남" ? "VNM" : "OTH",
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
          <h1 className="text-[26px] font-bold leading-tight text-foreground">
            목적을 증명하면
            <br />
            한도가 열립니다
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
            등록금·월세 같은 실제 지출을 FinMate가 직접 확인하고, 그 목적에만 이체 한도를 엽니다.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-foreground-muted">언어 선택</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Chip
                  key={lang.code}
                  selected={language === lang.code}
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </Chip>
              ))}
            </div>
          </div>
          <Button onClick={() => setStep(2)}>시작하기 →</Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-foreground-subtle">
            <ShieldCheck className="h-3.5 w-3.5" /> FinMate는 은행 비밀번호를 절대 묻지 않습니다.
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

      <h1 className="text-[22px] font-bold text-foreground">기본 정보만 알려주세요</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        여기 적은 내용에 따라 답변과 한도가 달라집니다.
      </p>

      <div className="mt-6 flex-1 space-y-5">
        <Field label="이름 (여권 표기)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>

        <Field label="국적">
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          >
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>

        <Field label="체류 자격">
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
                {visa}
              </button>
            ))}
          </div>
        </Field>

        <Field label="학교">
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          >
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="입국 시점">
          <input
            value={arrivalLabel}
            onChange={(e) => setArrivalLabel(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-foreground outline-none focus:border-primary"
          />
        </Field>
      </div>

      <Button onClick={handleSubmit} className="mt-6">
        다음
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
