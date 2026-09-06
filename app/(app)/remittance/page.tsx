"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { InputStep } from "@/components/flows/remittance/InputStep";
import { CheckStep } from "@/components/flows/remittance/CheckStep";
import { UnlockStep } from "@/components/flows/remittance/UnlockStep";
import { FlowSuccess } from "@/components/flows/FlowSuccess";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ReasonId } from "@/lib/mock/remittance";
import { DEFAULT_COUNTRY_CODE } from "@/lib/remittance/countries";
import { NationalityId } from "@/lib/types";

type Step = "input" | "check" | "unlock" | "requested";

export default function RemittancePage() {
  const router = useRouter();
  const { state, requestLimit } = useAppState();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("input");
  // 받는 나라의 기본값은 본인 국적이다. 유학생이 송금하는 곳은 대개
  // 본국이라, 매번 같은 나라를 다시 고르게 할 이유가 없다. 국적을 아직
  // 모르면(가입 직후 등) 베트남으로 둔다.
  const [country, setCountry] = useState<NationalityId>(
    state.profile.nationalityCode || DEFAULT_COUNTRY_CODE
  );
  const [recipient, setRecipient] = useState("NGUYEN VAN MINH");
  const [reason, setReason] = useState<ReasonId>("living");
  const [amount, setAmount] = useState(1800000);

  const openLimit = state.passport.currentLimit;

  return (
    <AppShell className="flex flex-col">
      {step === "input" && (
        <InputStep
          country={country}
          setCountry={setCountry}
          recipient={recipient}
          setRecipient={setRecipient}
          reason={reason}
          setReason={setReason}
          amount={amount}
          setAmount={setAmount}
          onSubmit={() => setStep("check")}
        />
      )}
      {step === "check" && (
        <CheckStep
          amount={amount}
          openLimit={openLimit}
          onUnlock={() => setStep("unlock")}
          onProceed={() => router.push("/home")}
        />
      )}
      {/*
        증빙을 골라 한도 열기를 "요청"한다. 예전에는 여기서 곧바로 한도가
        올라가고 송금 채널 선택으로 넘어갔는데, 실제로는 은행이 승인해야
        열린다. 화면에서만 열어 두면 사용자가 창구에서야 그 사실을 안다.
      */}
      {step === "unlock" && (
        <UnlockStep
          onUnlocked={(option, fileName, evidencePath) => {
            requestLimit(
              option.bonus,
              "remittance",
              `${option.id} · ${fileName}`,
              evidencePath
            );
            setStep("requested");
          }}
        />
      )}
      {step === "requested" && (
        <FlowSuccess
          topBarTitle={t("remittance.unlock.topBarTitle")}
          title={t("remittance.requested.title")}
          description={t("remittance.requested.description")}
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
