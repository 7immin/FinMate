"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Language } from "@/lib/types";

const STORAGE_KEY = "finmate.guestLanguage";
const LANGUAGES: Language[] = ["ko", "en", "zh", "vi"];

interface GuestLanguageValue {
  lang: Language;
  setLanguage: (lang: Language) => void;
}

const GuestLanguageContext = createContext<GuestLanguageValue | null>(null);

/**
 * 로그인 전 화면의 언어.
 *
 * 로그인한 사용자의 언어는 Supabase 프로필에 있지만, 비로그인 방문자에게는
 * 저장할 행 자체가 없다. 그렇다고 언어 선택을 막으면 안 된다 — 이 앱을
 * 처음 여는 사람 대부분이 한국어를 못 읽고, 로그인 화면조차 읽지 못하면
 * 가입까지 갈 수 없기 때문이다.
 *
 * 그래서 브라우저에만 담아 둔다. 가입 후에는 온보딩이 프로필 언어를 다시
 * 정하므로 이 값은 그때부터 쓰이지 않는다.
 */
export function GuestLanguageProvider({ children }: { children: ReactNode }) {
  // 서버 렌더와 첫 클라이언트 렌더가 같아야 하므로 항상 ko로 시작하고,
  // 저장된 값은 마운트 후에 덮어쓴다. 초기값에서 localStorage를 읽으면
  // 하이드레이션 불일치로 화면이 한 번 깜빡인다.
  const [lang, setLang] = useState<Language>("ko");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (LANGUAGES as string[]).includes(saved)) setLang(saved as Language);
    } catch {
      // 사생활 보호 모드 등에서 접근이 막힐 수 있다. 기본 언어로 계속 간다.
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 저장에 실패해도 이번 세션 동안은 화면이 그 언어로 보인다.
    }
  }, []);

  const value = useMemo(() => ({ lang, setLanguage }), [lang, setLanguage]);

  return <GuestLanguageContext.Provider value={value}>{children}</GuestLanguageContext.Provider>;
}

export function useGuestLanguage(): GuestLanguageValue | null {
  return useContext(GuestLanguageContext);
}
