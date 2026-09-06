import { redirect } from "next/navigation";
import { fetchAppState } from "@/lib/server/state";
import { OnboardingForm } from "@/components/flows/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const { onboarded } = await fetchAppState();
  if (onboarded) redirect("/home");
  return <OnboardingForm />;
}
