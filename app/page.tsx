import { redirect } from "next/navigation";
import { fetchAppState } from "@/lib/server/state";

export default async function RootPage() {
  const { onboarded } = await fetchAppState();
  redirect(onboarded ? "/home" : "/onboarding");
}
