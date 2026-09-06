import { redirect } from "next/navigation";
import { AppStateProvider } from "@/lib/state/AppStateContext";
import { fetchAppState } from "@/lib/server/state";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { onboarded, state } = await fetchAppState();

  if (!onboarded || !state) {
    redirect("/onboarding");
  }

  return <AppStateProvider initialState={state}>{children}</AppStateProvider>;
}
