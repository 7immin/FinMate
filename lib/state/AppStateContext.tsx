"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  AppNotification,
  AppState,
  DocumentFlags,
  FinancialPassport,
  Language,
  NotificationSettings,
  PurposeCategory,
} from "@/lib/types";
import { LEVEL_CONFIG, cloneChecklist, nextLevel } from "@/lib/mock/passport-levels";
import { PassportRow, toPassportState } from "@/lib/server/passport";
import { createClient } from "@/lib/supabase/client";

interface AppStateContextValue {
  state: AppState;
  setDocumentFlag: (key: keyof DocumentFlags, value: "yes" | "no" | "unknown") => void;
  toggleChecklistItem: (id: string) => void;
  setPassportState: (passport: FinancialPassport) => void;
  setDocumentsState: (documents: DocumentFlags) => void;
  requestLimit: (
    amount: number,
    purpose: PurposeCategory,
    evidence?: string,
    evidencePath?: string | null
  ) => void;
  pendingRequests: PendingRequest[];
  /** DB에서 처음 불러오기 전이면 false. 목록이 비어 있는 것과 구분해야
   *  "아직 모른다"를 "0건"으로 잘못 단언하지 않는다. */
  pendingRequestsLoaded: boolean;
  setLanguage: (language: Language) => void;
  setNotificationSettings: (settings: NotificationSettings) => void;
  markNotificationsRead: () => void;
  signOut: () => Promise<void>;
}

