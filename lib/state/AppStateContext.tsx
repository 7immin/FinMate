"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AppState, DocumentFlags, Language, UserProfile } from "@/lib/types";
import { initialAppState } from "@/lib/mock/initial-state";
import { LEVEL_CONFIG, cloneChecklist, nextLevel } from "@/lib/mock/passport-levels";

const STORAGE_KEY = "finmate.appState.v1";

interface AppStateContextValue {
  state: AppState;
  hydrated: boolean;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  setDocumentFlag: (key: keyof DocumentFlags, value: "yes" | "no" | "unknown") => void;
  toggleChecklistItem: (id: string) => void;
  recordPurposeTransaction: () => void;
  unlockLimit: (amount: number) => void;
  setLanguage: (language: Language) => void;
  resetDemo: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialAppState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      hydrated,
      completeOnboarding: (profile) =>
        setState((prev) => ({
          ...prev,
          onboarded: true,
          profile: { ...prev.profile, ...profile },
        })),
      setDocumentFlag: (key, docValue) =>
        setState((prev) => ({
          ...prev,
          documents: { ...prev.documents, [key]: docValue },
        })),
      toggleChecklistItem: (id) =>
        setState((prev) => {
          const checklist = prev.passport.nextLevelChecklist.map((item) =>
            item.id === id ? { ...item, done: !item.done } : item
          );
          const allDone = checklist.length > 0 && checklist.every((item) => item.done);
          if (!allDone) {
            return { ...prev, passport: { ...prev.passport, nextLevelChecklist: checklist } };
          }
          const upgraded = nextLevel(prev.passport.level);
          if (!upgraded) {
            return { ...prev, passport: { ...prev.passport, nextLevelChecklist: checklist } };
          }
          const config = LEVEL_CONFIG[upgraded];
          return {
            ...prev,
            passport: {
              ...prev.passport,
              level: upgraded,
              currentLimit: config.limit,
              nextLevelChecklist: cloneChecklist(upgraded),
            },
          };
        }),
      recordPurposeTransaction: () =>
        setState((prev) => {
          const targetIdx = prev.passport.nextLevelChecklist.findIndex((item) =>
            item.id.includes("purpose-tx")
          );
          if (targetIdx === -1) return prev;
          const checklist = prev.passport.nextLevelChecklist.map((item, idx) =>
            idx === targetIdx ? { ...item, done: true } : item
          );
          return {
            ...prev,
            passport: {
              ...prev.passport,
              paymentHistory: [
                ...prev.passport.paymentHistory,
                { month: "2026.09", onTime: true },
              ],
              nextLevelChecklist: checklist,
            },
          };
        }),
      unlockLimit: (amount) =>
        setState((prev) => ({
          ...prev,
          passport: { ...prev.passport, currentLimit: prev.passport.currentLimit + amount },
        })),
      setLanguage: (language) =>
        setState((prev) => ({ ...prev, profile: { ...prev.profile, language } })),
      resetDemo: () => setState(initialAppState),
    }),
    [state, hydrated]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
