"use client";

import { useAppState } from "@/lib/state/AppStateContext";
import { translate, translateNode, translateOptional, translateShared } from "./index";
import { Language } from "@/lib/types";

type SharedGroup = "country" | "school" | "status";

export function useTranslation() {
  const { state, setLanguage } = useAppState();
  const lang = state.profile.language;

  function t(key: string, vars?: Record<string, string | number>): string {
    return translate(lang, key, vars);
  }

  function tNode<T = unknown>(key: string): T {
    return translateNode<T>(lang, key);
  }

  function tOpt(key: string): string | undefined {
    return translateOptional(lang, key);
  }

  function tShared(group: SharedGroup, id: string): string {
    return translateShared(lang, group, id);
  }

  return { lang, setLanguage, t, tNode, tOpt, tShared };
}

export type { Language };
