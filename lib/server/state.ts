import { createClient } from "@/lib/supabase/server";
import { AppState, ChecklistItem, PaymentRecord, PurposeCategory } from "@/lib/types";
import { applyLevelUpIfComplete, PassportRow, toPassportState } from "@/lib/server/passport";

interface FetchResult {
  onboarded: boolean;
  state: AppState | null;
}

interface FullStateRow {
  profile: {
    name: string;
    nationality: string;
    nationality_code: string;
    visa_status: string;
    school: string;
    arrival_label: string;
    language: string;
    notification_settings: {
      paymentDue: boolean;
      passportLevel: boolean;
      marketing: boolean;
    };
  };
  passport: {
    user_id: string;
    level: string;
    current_limit: number;
    next_level_checklist: ChecklistItem[];
    payment_history: PaymentRecord[];
    purpose_counts: Partial<Record<PurposeCategory, number>>;
    verification_code: string;
  };
  documents: {
    has_passport: string;
    has_alien_registration: string;
    has_korean_phone: string;
  };
}

export async function fetchAppState(): Promise<FetchResult> {
  const supabase = createClient();

  // Single round trip -- auth.uid() inside the function reads the session
  // already carried by the request's cookies, so there's no separate
  // getUser() call needed here (middleware already gated unauthenticated
  // requests before this ever runs).
  const { data } = await supabase.rpc("get_full_state").maybeSingle<FullStateRow>();

  if (!data) return { onboarded: false, state: null };

  const { profile, documents } = data;

  // A count-only query (head: true) never transfers row data, so this stays
  // cheap even as the notification history grows.
  const { count: unreadNotificationCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", data.passport.user_id)
    .is("read_at", null);

  // 은행 승인이 다른 요청 안에서 이미 캐스케이드를 돌리지만, 레이아웃
  // 마운트는 그 요청을 거치지 않고 RPC에서 바로 읽으므로 여기서도 한 번
  // 더 확인해 둔다. user_id는 get_full_state()가 모든 컬럼을 jsonb로
  // 내려 줄 때 같이 딸려 온다.
  const passportRow = data.passport as unknown as PassportRow;
  const passport = await applyLevelUpIfComplete(supabase, data.passport.user_id, passportRow);

  const state: AppState = {
    userId: data.passport.user_id,
    profile: {
      name: profile.name,
      nationality: profile.nationality as AppState["profile"]["nationality"],
      nationalityCode: profile.nationality_code,
      visaStatus: profile.visa_status,
      school: profile.school as AppState["profile"]["school"],
      arrivalLabel: profile.arrival_label,
      language: profile.language as AppState["profile"]["language"],
      notificationSettings: profile.notification_settings,
    },
    // 체크리스트는 저장된 값을 그대로 쓰지 않는다. "연체 정리"나 "목적
    // 거래"는 사실에서 판정되는 항목이라, 읽을 때마다 다시 계산해야 연체가
    // 새로 생기거나 승인이 취소됐을 때 되돌아간다 (deriveChecklist,
    // toPassportState 안에서 호출됨).
    passport: toPassportState(passport),
    documents: {
      hasPassport: documents.has_passport as AppState["documents"]["hasPassport"],
      hasAlienRegistration: documents.has_alien_registration as AppState["documents"]["hasAlienRegistration"],
      hasKoreanPhone: documents.has_korean_phone as AppState["documents"]["hasKoreanPhone"],
    },
    unreadNotificationCount: unreadNotificationCount ?? 0,
  };

  return { onboarded: true, state };
}
