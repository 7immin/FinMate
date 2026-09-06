"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { InputStep } from "@/components/flows/remittance/InputStep";
import { CheckStep } from "@/components/flows/remittance/CheckStep";
import { UnlockStep } from "@/components/flows/remittance/UnlockStep";
import { ChannelStep } from "@/components/flows/remittance/ChannelStep";
import { TrackingStep } from "@/components/flows/remittance/TrackingStep";
import { useAppState } from "@/lib/state/AppStateContext";
import { RemittanceChannel } from "@/lib/mock/remittance";

type Step = "input" | "check" | "unlock" | "channel" | "tracking";

export default function RemittancePage() {
  const router = useRouter();
  const { state, unlockLimit } = useAppState();
  const [step, setStep] = useState<Step>("input");
  const [country, setCountry] = useState("베트남");
  const [recipient, setRecipient] = useState("NGUYEN VAN MINH");
  const [reason, setReason] = useState("생활비");
  const [amount, setAmount] = useState(1800000);
  const [channel, setChannel] = useState<RemittanceChannel | null>(null);

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
          onSendPartial={() => {
            setAmount(openLimit);
            setStep("channel");
          }}
          onProceed={() => setStep("channel")}
        />
      )}
      {step === "unlock" && (
        <UnlockStep
          onUnlocked={(option) => {
            unlockLimit(option.bonus);
            setStep("channel");
          }}
        />
      )}
      {step === "channel" && (
        <ChannelStep
          onSelect={(selected) => {
            setChannel(selected);
            setStep("tracking");
          }}
        />
      )}
      {step === "tracking" && channel && (
        <TrackingStep
          recipient={recipient}
          amount={amount}
          channel={channel}
          onDone={() => router.push("/home")}
        />
      )}
    </AppShell>
  );
}
