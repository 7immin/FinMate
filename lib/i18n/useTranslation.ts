"use client";

import { useOptionalAppState } from "@/lib/state/AppStateContext";
import { useGuestLanguage } from "./GuestLanguageContext";
import { translate, translateNode, translateOptional, translateShared } from "./index";
import { Language } from "@/lib/types";

type SharedGroup = "country" | "school" | "status";

const NOOP_SET_LANGUAGE = (_: Language) => {};

export function useTranslation() {
  // 로그인한 사용자는 프로필에 저장된 언어를, 비로그인 방문자는 브라우저에
  // 담아 둔 언어를 쓴다. 둘 다 없으면 한국어 — 사전의 원본 언어라 어떤
  // 키를 넣어도 빈 화면이 나오지 않는다.
  const app = useOptionalAppState();
  const guest = useGuestLanguage();
  const lang: Language = app?.state.profile.language ?? guest?.lang ?? "ko";
  const setLanguage = app?.setLanguage ?? guest?.setLanguage ?? NOOP_SET_LANGUAGE;

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
