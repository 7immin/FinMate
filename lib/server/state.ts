import { createClient } from "@/lib/supabase/server";
import { AppState, ChecklistItem, PaymentRecord, PurposeCategory } from "@/lib/types";

interface FetchResult {
  onboarded: boolean;
  state: AppState | null;
}

export async function fetchAppState(): Promise<FetchResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { onboarded: false, state: null };

  const [{ data: profile }, { data: passport }, { data: documents }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("financial_passports").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("document_flags").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!profile || !passport || !documents) {
    return { onboarded: false, state: null };
  }

  const state: AppState = {
    profile: {
      name: profile.name,
      nationality: profile.nationality,
      nationalityCode: profile.nationality_code,
      visaStatus: profile.visa_status,
      school: profile.school,
      arrivalLabel: profile.arrival_label,
      language: profile.language,
    },
    passport: {
      level: passport.level,
      currentLimit: passport.current_limit,
      nextLevelChecklist: passport.next_level_checklist as ChecklistItem[],
      paymentHistory: passport.payment_history as PaymentRecord[],
      purposeCounts: (passport.purpose_counts ?? {}) as Partial<Record<PurposeCategory, number>>,
    },
    documents: {
      hasPassport: documents.has_passport,
      hasAlienRegistration: documents.has_alien_registration,
      hasKoreanPhone: documents.has_korean_phone,
    },
  };

  return { onboarded: true, state };
}
