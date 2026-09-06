"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import {
  AppState,
  DocumentFlags,
  FinancialPassport,
  Language,
  NotificationSettings,
  PurposeCategory,
} from "@/lib/types";
import { LEVEL_CONFIG, cloneChecklist, nextLevel } from "@/lib/mock/passport-levels";
import { createClient } from "@/lib/supabase/client";

interface AppStateContextValue {
  state: AppState;
  setDocumentFlag: (key: keyof DocumentFlags, value: "yes" | "no" | "unknown") => void;
  toggleChecklistItem: (id: string) => void;
  requestLimit: (
    amount: number,
    purpose: PurposeCategory,
    evidence?: string,
    evidencePath?: string | null
  ) => void;
  pendingRequests: PendingRequest[];
  setLanguage: (language: Language) => void;
  setNotificationSettings: (settings: NotificationSettings) => void;
  signOut: () => Promise<void>;
}

/** 이번 세션에 올린 한도 요청 한 건. */
export interface PendingRequest {
  id: string;
  amount: number;
  purpose: PurposeCategory;
  status: "pending";
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
  // 이번 세션에 올린 요청. 승인 여부는 은행이 정하므로 여기서는 "올렸다"는
  // 사실만 들고 있다가 화면에 되돌려 준다.
  const [pending, setPending] = useState<PendingRequest[]>([]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      pendingRequests: pending,
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
      /**
       * 한도 열기 요청.
       *
       * 한도를 낙관적으로 올리지 않는다. 이 앱이 할 수 있는 일은 요청까지고,
       * 실제로 여는 것은 은행이다. 화면에서만 먼저 올려 두면 사용자는
       * 창구에 가서야 아직 안 열렸다는 것을 알게 된다 — 그 순간이 이
       * 제품이 없애려던 바로 그 순간이다.
       */
      requestLimit: (amount, purpose, evidence, evidencePath) => {
        const optimistic: PendingRequest = {
          id: `local-${Date.now()}`,
          amount,
          purpose,
          status: "pending",
        };
        setPending((prev) => [optimistic, ...prev]);
        postJson<{ request: { id: string } }>("/api/passport/unlock", {
          amount,
          purpose,
          evidence,
          evidencePath,
        }).then((data) => {
          if (!data) return;
          setPending((prev) =>
            prev.map((req) => (req.id === optimistic.id ? { ...req, id: data.request.id } : req))
          );
        });
      },
      setLanguage: (language) => {
        setState((prev) => ({ ...prev, profile: { ...prev.profile, language } }));
        postJson("/api/language", { language });
      },
      setNotificationSettings: (settings) => {
        setState((prev) => ({ ...prev, profile: { ...prev.profile, notificationSettings: settings } }));
        postJson<{ notificationSettings: NotificationSettings }>("/api/notifications", settings).then(
          (data) => {
            if (data) {
              setState((prev) => ({
                ...prev,
                profile: { ...prev.profile, notificationSettings: data.notificationSettings },
              }));
            }
          }
        );
      },
      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
      },
    }),
    [state, pending]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

/**
 * 프로바이더 바깥에서도 부를 수 있는 판.
 *
 * 로그인 전 화면((app) 그룹 밖)에도 번역이 필요한데, useAppState는 없으면
 * 던진다. 번역 훅이 "로그인 상태면 프로필 언어, 아니면 게스트 언어"를
 * 고를 수 있도록 null을 돌려주는 문을 하나 낸다.
 */
export function useOptionalAppState() {
  return useContext(AppStateContext);
}
