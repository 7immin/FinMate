"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateContext";

export default function RootPage() {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(state.onboarded ? "/home" : "/onboarding");
  }, [hydrated, state.onboarded, router]);

  return <div className="min-h-[100dvh] bg-background" />;
}