/** 이번 세션에 올린 한도 요청 한 건. */
export interface PendingRequest {
  id: string;
  amount: number;
  purpose: PurposeCategory;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
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

interface LimitRequestApiRow {
  id: string;
  amount: number;
  purpose: PurposeCategory;
  status: PendingRequest["status"];
  created_at: string;
}

function toPendingRequest(r: LimitRequestApiRow): PendingRequest {
  return { id: r.id, amount: r.amount, purpose: r.purpose, status: r.status, createdAt: r.created_at };
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
  // 올린 한도 요청.
  //
  // 예전에는 이번 세션에 올린 것만 메모리에 들고 있었다. 그래서 새로고침
  // 한 번이면 "승인 대기" 줄이 통째로 사라졌다 — 사용자는 요청이 없어진
  // 줄 안다. DB에서 읽어 오고, 승인·거절 결과까지 함께 보여준다.
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [pendingLoaded, setPendingLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/limit-requests")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.requests) return;
        setPending((data.requests as LimitRequestApiRow[]).map(toPendingRequest));
      })
      .catch(() => {
        // 못 읽으면 빈 목록으로 둔다. 요청 자체는 서버에 남아 있다.
      })
      .finally(() => {
        if (!cancelled) setPendingLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  /**
   * 탭을 다시 볼 때 상태를 한 번 더 불러오는 안전망.
   *
   * realtime 구독은 채널이 막 연결된 직후처럼 아주 좁은 틈에서 이벤트를
   * 놓칠 수 있다 -- 구독 자체는 실패하지 않았는데 그 틈으로 지나간
   * 이벤트만 못 받는 경우다. 탭이 백그라운드에 있다가 돌아오는 순간
   * (visibilitychange) 이나 창이 다시 포커스를 받는 순간(focus) 한 번
   * 더 불러오면, 놓친 이벤트가 있어도 그 순간 메꿔진다.
   */
  useEffect(() => {
    function resync() {
      if (document.visibilityState === "hidden") return;
      fetch("/api/state/sync")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.state) setState(data.state);
        })
        .catch(() => {
          // 실패해도 다음 포커스/가시성 전환에서 다시 시도된다.
        });
      // "승인 대기" 줄도 같이 -- financial_passports/notifications와
      // 별도로 관리되는 상태라 위 호출만으로는 안 채워진다.
      fetch("/api/limit-requests")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.requests) setPending((data.requests as LimitRequestApiRow[]).map(toPendingRequest));
        })
        .catch(() => {});
    }
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
    };
  }, []);

  // 은행 승인은 서비스 롤이 다른 화면(창구 콘솔)에서 직접 DB를 바꾸는
  // 방식이라, 새로고침 전까지는 학생 화면이 그 변화를 알 길이 없었다.
  // financial_passports/notifications가 바뀌는 순간을 postgres_changes로
  // 직접 구독해서, 승인되는 즉시 한도와 알림 배지가 반영되게 한다.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`app-state-${state.userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: AppNotification["type"];
            payload: AppNotification["payload"];
            read_at: string | null;
            created_at: string;
          };
          const notification: AppNotification = {
            id: row.id,
            type: row.type,
            payload: row.payload,
            readAt: row.read_at,
            createdAt: row.created_at,
          };
          setState((prev) => ({
            ...prev,
            unreadNotificationCount: prev.unreadNotificationCount + 1,
            notifications: [notification, ...prev.notifications],
          }));
        }
      )
      // 금융여권 화면의 "승인 대기" 줄은 pendingRequests(이 컴포넌트가 따로
      // 들고 있는 상태)를 그린다 -- financial_passports/notifications만
      // 구독해서는 승인·거절 뱃지가 바뀌지 않는다. limit_requests 자체의
      // status가 바뀌는 순간도 같이 구독해야 한다.
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "limit_requests",
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; status: PendingRequest["status"] };
          setPending((prev) => prev.map((req) => (req.id === row.id ? { ...req, status: row.status } : req)));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "financial_passports",
          filter: `user_id=eq.${state.userId}`,
        },
        (payload) => {
          setState((prev) => ({ ...prev, passport: toPassportState(payload.new as PassportRow) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.userId]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      pendingRequests: pending,
      pendingRequestsLoaded: pendingLoaded,
      setDocumentFlag: (key, docValue) => {
        setState((prev) => ({ ...prev, documents: { ...prev.documents, [key]: docValue } }));
        postJson<{ documents: DocumentFlags }>("/api/documents", { [key]: docValue }).then(
          (data) => {
            if (data) setState((prev) => ({ ...prev, documents: data.documents }));
          }
        );
      },
      /**
       * 체크리스트 항목 표시.
       *
       * 서버가 거절하면 되돌린다. 예전에는 낙관적으로 켜 두기만 하고
       * 실패를 무시해서, 서버가 "사실에서 판정되는 항목이라 못 켠다"고
       * 400을 돌려줘도 화면에는 켜진 채로 남았다 — 새로고침하면 풀리는
       * 체크가 등급이 오른 것처럼 보였다.
       */
      toggleChecklistItem: (id) => {
        const before = state.passport;
        setState((prev) => ({ ...prev, passport: computeToggledPassport(prev.passport, id) }));
        postJson<{ passport: FinancialPassport }>("/api/passport/checklist", {
          itemId: id,
        }).then((data) => {
          setState((prev) => ({ ...prev, passport: data ? data.passport : before }));
        });
      },
      // /api/passport/verify already did the real work (OCR + marking the
      // item done) before this is called -- this just adopts the server's
      // response instead of guessing at an optimistic update client-side.
      setPassportState: (passport) => {
        setState((prev) => ({ ...prev, passport }));
      },
      // 여권 실물 확인(OCR)이 성공하면 내 정보 > 보유 서류의 자기 신고
      // 값도 같이 옮겨야 한다 -- 서버가 이미 두 테이블을 다 갱신했으니
      // 여기서는 그 결과를 그대로 반영하기만 한다.
      setDocumentsState: (documents) => {
        setState((prev) => ({ ...prev, documents }));
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
          createdAt: new Date().toISOString(),
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
      // 알림 목록을 열어 본 순간 배지를 지운다. 서버에도 같은 뜻으로
      // 전부 읽음 처리하도록 알린다 -- 실패해도 다음에 다시 열면 또
      // 시도되므로 응답을 기다리지 않는다.
      markNotificationsRead: () => {
        setState((prev) => ({ ...prev, unreadNotificationCount: 0 }));
        postJson("/api/notifications/feed", {});
      },
      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
      },
    }),
    [state, pending, pendingLoaded]
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
