import { createClient } from "@/lib/supabase/server";
import { AppState, ChecklistItem, PaymentRecord, PurposeCategory } from "@/lib/types";

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
  };
  passport: {
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

  const { profile, passport, documents } = data;

  const state: AppState = {
    profile: {
      name: profile.name,
      nationality: profile.nationality as AppState["profile"]["nationality"],
      nationalityCode: profile.nationality_code,
      visaStatus: profile.visa_status,
      school: profile.school as AppState["profile"]["school"],
      arrivalLabel: profile.arrival_label,
      language: profile.language as AppState["profile"]["language"],
    },
    passport: {
      level: passport.level as AppState["passport"]["level"],
      currentLimit: passport.current_limit,
      nextLevelChecklist: passport.next_level_checklist,
      paymentHistory: passport.payment_history,
      purposeCounts: passport.purpose_counts ?? {},
      verificationCode: passport.verification_code,
    },
    documents: {
      hasPassport: documents.has_passport as AppState["documents"]["hasPassport"],
      hasAlienRegistration: documents.has_alien_registration as AppState["documents"]["hasAlienRegistration"],
      hasKoreanPhone: documents.has_korean_phone as AppState["documents"]["hasKoreanPhone"],
    },
  };

  return { onboarded: true, state };
}
