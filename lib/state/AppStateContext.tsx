"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import {
  AppState,
  DocumentFlags,
  FinancialPassport,
  Language,
} from "@/lib/types";
import { LEVEL_CONFIG, cloneChecklist, nextLevel } from "@/lib/mock/passport-levels";
import { createClient } from "@/lib/supabase/client";

interface AppStateContextValue {
  state: AppState;
  setDocumentFlag: (key: keyof DocumentFlags, value: "yes" | "no" | "unknown") => void;
  toggleChecklistItem: (id: string) => void;
  recordPurposeTransaction: () => void;
  unlockLimit: (amount: number) => void;
  setLanguage: (language: Language) => void;
  signOut: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function computeToggledPassport(passport: FinancialPassport, id: string): FinancialPassport {
  const checklist = passport.nextLevelChecklist.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
  const allDone = checklist.length > 0 && checklist.every((item) => item.done);
  if (!allDone) return { ...passport, nextLevelChecklist: checklist };

  const upgraded = nextLevel(passport.level);
  if (!upgraded) return { ...passport, nextLevelChecklist: checklist };

  const config = LEVEL_CONFIG[upgraded];
  return {
    ...passport,
    level: upgraded,
    currentLimit: config.limit,
    nextLevelChecklist: cloneChecklist(upgraded),
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function AppStateProvider({
  initialState,
  children,
}: {
  initialState: AppState;
  children: ReactNode;
}) {
  const [state, setState] = useState<AppState>(initialState);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setDocumentFlag: (key, docValue) => {
        setState((prev) => ({ ...prev, documents: { ...prev.documents, [key]: docValue } }));
        postJson<{ documents: DocumentFlags }>("/api/documents", { [key]: docValue }).then(
          (data) => {
            if (data) setState((prev) => ({ ...prev, documents: data.documents }));
          }
        );
      },
      toggleChecklistItem: (id) => {
        setState((prev) => ({ ...prev, passport: computeToggledPassport(prev.passport, id) }));
        postJson<{ passport: FinancialPassport }>("/api/passport/checklist", {
          itemId: id,
        }).then((data) => {
          if (data) setState((prev) => ({ ...prev, passport: data.passport }));
        });
      },
      recordPurposeTransaction: () => {
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
              nextLevelChecklist: checklist,
              paymentHistory: [...prev.passport.paymentHistory, { month: "…", onTime: true }],
            },
          };
        });
        postJson<{ passport: FinancialPassport }>("/api/passport/purpose-transaction", {}).then(
          (data) => {
            if (data) setState((prev) => ({ ...prev, passport: data.passport }));
          }
        );
      },
      unlockLimit: (amount) => {
        setState((prev) => ({
          ...prev,
          passport: { ...prev.passport, currentLimit: prev.passport.currentLimit + amount },
        }));
        postJson<{ passport: FinancialPassport }>("/api/passport/unlock", { amount }).then(
          (data) => {
            if (data) setState((prev) => ({ ...prev, passport: data.passport }));
          }
        );
      },
      setLanguage: (language) => {
        setState((prev) => ({ ...prev, profile: { ...prev.profile, language } }));
        postJson("/api/language", { language });
      },
      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
      },
    }),
    [state]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
